from __future__ import absolute_import

import logging
log = logging.getLogger(__name__)

from pyramid.view import view_config

from bokeh import protocol

from .bbauth import handle_auth_error

from ..crossdomain import crossdomain
from ..serverbb import get_temporary_docid, BokehServerTransaction
from ..views import make_json
from ..models import docs

@view_config(
    route_name='bokeh.gc',
    request_method='POST',
    renderer='json',
    decorator=handle_auth_error
    )
def gc(request):
    docid = request.matchdict['docid']
    # client = request.headers.get('client', 'python')  # todo: not used?
    servermodel_storage = request.registry.servermodel_storage
    doc = docs.Doc.load(servermodel_storage, docid)
    bokehuser = request.current_user()
    temporary_docid = get_temporary_docid(request, docid)
    t = BokehServerTransaction(
        request, bokehuser, doc, 'rw', temporary_docid=temporary_docid
    )
    t.load(gc=True)
    t.save()
    return {'status':'success'}

# bulk upsert
@view_config(
    route_name='bokeh.bulk_upsert',
    request_method='POST',
    renderer='json',
    decorator=handle_auth_error
    )
def bulk_upsert(request):
    ''' Update or insert new objects for a given :class:`Document <bokeh.document.Document>`.

    :param docid: id of the :class:`Document <bokeh.document.Document>`
        to update or insert into

    :status 200: when user is authorized
    :status 401: when user is not authorized

    '''
    # endpoint is only used by python, therefore we don't process
    # callbacks here
    docid = request.matchdict['docid']
    client = request.headers.get('client', 'python')
    servermodel_storage = request.registry.servermodel_storage
    doc = docs.Doc.load(servermodel_storage, docid)
    bokehuser = request.current_user()
    temporary_docid = get_temporary_docid(request, docid)
    t = BokehServerTransaction(
        request, bokehuser, doc, 'rw', temporary_docid=temporary_docid
    )
    t.load()
    clientdoc = t.clientdoc
    data = protocol.deserialize_json(request.data.decode('utf-8'))
    if client == 'python':
        clientdoc.load(*data, events='none', dirty=True)
    else:
        clientdoc.load(*data, events='existing', dirty=True)
    t.save()
    msg = ws_update(request, clientdoc, t.write_docid, t.changed)
    return msg

def ws_update(request, clientdoc, docid, models):
    log.debug("sending wsupdate to %s", docid)
    attrs = clientdoc.dump(*models)
    msg = protocol.serialize_json({'msgtype' : 'modelpush',
                                   'modelspecs' : attrs
                               })
    request.registry.publisher.send("bokehplot:" + docid, msg)
    return msg

def ws_delete(request, clientdoc, docid, models):
    attrs = clientdoc.dump(*models)
    msg = {
        'msgtype'    : 'modeldel',
        'modelspecs' : attrs,
    }
    msg = protocol.serialize_json(msg)
    request.registry.wsmanager.send("bokehplot:" + docid, msg)
    return msg

# backbone functionality
@view_config(
    route_name='bokeh.create',
    request_method='POST',
    renderer='json',
    decorator=handle_auth_error
    )
def create(request):
    ''' Update or insert new objects for a given :class:`Document <bokeh.document.Document>`.

    :param docid: id of the :class:`Document <bokeh.document.Document>`
        to update or insert into

    :status 200: when user is authorized
    :status 401: when user is not authorized

    '''
    docid, typename = request.POST['docid'], request.POST['typename']
    doc = docs.Doc.load(request.registry.servermodel_storage, docid)
    bokehuser = request.current_user()
    temporary_docid = get_temporary_docid(request, docid)
    t = BokehServerTransaction(
        request, bokehuser, doc, 'rw', temporary_docid=temporary_docid
    )
    t.load()
    modeldata = protocol.deserialize_json(request.body.decode('utf-8'))
    modeldata = [{'type' : typename,
                  'attributes' : modeldata}]
    t.clientdoc.load(*modeldata, dirty=True)
    t.save()
    ws_update(request, t.clientdoc, t.write_docid, modeldata)
    return make_json(protocol.serialize_json(modeldata[0]['attributes']))

def _bulkget(request, docid, typename=None):
    doc = docs.Doc.load(request.registry.servermodel_storage, docid)
    bokehuser = request.current_user()
    temporary_docid = get_temporary_docid(request, docid)
    t = BokehServerTransaction(
        request, bokehuser, doc, 'r', temporary_docid=temporary_docid
    )
    t.load()
    clientdoc = t.clientdoc
    all_models = clientdoc._models.values()
    if typename is not None:
        attrs = clientdoc.dump(*[x for x in all_models \
                                 if x.__view_model__==typename])
        attrs = [x['attributes'] for x in attrs]
        return make_json(protocol.serialize_json(attrs))
    else:
        attrs = clientdoc.dump(*all_models)
        return make_json(protocol.serialize_json(attrs))

@view_config(
    route_name='bokeh.bulkget_wo_typename',
    request_method='GET',
    decorator=handle_auth_error
    )
def bulkget_without_typename(request):
    ''' Retrieve all objects for a given :class:`Document <bokeh.document.Document>`.

    :param docid: id of the :class:`Document <bokeh.document.Document>`
        to update or insert into

    :status 200: when user is authorized
    :status 401: when user is not authorized

    '''
    docid = request.matchdict['docid']
    return _bulkget(request, docid)

@view_config(
    route_name='bokeh.bulkget_w_typename',
    request_method='GET',
    decorator=handle_auth_error
    )
def bulkget_with_typename(request):
    ''' Retrieve all objects of a specified typename for a
    given :class:`Document <bokeh.document.Document>`.

    :param docid: id of the :class:`Document <bokeh.document.Document>`
        to update or insert into
    :param typename: the type of objects to find and return

    :status 200: when user is authorized
    :status 401: when user is not authorized

    '''
    docid, typename = request.matchdict['docid'], request.matchdict['typename']
    return _bulkget(request, docid, typename)

def _handle_specific_model(request):
    md = request.matchdict
    docid, typename, id = md['docid'], md['typename'],md['id']
    method = request.method
    if method == 'PUT':
        return update(request, docid, typename, id)
    elif method == 'PATCH':
        return update(request, docid, typename, id)
    elif method == 'GET':
        return getbyid(request, docid, typename, id)
    elif method == 'DELETE':
        return delete(request, docid, typename, id)

# route for working with individual models
@view_config(
    route_name='bokeh.handle_model',
    request_method=('GET', 'OPTIONS'),
    decorator=(
        handle_auth_error,
        crossdomain(origin="*", methods=['PATCH', 'GET', 'PUT'], headers=None)
        )
    )
def _handle_specific_model_get(request):
    ''' Retrieve a specific model with a given id and typename for a
    given :class:`Document <bokeh.document.Document>`.

    :param docid: id of the :class:`Document <bokeh.document.Document>`
        to update or insert into
    :param typename: the type of objects to find and return
    :param id: unique id of the object to retrieve

    :status 200: when user is authorized
    :status 401: when user is not authorized

    '''
    return _handle_specific_model(request)

@view_config(
    route_name='bokeh.handle_model',
    request_method='PUT',
    decorator=(
        handle_auth_error,
        crossdomain(origin="*", methods=['PATCH', 'GET', 'PUT'], headers=None)
        )
    )
def _handle_specific_model_put(request):
    ''' Update a specific model with a given id and typename for a
    given :class:`Document <bokeh.document.Document>`.

    :param docid: id of the :class:`Document <bokeh.document.Document>`
        to update or insert into
    :param typename: the type of objects to find and return
    :param id: unique id of the object to retrieve

    :status 200: when user is authorized
    :status 401: when user is not authorized

    '''
    return _handle_specific_model(request)

@view_config(
    route_name='bokeh.handle_model',
    request_method='PATCH',
    decorator=(
        handle_auth_error,
        crossdomain(origin="*", methods=['PATCH', 'GET', 'PUT'], headers=None)
        )
    )
def _handle_specific_model_patch(request):
    ''' Update a specific model with a given id and typename for a
    given :class:`Document <bokeh.document.Document>`.

    :param docid: id of the :class:`Document <bokeh.document.Document>`
        to update or insert into
    :param typename: the type of objects to find and return
    :param id: unique id of the object to retrieve

    :status 200: when user is authorized
    :status 401: when user is not authorized

    '''
    return _handle_specific_model(request)

@view_config(
    route_name='bokeh.handle_model',
    request_method='DELETE',
    decorator=(
        handle_auth_error,
        crossdomain(origin="*", methods=['PATCH', 'GET', 'PUT'], headers=None)
        )
    )
def _handle_specific_model_delete(request):
    ''' Delete a specific model with a given id and typename for a
    given :class:`Document <bokeh.document.Document>`.

    :param docid: id of the :class:`Document <bokeh.document.Document>`
        to update or insert into
    :param typename: the type of objects to find and return
    :param id: unique id of the object to retrieve

    :status 200: when user is authorized
    :status 401: when user is not authorized

    '''
    return _handle_specific_model(request)

# individual model methods
def getbyid(request, docid, typename, id):
    doc = docs.Doc.load(request.registry.servermodel_storage, docid)
    bokehuser = request.registry.current_user()
    temporary_docid = get_temporary_docid(request, docid)
    t = BokehServerTransaction(
        request, bokehuser, doc, 'r', temporary_docid=temporary_docid
    )
    t.load()
    clientdoc = t.clientdoc
    attr = clientdoc.dump(clientdoc._models[id])[0]['attributes']
    return make_json(protocol.serialize_json(attr))

def update(request, docid, typename, id):
    """we need to distinguish between writing and patching models
    namely in writing, we shouldn't remove unspecified attrs
    (we currently don't handle this correctly)
    """
    doc = docs.Doc.load(request.registry.servermodel_storage, docid)
    bokehuser = request.current_user()
    temporary_docid = get_temporary_docid(request, docid)
    t = BokehServerTransaction(
        request, bokehuser, doc, 'rw', temporary_docid=temporary_docid
    )
    t.load()
    modeldata = protocol.deserialize_json(request.body.decode('utf-8'))
    ### horrible hack, we need to pop off the noop object if it exists
    modeldata.pop('noop', None)
    clientdoc = t.clientdoc
    log.info("loading done %s", len(clientdoc._models.values()))
    # patch id is not passed...
    modeldata['id'] = id
    modeldata = {'type' : typename,
                 'attributes' : modeldata}
    clientdoc.load(modeldata, events='existing', dirty=True)
    t.save()
    ws_update(request, clientdoc, t.write_docid, t.changed)
    # backbone expects us to send back attrs of this model, but it doesn't
    # make sense to do so because we modify other models, and we want this to
    # all go out over the websocket channel
    return make_json(protocol.serialize_json({'noop' : True}))

def delete(request, docid, typename, id):
    #I don't think this works right now
    obj = 'No this does not work, because obj is not defined, should it be an arg?'
    doc = docs.Doc.load(request.registry.servermodel_storage, docid)
    bokehuser = request.current_user()
    temporary_docid = get_temporary_docid(request, docid)
    t = BokehServerTransaction(
        request, bokehuser, doc, 'rw', temporary_docid=temporary_docid
    )
    clientdoc = t.clientdoc
    model = clientdoc._models[id]
    request.registry.backbone_storage.del_obj(t.write_docid, obj)
    t.save()
    ws_delete(clientdoc, t.write_docid, [model])
    return make_json(
        protocol.serialize_json(clientdoc.dump(model)[0]['attributes'])
        )
