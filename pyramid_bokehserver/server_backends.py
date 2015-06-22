from __future__ import absolute_import, print_function

import logging
logger = logging.getLogger(__name__)

import json
import shelve
import uuid

from pyramid.renderers import render_to_response
from pyramid.httpexceptions import HTTPFound
from pyramid.security import (
    remember,
    forget,
    )
from pyramid.authentication import SessionAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy

from bokeh.exceptions import DataIntegrityException
from bokeh.util.string import encode_utf8, decode_utf8

from .models import user, docs, convenience
from .models import UnauthorizedException

class AbstractServerModelStorage(object):
    """Storage class for server side models (non backbone, that would be
    document and user classes)
    """
    def get(self, key):
        """given a key returns json objects"""
        raise NotImplementedError

    def set(self, key, val):
        """given a key and a json object, saves it"""
        raise NotImplementedError

    def create(self, key, val):
        """given a key and a json object, saves it
        differs from set because this method should check
        to make sure the object doesn't already exist
        """
        raise NotImplementedError

class RedisServerModelStorage(object):
    def __init__(self, redisconn):
        self.redisconn = redisconn

    def get(self, key):
        data = self.redisconn.get(key)
        if data is None:
            return None
        attrs = json.loads(data.decode('utf-8'))
        return attrs

    def set(self, key, val):
        self.redisconn.set(key, json.dumps(val))

    def create(self, key, val):
        with self.redisconn.pipeline() as pipe:
            pipe.watch(key)
            pipe.multi()
            if self.redisconn.exists(key):
                raise DataIntegrityException("%s already exists" % key)
            else:
                pipe.set(key, json.dumps(val))
            pipe.execute()

class InMemoryServerModelStorage(object):
    def __init__(self):
        self._data = {}

    def get(self, key):
        data = self._data.get(key, None)
        if data is None:
            return None
        attrs = json.loads(decode_utf8(data))
        return attrs

    def set(self, key, val):
        self._data[key] = json.dumps(val)

    def create(self, key, val):
        if key in self._data:
            raise DataIntegrityException("%s already exists" % key)
        self._data[key] = json.dumps(val)

class ShelveServerModelStorage(object):

    def get(self, key):
        _data = shelve.open('bokeh.server')
        key = encode_utf8(key)
        data = _data.get(key, None)
        if data is None:
            return None
        attrs = json.loads(decode_utf8(data))
        _data.close()
        return attrs

    def set(self, key, val):
        _data = shelve.open('bokeh.server')
        key = encode_utf8(key)
        _data[key] = json.dumps(val)
        _data.close()

    def create(self, key, val):
        key = str(key)
        _data = shelve.open('bokeh.server')
        if key in _data:
            raise DataIntegrityException("%s already exists" % key)
        _data[key] = json.dumps(val)
        _data.close()

class AbstractAuthentication(object):
    def current_user_name(self, request):
        """obtain current user name from the request object
        """
        raise NotImplementedError
    def login(self, request, username):
        """login the user, sets whatever request information is necessary
        """
        raise NotImplementedError

    def logout(self, request):
        """logs out the user, sets whatever request information is necessary
        """
        raise NotImplementedError

    def current_user(self, request):
        """returns bokeh User object from self.current_user_name
        """
        username = self.current_user_name()
        if username is None:
            return None
        bokehuser = user.User.load(
            request.registry.servermodel_storage,
            username
            )
        return bokehuser

    def login_get(self, request):
        """custom login view
        """
        raise NotImplementedError

    def login_post(self, request):
        """custom login submission. Request form will have
        username, password, and possibly an api field.
        api indicates that we are
        submitting via python, and we should try to return error
        codes rather than flash messages
        """
        raise NotImplementedError

    def login_from_apikey(self, request):
        """login URL using apikey.  This is usually generated
        by the python client
        """
        raise NotImplementedError

    def register_get(self, request):
        """custom register view
        """
        raise NotImplementedError

    def register_post(self, request):
        """custom register submission
        request form will have username, password, password_confirm,
        and possibly an api field. api indicates that we are
        submitting via python, and we should try to return error
        codes rather than flash messages
        """
        raise NotImplementedError

    def can_write_doc(self, request, docid):
        """whether or not a user can write to a doc
        """
        raise NotImplementedError

    def can_read_doc(self, request, docid):
        """whether or not a user can read a doc
        """
        raise NotImplementedError

class BokehAuthenticationPolicy(
    AbstractAuthentication,
    SessionAuthenticationPolicy,
    ):
    def __init__(
        self,
        prefix='auth.',
        callback=None,
        debug=False,
        default_username=None,
        ):
        SessionAuthenticationPolicy.__init__(
            self,
            prefix=prefix,
            callback=callback,
            debug=debug,
            )
        self.default_username = default_username

    def _is_defaultuser(self):
        default_username = self.default_username
        current_username = self.current_user_name()
        if default_username and default_username == current_username:
            return True
        return False

    def current_user_name(self, request):
        return request.authenticated_userid

    def current_user(self, request):
        """returns bokeh User object matching defaultuser
        if the user does not exist, one will be created
        """
        username = self.current_user_name(request)
        bokehuser = user.User.load(
            request.registry.servermodel_storage,
            username
            )
        if bokehuser is not None:
            return bokehuser
        if self.default_username is not None:
            bokehuser = user.new_user(
                request.registry.servermodel_storage,
                username,
                str(uuid.uuid4()),
                apikey='nokey',
                docs=[],
                )
        return bokehuser

    def print_connection_info(self, bokehuser):
        logger.info("connect using the following")
        command = "output_server(docname, username='%s', userapikey='%s')"
        command = command % (bokehuser.username, bokehuser.apikey)
        logger.info(command)

    def register_get(self, request=None):
        return render_to_response(
            'pyramid_bokehserver:templates/register.html',
            dict(title="Register"),
            request=request
            )

    def login_get(self, request=None):
        return render_to_response(
            "pyramid_bokehserver:templates/login.html",
            dict(title="Login"),
            request=request,
            )

    def register_post_api(self, request):
        username = request.POST['username']
        password = request.POST['password']
        try:
            bokehuser = user.new_user(
                request.registry.servermodel_storage, username, password
                )
            self.login(request, username)
            self.print_connection_info(bokehuser)
        except UnauthorizedException:
            return json.dumps(
                dict(status=False,
                     error="user already exists")
                )
        return json.dumps(
            dict(status=True,
                 userapikey=bokehuser.apikey)
            )

    def register_post(self, request):
        if request.POST.get('api', None):
            return self.register_post_api(request)
        username = request.POST['username']
        password = request.POST['password']
        password_confirm = request.POST['password_confirm']
        if password != password_confirm:
            request.session.flash("password and confirmation do not match")
            return HTTPFound(location=request.route_url('bokeh.register'))
        try:
            bokehuser = user.new_user(
                request.registry.servermodel_storage, username, password
                )
            self.login(request, username)
            self.print_connection_info(bokehuser)
        except UnauthorizedException:
            request.session.flash("user already exists")
            return HTTPFound(location=request.route_url('bokeh.register'))
        return HTTPFound(location=request.route_url('bokeh.index'))

    def login_post_api(self, request):
        username = request.POST['username']
        password = request.POST['password']
        try:
            bokehuser = user.auth_user(
                request.registry.servermodel_storage,
                username,
                password
                )
            self.login(request, username)
            self.print_connection_info(bokehuser)
        except UnauthorizedException:
            return json.dumps(
                dict(status=False,
                     error="incorrect login ")
                )
        return json.dumps(
            dict(status=True,
                 userapikey=bokehuser.apikey)
            )

    def login_post(self, request):
        if request.POST.get('api', None):
            return self.login_post_api(request)
        username = request.POST['username']
        password = request.POST['password']
        try:
            bokehuser = user.auth_user(request.registry.servermodel_storage,
                                       username,
                                       password=password)
            self.login(request, username)
            self.print_connection_info(bokehuser)
        except UnauthorizedException:
            request.session.flash("incorrect login exists")
            return HTTPFound(location=request.route_url('bokeh.login'))
        return HTTPFound(location=request.route_url('bokeh.index'))

    def login_from_apikey(self, request):
        username = request.params.get('username')
        apikey = request.params.get('userapikey')
        try:
            bokehuser = user.auth_user(request.registry.servermodel_storage,
                                       username,
                                       apikey=apikey)

            self.login(username)
            self.print_connection_info(bokehuser)
        except UnauthorizedException:
            request.session.flash("incorrect login")
            return HTTPFound(location=request.route_url('bokeh.login'))
        return HTTPFound(location=request.route_url('bokeh.index'))

    def login(self, request, username):
        headers = remember(request, username)
        def _login(request, response):
            for k, v in headers.items():
                response.headers[k] = v
        request.add_response_callback(_login)

    def logout(self, request):
        headers = forget(request)
        return HTTPFound(
            location=request.route_url('bokeh.index'),
            headers=headers,
            )

    # pyramid IAuthenticationPolicy methods
    def unauthenticated_userid(self, request):
        # users can be authenticated by logging in (setting the session)
        # or by setting fields in the http header (api keys, etc..)
        bokehuser = user.apiuser_from_request(request)
        if bokehuser:
            return bokehuser.username
        return request.session.get(self.userid_key, self.default_username)

class BokehAuthorizationPolicy(ACLAuthorizationPolicy):
    def can_write_doc(
        self, request, doc_or_docid, temporary_docid=None, userobj=None
        ):
        if userobj is None and self._is_defaultuser():
            return True
        if not isinstance(doc_or_docid, docs.Doc):
            doc = docs.Doc.load(
                request.registry.servermodel_storage,
                doc_or_docid
                )
        else:
            doc = doc_or_docid
        if userobj is None:
            userobj = self.current_user(request)
        return convenience.can_write_from_request(
            doc, request, userobj,
            temporary_docid=temporary_docid
            )

    def can_read_doc(
        self, request, doc_or_docid, temporary_docid=None, userobj=None
        ):
        if userobj is None and self._is_defaultuser():
            return True
        if not isinstance(doc_or_docid, docs.Doc):
            doc = docs.Doc.load(
                request.registry.servermodel_storage, doc_or_docid
                )
        else:
            doc = doc_or_docid
        if userobj is None:
            userobj = self.current_user(request)
        return convenience.can_read_from_request(doc, request, userobj)
