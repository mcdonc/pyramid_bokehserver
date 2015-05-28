""" Utilities for writing plugins.

This is different from bokeh.pluginutils because these are ways of
patching routes and objects directly into the bokeh server. You
would run this type of code using the --script option

"""

from __future__ import absolute_import

import uuid

from pyramid.httpexceptions import HTTPConflict
from pyramid.renderers import render_to_response

from bokeh.exceptions import DataIntegrityException
from bokeh.resources import Resources

from ..views.backbone import init_bokeh
from ..views.main import _makedoc

def object_page(prefix):
    """ Decorator for a function which turns an object into a web page

    from bokeh_server.app import bokeh_app
    @bokeh_app.route("/myapp")
    @object_page("mypage")
    def make_object():
        #make some bokeh object here
        return obj

    This decorator will
      - create a randomized title for a bokeh document using the prefix
      - initialize bokeh plotting libraries to use that document
      - call the function you pass in, add that object to the plot context
      - render that object in a web page

    """
    def decorator(func):
        def wrapper(context, request):
            ## setup the randomly titled document
            docname = prefix + str(uuid.uuid4())
            bokehuser = request.current_user()
            try:
                doc = _makedoc(
                    request,
                    request.registry.servermodel_storage,
                    bokehuser,
                    docname
                    )
                doc.published = True
                doc.save(request.registry.servermodel_storage)
            except DataIntegrityException as e:
                return HTTPConflict(e.message)
            docid = doc.docid
            clientdoc = request.registry.backbone_storage.get_document(docid)

            ## initialize our plotting APIs to use that document

            init_bokeh(request, clientdoc)
            obj = func(context, request)
            clientdoc.add(obj)
            request.registry.backbone_storage.store_document(clientdoc)
            if hasattr(obj, 'extra_generated_classes'):
                extra_generated_classes = obj.extra_generated_classes
            else:
                extra_generated_classes = []

            resources = Resources()
            return render_to_response(
                "pyramid_bokehserver:templates/oneobj.html",
                dict(
                    elementid=str(uuid.uuid4()),
                    docid=docid,
                    objid=obj._id,
                    hide_navbar=True,
                    extra_generated_classes=extra_generated_classes,
                    splitjs=request.registry.bokehserver_settings.splitjs,
                    public='true',
                    loglevel=resources.log_level
                    ),
                request=request,
                )
        wrapper.__name__ = func.__name__
        return wrapper

    return decorator
