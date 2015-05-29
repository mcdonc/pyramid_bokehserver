from __future__ import absolute_import

import logging
log = logging.getLogger(__name__)

import os
import uuid

from pyramid.httpexceptions import (
    HTTPConflict,
    HTTPFound,
    HTTPNotFound,
    )
from pyramid.renderers import render_to_response
from pyramid.response import FileResponse
from pyramid.view import view_config

from six import string_types

from bokeh import protocol
from bokeh.exceptions import DataIntegrityException
from bokeh.resources import Resources
from bokeh.templates import AUTOLOAD

from .bbauth import handle_auth_error
from ..crossdomain import crossdomain
from ..models import docs
from ..models import user
from ..serverbb import prune, BokehServerTransaction, get_temporary_docid
from ..views import make_json
from ..views.decorators import login_required

def request_resources(request):
    """Creates resources instance based on url info from
    current app/request context
    """
    url_prefix = request.registry.url_prefix
    if url_prefix:
        # strip of leading slash
        root_url  = request.host_url + url_prefix[1:]
    else:
        root_url  = request.host_url
    resources = Resources(root_url=root_url, mode='server')
    return resources

def render(request, fname, **kwargs):
    resources = request_resources(request)
    info = {}
    bokeh_prefix = resources.root_url
    info['bokeh_prefix'] = bokeh_prefix
    info.update(kwargs)
    return render_to_response(fname, info, request=request)

@view_config(route_name='bokeh.ping')
def ping(request):
    ''' Test whether Bokeh server is up.

    :status 200:

    '''
    # test route, to know if the server is up
    request.response.text = "pong"
    return request.response

@view_config(route_name='bokeh.root')
@view_config(route_name='bokeh.index')
def index(request):
    ''' Render main page.

    :status 200: if current user logged in
    :status 302: otherwise redirect to login

    '''
    bokehuser = request.current_user()
    if not bokehuser:
        url = request.route_url('bokeh.login')
        return HTTPFound(location=url)
    return render(
        request,
        'pyramid_bokehserver:templates/bokeh.html',
        splitjs=request.registry.bokehserver_settings.splitjs,
        username=bokehuser.username,
        title="Bokeh Documents for %s" % bokehuser.username
        )

@view_config(route_name='bokeh.favicon')
def favicon(request):
    ''' Return favicon.

    :status 200: return favicon

    '''
    here = os.path.dirname(__file__)
    path = os.path.normpath(os.path.join(here, '..', 'static', 'favicon.ico'))
    return FileResponse(path, content_type='image/x-icon', request=request)

def _makedoc(request, redisconn, u, title):
    docid = str(uuid.uuid4())
    if isinstance(u, string_types):
        u = user.User.load(redisconn, u)
    clientdoc = request.registry.backbone_storage.get_document(docid)
    prune(request, clientdoc)
    if u is not None:
        rw_users = [u.username]
        u.add_doc(docid, title)
        u.save(redisconn)
    else:
        #anonyomus user case
        rw_users = []
    doc = docs.new_doc(request, docid,
                       title, clientdoc,
                       rw_users=rw_users)
    request.registry.backbone_storage.store_document(clientdoc)
    return doc

@view_config(
    route_name='bokeh.docs',
    request_method='POST',
    renderer='json',
    decorator=login_required
    )
def makedoc(request):
    json_body = request.json_body
    if json_body:
        title = json_body['title']
    else:
        title = request.params['title']
    bokehuser = request.current_user()
    try:
        _makedoc(request.registry.servermodel_storage, bokehuser, title)
    except DataIntegrityException as e:
        return HTTPConflict(e.message)
    jsonstring = protocol.serialize_web(bokehuser.to_public_json())
    msg = protocol.serialize_web({'msgtype' : 'docchange'})
    request.registry.publisher.send("bokehuser:" + bokehuser.username, msg)
    return jsonstring

@view_config(
    route_name='bokeh.doc',
    request_method='DELETE',
    renderer='json',
    decorator=login_required
    )
def deletedoc(request):
    docid = request.matchdict['docid']
    bokehuser = request.current_user()
    try:
        bokehuser.remove_doc(docid)
        bokehuser.save(request.registry.servermodel_storage)
    except DataIntegrityException as e:
        return HTTPConflict(e.message)
    jsonstring = protocol.serialize_web(bokehuser.to_public_json())
    msg = protocol.serialize_web({'msgtype' : 'docchange'})
    request.registry.publisher.send("bokehuser:" + bokehuser.username, msg)
    return jsonstring

@view_config(
    route_name='bokeh.getdocapikey',
    renderer='json',
    decorator=handle_auth_error
    )
def get_doc_api_key(request):
    docid = request.matchdict['docid']
    doc = docs.Doc.load(request.registry.servermodel_storage, docid)
    bokehuser = request.current_user()
    t = BokehServerTransaction(request, bokehuser, doc, 'auto')
    if t.mode == 'rw':
        return {'apikey' : t.server_docobj.apikey}
    else:
        return {'readonlyapikey' : t.server_docobj.readonlyapikey}


@view_config(
    route_name='bokeh.userinfo',
    request_method=('GET', 'OPTIONS'),
    renderer='json',
    decorator=(login_required, crossdomain(origin='*', headers=None))
    )
def get_user(request):
    bokehuser = request.current_user()
    content = protocol.serialize_web(bokehuser.to_public_json())
    return content

@view_config(
    route_name='bokeh.info',
    request_method=('GET', 'OPTIONS'),
    renderer='json',
    decorator=(handle_auth_error, crossdomain(origin='*', headers=None))
    )
@view_config(
    route_name='bokeh.doc',
    request_method=('GET', 'OPTIONS'),
    decorator=(handle_auth_error, crossdomain(origin='*', headers=None))
    )
def get_bokeh_info(request):
    docid = request.matchdict['docid']
    return _get_bokeh_info(request, docid)

def _get_bokeh_info(request, docid):
    doc = docs.Doc.load(request.registry.servermodel_storage, docid)
    bokehuser = request.current_user()
    temporary_docid = get_temporary_docid(request, docid)
    t = BokehServerTransaction(
        request,
        bokehuser,
        doc,
        'r',
        temporary_docid=temporary_docid
    )
    t.load()
    clientdoc = t.clientdoc
    all_models = clientdoc._models.values()
    log.info("num models: %s", len(all_models))
    all_models = clientdoc.dump(*all_models)
    returnval = {'plot_context_ref' : doc.plot_context_ref,
                 'docid' : docid,
                 'all_models' : all_models,
                 'apikey' : t.apikey}
    returnval = protocol.serialize_json(returnval)
    #i don't think we need to set the header here...
    result = make_json(returnval,
                       headers={"Access-Control-Allow-Origin": "*"})
    return result


@view_config(
    route_name='bokeh.showdoc',
    request_method=('GET', 'OPTIONS'),
    decorator=(login_required, crossdomain(origin='*', headers=None))
    )
def show_doc_by_title(request):
    title = request.matchdict['title']
    bokehuser = request.current_user()
    docs = [ doc for doc in bokehuser.docs if doc['title'] == title ]
    if len(docs) != 0:
        doc = docs[0]
    else:
        return HTTPNotFound()
    docid = doc['docid']
    return render(
        request,
        'pyramid_bokehserver:templates/show.html',
        title=title,
        docid=docid,
        splitjs=request.registry.bokehserver_settings.splitjs,
        )

@view_config(
    route_name='bokeh.docs',
    request_method=('GET', 'OPTIONS'),
    decorator=(login_required, crossdomain(origin='*', headers=None))
    )
def doc_by_title(request):
    json_body = request.json_body
    if json_body:
        title = json_body['title']
    else:
        title = request.params['title']
    bokehuser = request.current_user()
    docs = [doc for doc in bokehuser.docs if doc['title'] == title]
    if len(docs) == 0:
        try:
            doc = _makedoc(
                request, request.registry.servermodel_storage, bokehuser, title
                )
            docid = doc.docid
        except DataIntegrityException as e:
            return HTTPConflict(e.message)
        msg = protocol.serialize_web({'msgtype' : 'docchange'})
        request.registry.publisher.send("bokehuser:" + bokehuser.username, msg)
    else:
        doc = docs[0]
        docid = doc['docid']
    return _get_bokeh_info(request, docid)


@view_config(route_name='bokeh.sampleerror')
def sampleerror(request):
    return 1 + "sdf"


@view_config(route_name='bokeh.autoloadjs')
def autoload_js(request):
    ''' Return autoload script for given elementid

    :param elementid: DOM element ID to target

    :status 200: return script

    '''
    elementid = request.matchdict['elementid']
    resources = request_resources(request)
    rendered = AUTOLOAD.render(
        js_url = resources.js_files[0],
        css_files = resources.css_files,
        elementid = elementid,
    )
    return make_json(
        rendered,
        content_type='application/javascript',
        )

@view_config(
    route_name='bokeh.objinfo',
    request_method=('GET', 'OPTIONS'),
    decorator=(handle_auth_error, crossdomain(origin='*', headers=None))
    )
def get_bokeh_info_one_object(request):
    docid = request.matchdict['docid']
    objid = request.matchdict['objid']
    doc = docs.Doc.load(request.registry.servermodel_storage, docid)
    bokehuser = request.current_user()
    temporary_docid = get_temporary_docid(request, docid)
    t = BokehServerTransaction(
        request, bokehuser, doc, 'r', temporary_docid=temporary_docid
    )
    t.load()
    clientdoc = t.clientdoc
    obj = clientdoc._models[objid]
    objs = obj.references()
    all_models = clientdoc.dump(*objs)
    returnval = {'plot_context_ref' : doc.plot_context_ref,
                 'docid' : docid,
                 'all_models' : all_models,
                 'apikey' : t.apikey,
                 'type' : obj.__view_model__
    }
    returnval = protocol.serialize_json(returnval)
    result = make_json(returnval,
                       headers={"Access-Control-Allow-Origin": "*"})
    return result

@view_config(
    route_name='bokeh.showobj',
    request_method='GET',
    renderer='pyramid_bokehserver:template/oneobj.html',
    )
def show_obj(request):
    docid = request.matchdict['docid']
    objid = request.matcdict['objid']
    bokehuser = request.current_user()
    doc = docs.Doc.load(request.registry.servermodel_storage, docid)
    if not bokehuser and not doc.published:
        login_url = request.route_url(
            'bokeh.login', _query=('next', request.url))
        return HTTPFound(location=login_url)
    resources = request_resources(request)
    public = request.values.get('public', 'false').lower() == 'true'
    if public:
        public = 'true'
    else:
        public = 'false'
    info = dict(
        elementid=str(uuid.uuid4()),
        docid=docid,
        objid=objid,
        public=public,
        hide_navbar=True,
        splitjs=request.reigstry.bokehserver_settings.splitjs,
        loglevel=resources.log_level
        )
    return info

@view_config(
    route_name='bokeh.wsurl',
#    request_method=('GET', 'OPTIONS'),
    renderer='string',
    decorator=crossdomain(origin="*", headers=None)
    )
def wsurl(request):
    server_settings = request.registry.bokehserver_settings
    if server_settings.ws_conn_string:
        return server_settings.ws_conn_string
    if request.scheme == "http":
        scheme = 'ws'
    else:
        scheme = 'wss'
    url = "%s://%s%s" % (scheme,
                         request.host,
                         server_settings.url_prefix + "/bokeh/sub")
    return url
