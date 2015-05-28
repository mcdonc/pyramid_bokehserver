from __future__ import absolute_import

from pyramid.view import view_config

@view_config(route_name='bokeh.jsgenerate',
             renderer='pyramid_bokehserver:templates/app.js')
def generatejs(request):
    return request.matchdict
