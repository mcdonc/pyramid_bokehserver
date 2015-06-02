from __future__ import absolute_import

import logging

from pyramid.httpexceptions import HTTPUnauthorized
from pyramid.view import view_config

from ..models import docs
from bokeh.exceptions import AuthenticationException

logger = logging.getLogger(__name__)

@view_config(context=AuthenticationException)
def handle_auth_error(request):
    """Watches for AuthenticationException
    If one is thrown, log and abort 401 instead
    """
    logger.exception(request.exception)
    return HTTPUnauthorized()

@view_config(route_name='bokeh.login', request_method='GET')
def login_get(request):
    ''' Log in a user from a form.

    :status 200: render login view

    '''
    return request.registry.authentication.login_get(request)

@view_config(route_name='bokeh.login', request_method='POST')
def login_post(request):
    ''' Log in user from a submission.

    :status 200: if API flag set, log in status
    :status 302: if API flag not set, redirect to index on
        success, to login on failue

    '''
    return request.registry.authentication.login_post(request)

@view_config(route_name='bokeh.loginfromapikey', request_method='GET')
def login_from_apikey(request):
    ''' Log in a user from an API key.

    :status 302: redirect to index on success, to login on failure

    '''
    return request.registry.authentication.login_from_apikey(request)

@view_config(route_name='bokeh.register', request_method='GET')
def register_get(request):
    ''' Register a new user via a view.

    :status 200: render registration form

    '''
    return request.registry.authentication.register_get(request)

@view_config(route_name='bokeh.register', request_method='POST')
def register_post(request):
    ''' Register a new user via a submission.

    :status 200: registration result

    '''
    return request.registry.authentication.register_post(request)

@view_config(route_name='bokeh.logout')
def logout(request):
    ''' Log out the current user.

    :status 302: redirect to index

    '''
    return request.registry.authentication.logout(request)

@view_config(route_name='bokeh.publish', request_method='POST', renderer='json')
def publish(request):
    docid = request.matchdict['docid']
    doc = docs.Doc.load(request.registry.servermodel_storage, docid)
    if not request.registry.authorization.can_write_doc(request, docid):
        return HTTPUnauthorized()
    doc.published = True
    doc.save(request.registry.servermodel_storage)
    return dict(status='success')
