from __future__ import absolute_import

from pyramid.response import Response
from pyramid.httpexceptions import HTTPNotFound

from bokeh.settings import settings as bokeh_settings

from .. import DocumentContext

def notfound(request):
    return HTTPNotFound()

def includeme(config):
    # app routes
    documentcontext = config.registry.documentcontext
    config.add_route(
        'bokeh.gc',
        '/bokeh/bb/{docid}/gc',
        factory=documentcontext
        )
    config.add_route(
        'bokeh.bulk_upsert',
        '/bokeh/bb/{docid}/bulkupsert',
        factory=documentcontext,
        )
    config.add_route(
        'bokeh.create',
        '/bokeh/bb/{docid}/{typename}/',
        )
    config.add_route(
        'bokeh.bulkget_wo_typename',
        '/bokeh/bb/{docid}/',
        factory=documentcontext,
        )
    config.add_route(
        'bokeh.bulkget_w_typename',
        '/bokeh/bb/{docid}/{typename}/',
        factory=documentcontext,
        )
    config.add_route(
        'bokeh.handle_model',
        '/bokeh/bb/{docid}/{typename}/{id}/',
        factory=documentcontext,
        )
    config.add_route(
        'bokeh.login', '/bokeh/login')
    config.add_route(
        'bokeh.loginfromapikey', '/bokeh/loginfromapikey')
    config.add_route(
        'bokeh.register', '/bokeh/register')
    config.add_route(
        'bokeh.logout', '/bokeh/logout')
    config.add_route(
        'bokeh.publish',
        '/bokeh/{docid}/publish',
        factory=documentcontext,
        )
    config.add_route(
        'bokeh.root', '/')
    config.add_route(
        'bokeh.index', '/bokeh/')
    config.add_route(
        'bokeh.favicon', '/bokeh/favicon.ico')
    config.add_route(
        'bokeh.docs', '/bokeh/doc/')
    config.add_route(
        'bokeh.doc',
        '/bokeh/doc/{docid}/',
        factory=documentcontext,
        )
    config.add_route(
        'bokeh.getdocapikey',
        '/bokeh/getdocapikey/{docid}',
        factory=documentcontext,
        )
    config.add_route(
        'bokeh.userinfo', '/bokeh/userinfo/')
    config.add_route(
        'bokeh.info',
        '/bokeh/bokehinfo/{docid}/',
        factory=documentcontext,
        )
    config.add_route(
        'bokeh.showdoc', '/bokeh/doc/{title}/show')
    config.add_route(
        'bokeh.sampleerror', '/bokeh/sampleerror')
    config.add_route(
        'bokeh.autoloadjs', '/bokeh/autoload.js/{elementid}'
        )
    config.add_route(
        'bokeh.objinfo',
        '/bokeh/objinfo/{docid}/{objid}',
        factory=documentcontext,
        )
    config.add_route(
        'bokeh.showobj',
        '/bokeh/doc/{docid}/{objid}',
        factory=documentcontext,
        )
    config.add_route(
        'bokeh.wsurl', '/bokeh/wsurl/')
    config.add_route(
        'bokeh.ping', '/bokeh/ping')

    config.add_route(
        'bokeh.generatejs',
        '/bokeh/jsgenerate/{parentname}/{modulename}/{classname}')

    jsdir = bokeh_settings.bokehjsdir()
    jssrcdir = bokeh_settings.bokehjssrcdir()

    # static views
    config.add_static_view('bokehjs/static', jsdir, cache_max_age=3600)
    if jssrcdir is not None:
        config.add_static_view('bokehjs/src', jssrcdir, cache_max_age=3600)

    config.add_static_view(
        'static', 'pyramid_bokehserver:static', cache_max_age=3600)

    # notfound view (append_slash needed for /doc vs. doc/ etc)
    config.add_notfound_view(notfound, append_slash=True)

    # scan
    config.scan('.')

def make_json(
    jsonstring,
    status_code=200,
    headers=None,
    content_type='application/json'
    ):
    """ Like jsonify, except accepts string, so we can do our own custom
    json serialization.  should move this to continuumweb later
    """
    r = Response(
        body=jsonstring,
        status=status_code,
        content_type='application/json'
    )
    if headers:
        r.headers.update(headers)
    return r
