import argparse
import logging
import os
import sys

import bokeh

from tornado.web import Application, FallbackHandler
from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado import ioloop

from .. import getapp
from .. import services
from .. import websocket

from ..forwarder import Forwarder
from ..models import docs
from ..models import convenience as mconv
from ..settings import Settings
from ..zmqsub import Subscriber

DEFAULT_BACKEND = os.environ.get('BOKEH_SERVER_DEFAULT_BACKEND', 'memory')
if DEFAULT_BACKEND not in ['redis', 'shelve', 'memory']:
    print("Unrecognized default backend: '%s'. Accepted values are: 'redis', 'shelve', 'memory'" % DEFAULT_BACKEND)
    sys.exit(1)

def build_parser():
    parser = argparse.ArgumentParser(description="Start the Bokeh plot server")

    # general configuration
    general = parser.add_argument_group('General Options')
    general.add_argument("--ip",
                         help="IP address that the bokeh server will listen on (default: 127.0.0.1)",
                         type=str,
                         default="127.0.0.1"
                         )
    general.add_argument("--port", "--bokeh-port",
                         help="Port that the bokeh server will listen on (default: 5006)",
                         type=int,
                         default=5006
                         )
    general.add_argument("--url-prefix",
                         help="URL prefix for server. e.g. 'host:port/<prefix>/bokeh' (default: None)",
                         type=str
                         )

    # advanced configuration
    advanced = parser.add_argument_group('Advanced Options')
    advanced.add_argument("-D", "--blaze-config",
                          help="blaze_config_File",
                          type=str,
                          default=None
                          )
    advanced.add_argument("-m", "--multi-user",
                          help="start in multi-user configuration (default: False)",
                          action="store_true",
                          default=False
                          )
    advanced.add_argument("--script",
                          help="script to load (for applets)",
                          default=None,
                          type=str
                          )

    # storage config
    storage = parser.add_argument_group('Storage Options')
    storage.add_argument("--backend",
                         help="storage backend: [ redis | memory | shelve ], (default: %s)" % DEFAULT_BACKEND,
                         type=str,
                         default=DEFAULT_BACKEND
                         )
    storage.add_argument("--redis-port",
                         help="port for redis server to listen on (default: 7001)",
                         type=int,
                         default=7001
                         )
    storage.add_argument("--start-redis",
                         help="start redis",
                         action="store_true",
                         dest="start_redis",
                         )
    storage.add_argument("--no-start-redis",
                         help="do not start redis",
                         action="store_false",
                         dest="start_redis",
                         )
    parser.set_defaults(start_redis=True)

    # websockets config
    websockets = parser.add_argument_group('Websocket Options')
    websockets.add_argument("--ws-conn-string",
                            help="connection string for websocket (unnecessary if auto-starting)",
                            default=None
                            )
    # dev, debugging, etc.
    class DevAction(argparse.Action):
        def __call__(self, parser, namespace, values, option_string=None):
            #namespace.splitjs = True
            namespace.debugjs = True
            namespace.backend = 'memory'

    dev = parser.add_argument_group('Development Options')
    dev.add_argument("-d", "--debug",
                     action="store_true",
                     default=False,
                     help="use debug mode for Flask"
                     )
    dev.add_argument("--dev",
                     action=DevAction,
                     nargs=0,
                     help="run server in development mode"
                     )
    dev.add_argument("--filter-logs",
                     action="store_true",
                     default=False,
                     help="don't show 'GET /static/... 200 OK', useful with --splitjs")
    dev.add_argument("-j", "--debugjs",
                     action="store_true",
                     default=False,
                     help="serve BokehJS files from the bokehjs build directory in the source tree"
                     )
    dev.add_argument("-s", "--splitjs",
                     action="store_true",
                     default=False,
                     help="serve individual JS files instead of compiled bokeh.js, requires --debugjs"
                     )
    dev.add_argument("--robust-reload",
                     help="protect debug server reloading from syntax errors",
                     default=False,
                     action="store_true",
                     )
    dev.add_argument("-v", "--verbose",
                     action="store_true",
                     default=False
                     )

    return parser


def run_server(argv=sys.argv):
    parser = build_parser()
    parser = build_parser()
    args = parser.parse_args(argv[1:])

    for handler in logging.getLogger().handlers:
        handler.addFilter(StaticFilter())

    backend_options = args.backend
    if backend_options == 'redis':
        if args.start_redis:
            backend_options += " (start=%s, port=%d)" % (args.start_redis, args.redis_port)
        else:
            backend_options += " (start=False)"

    onoff = {True:"ON", False:"OFF"}

    py_options = ", ".join(
        name.replace('_', '-') + ":" + onoff[vars(args).get(name)] for name in ['debug', 'verbose', 'filter_logs', 'multi_user']
    )
    js_options = ", ".join(
        name + ":" + onoff[vars(args).get(name)]for name in ['splitjs', 'debugjs']
    )

    if not args.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        print("""
    Bokeh Server Configuration
    ==========================
    python version : %s
    bokeh version  : %s
    listening      : %s:%d
    backend        : %s
    python options : %s
    js options     : %s
    """ % (
        sys.version.split()[0],
        bokeh.__version__,
        args.ip,
        args.port,
        backend_options,
        py_options,
        js_options,
    ))

    settings = Settings()
    settings.reset()

    settings.from_args(args)
    settings.debugjs = args.debugjs

    wsgiapp = getapp(settings)

    tornado_app = SimpleBokehTornadoApp(
        wsgiapp,
        debug=settings.debug
        )
    if settings.model_backend.get('start-redis', False):
        start_redis(wsgiapp.registry)
    tornado_app.start_threads()
    server = HTTPServer(tornado_app)
    server.listen(settings.port, settings.ip)
    ioloop.IOLoop.instance().start()

class SimpleBokehTornadoApp(Application):
    def __init__(self, wsgiapp, **settings):
        server_settings = wsgiapp.registry.bokehserver_settings
        self.wsgiapp = wsgiapp
        tornado_wsgiapp = WSGIContainer(wsgiapp)
        url_prefix = server_settings.url_prefix
        handlers = [
            (url_prefix + "/bokeh/sub", websocket.WebSocketHandler),
            (r".*", FallbackHandler, dict(fallback=tornado_wsgiapp))
        ]
        super(SimpleBokehTornadoApp, self).__init__(handlers, **settings)
        self.wsmanager = websocket.WebSocketManager()
        def auth(auth, docid):
            #HACKY
            if docid.startswith("temporary-"):
                return True
            doc = docs.Doc.load(wsgiapp.registry.servermodel_storage, docid)
            status = mconv.can_read_doc_api(doc, auth)
            return status
        self.wsmanager.register_auth('bokehplot', auth)

        self.subscriber = Subscriber(
            server_settings.ctx,
            [server_settings.sub_zmqaddr],
            self.wsmanager
            )
        if server_settings.run_forwarder:
            self.forwarder = Forwarder(
                server_settings.ctx,
                server_settings.pub_zmqaddr,
                server_settings.sub_zmqaddr
                )
        else:
            self.forwarder = None

    def start_threads(self):
        self.wsgiapp.registry.publisher.start()
        self.subscriber.start()
        if self.forwarder:
            self.forwarder.start()

    def stop_threads(self):
        self.wsgiapp.registry.publisher.stop()
        self.subscriber.stop()
        if self.forwarder:
            self.forwarder.stop()

def start_redis(registry):
    server_settings = registry.bokehserver_settings
    work_dir = getattr(server_settings, 'work_dir', os.getcwd())
    data_file = getattr(server_settings, 'data_file', 'redis.db')
    stdout = getattr(server_settings, 'stdout', sys.stdout)
    stderr = getattr(server_settings, 'stdout', sys.stderr)
    redis_save = getattr(server_settings, 'redis_save', True)
    mproc = services.start_redis(
        pidfilename=os.path.join(work_dir, "bokehpids.json"),
        port=registry.backend.get('redis_port', 6379),
        data_dir=work_dir,
        data_file=data_file,
        stdout=stdout,
        stderr=stderr,
        save=redis_save
        )
    registry.redis_proc = mproc

class StaticFilter(logging.Filter):
    def filter(self, record):
        msg = record.getMessage()
        return not (
            msg.startswith(("200 GET /static", "200 GET /bokehjs/static"))
            )
