import imp
import os
import sys

from six.moves.queue import Queue

from bokeh.settings import settings as bokeh_settings

from pyramid.config import Configurator
from pyramid.session import SignedCookieSessionFactory
from pyramid.security import (
    Allow,
    Everyone,
    Authenticated,
    )

from . import websocket
from .zmqpub import Publisher

from .server_backends import (
    InMemoryServerModelStorage,
    RedisServerModelStorage,
    ShelveServerModelStorage,
    BokehAuthenticationPolicy,
    BokehAuthorizationPolicy,
)
from .serverbb import (
    InMemoryBackboneStorage,
    RedisBackboneStorage,
    ShelveBackboneStorage,
)

REDIS_PORT = 6379

DEFAULT_BACKEND = os.environ.get('BOKEH_SERVER_DEFAULT_BACKEND', 'memory')
if DEFAULT_BACKEND not in ['redis', 'shelve', 'memory']:
    print("Unrecognized default backend: '%s'. Accepted values are: 'redis', 'shelve', 'memory'" % DEFAULT_BACKEND)
    sys.exit(1)


class RootContext(object):
    def __init__(self, request):
        self.request = request
    def __acl__(self):
        return [(Allow, Authenticated, 'edit'), (Allow, Everyone, 'view')]

def current_user(request):
    return request.registry.authentication.current_user(request)

def getapp(settings): # settings should be a bokehserver.settings.Settings
    """ This function returns a Pyramid WSGI application representing the Bokeh
    server.
    """
    config = Configurator(settings={})
    config.registry.bokehserver_settings = settings

    backend = settings.model_backend
    if backend['type'] == 'redis':
        import redis
        rhost = backend.get('redis_host', '127.0.0.1')
        rport = backend.get('redis_port', REDIS_PORT)
        bbstorage = RedisBackboneStorage(
            redis.Redis(host=rhost, port=rport, db=2)
            )
        servermodel_storage = RedisServerModelStorage(
            redis.Redis(host=rhost, port=rport, db=3)
            )
    elif backend['type'] == 'memory':
        bbstorage = InMemoryBackboneStorage()
        servermodel_storage = InMemoryServerModelStorage()

    elif backend['type'] == 'shelve':
        bbstorage = ShelveBackboneStorage()
        servermodel_storage = ShelveServerModelStorage()

    if settings.multi_user:
        authentication = BokehAuthenticationPolicy()
    else:
        authentication = BokehAuthenticationPolicy(
            default_username='defaultuser'
            )
    authorization = BokehAuthorizationPolicy()
    url_prefix = settings.url_prefix
    publisher = Publisher(settings.ctx, settings.pub_zmqaddr, Queue())

    for script in settings.scripts:
        script_dir = os.path.dirname(script)
        if script_dir not in sys.path:
            print ("adding %s to python path" % script_dir)
            sys.path.append(script_dir)
        print ("importing and scanning %s" % script)
        mod = imp.load_source("_bokeh_app", script)
        if hasattr(mod, 'includeme'):
            config.include(mod)
        else:
            config.scan(mod)

    config.registry.url_prefix = url_prefix
    config.registry.publisher = publisher
    config.registry.wsmanager = websocket.WebSocketManager()
    config.registry.backend = backend
    config.registry.servermodel_storage = servermodel_storage
    config.registry.backbone_storage = bbstorage
    config.registry.authentication = authentication
    config.registry.authorization = authorization
    config.registry.bokehjsdir = bokeh_settings.bokehjsdir()
    config.registry.bokehjssrcdir = bokeh_settings.bokehjssrcdir()

    # add a ``request.current_user()`` API
    config.add_request_method(current_user)

    # configure a session factory for request.session access and
    # SessionAuthenticationPolicy usage
    session_factory = SignedCookieSessionFactory(settings.secret_key)
    config.set_session_factory(session_factory)

    # do jinja2 setup; files ending in .html and .js will be considered
    # jinja2 templates
    config.include('pyramid_jinja2')
    config.add_jinja2_renderer('.html')
    config.add_jinja2_renderer('.js')

    # register routes and default views
    config.include('.views')

    # set up default declarative security context
    config.set_root_factory(RootContext)

    # set up view-time security policies
    config.set_authentication_policy(authentication)
    config.set_authorization_policy(authorization)

    # return a WSGI application
    return config.make_wsgi_app()
