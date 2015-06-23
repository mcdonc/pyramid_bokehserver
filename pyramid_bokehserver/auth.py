import logging
import json
import uuid

from pyramid.renderers import render_to_response
from pyramid.httpexceptions import HTTPFound

from pyramid.security import (
    remember,
    forget,
    )
from pyramid.authentication import SessionAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy

from .models import user, docs, convenience
from .models import UnauthorizedException

logger = logging.getLogger(__name__)

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
        raise NotImplementedError

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

    def current_user_name(self, request):
        # below attribute access delegates to self.unauthenticated_userid
        # if there is a default username set, this will always return
        # the default username # XXX should get rid of this API
        return self.authenticated_userid(request)

    def current_user(self, request):
        """returns bokeh User object matching current username.
        If the user does not exist and a default username is set, one will
        be created.
        """
        username = self.authenticated_userid(request)
        bokehuser = user.User.load(
            request.registry.servermodel_storage,
            username
            )
        if (bokehuser is None) and (self.default_username is not None):
            bokehuser = user.new_user(
                request.registry.servermodel_storage,
                self.default_username,
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
        if self.default_username is not None:
            return self.default_username
        bokehuser = user.apiuser_from_request(request)
        if bokehuser:
            return bokehuser.username
        return request.session.get(self.userid_key)

class BokehAuthorizationPolicy(ACLAuthorizationPolicy):
    def _is_defaultuser(self, request):
        default_username = request.registry.default_username
        if not default_username:
            return False
        current_username = request.authenticated_userid
        return default_username == current_username

    def can_write_doc(
        self, request, doc_or_docid, temporary_docid=None, userobj=None
        ):
        if userobj is None and self._is_defaultuser(request):
            return True
        if not isinstance(doc_or_docid, docs.Doc):
            doc = docs.Doc.load(
                request.registry.servermodel_storage,
                doc_or_docid
                )
        else:
            doc = doc_or_docid
        if userobj is None:
            userobj = request.current_user()
        return convenience.can_write_from_request(
            doc, request, userobj,
            temporary_docid=temporary_docid
            )

    def can_read_doc(
        self, request, doc_or_docid, temporary_docid=None, userobj=None
        ):
        if userobj is None and self._is_defaultuser(request):
            return True
        if not isinstance(doc_or_docid, docs.Doc):
            doc = docs.Doc.load(
                request.registry.servermodel_storage, doc_or_docid
                )
        else:
            doc = doc_or_docid
        if userobj is None:
            userobj = request.current_user()
        return convenience.can_read_from_request(doc, request, userobj)
