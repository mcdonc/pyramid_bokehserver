import os
import sys

from tornado.web import Application, FallbackHandler
from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado import ioloop

from .. import websocket
from .. import services
from .. import main
from ..models import docs
from ..models import convenience as mconv

from ..zmqsub import Subscriber
from ..forwarder import Forwarder

def run_server(arg=sys.argv):
    wsgiapp = main(None) # XXX
    server_settings = wsgiapp.registry.bokehserver_settings
    tornado_app = SimpleBokehTornadoApp(
        wsgiapp,
        debug=server_settings.debug
        )
    if server_settings.model_backend.get('start-redis', False):
        start_redis(wsgiapp.registry)
    tornado_app.start_threads()
    server = HTTPServer(tornado_app)
    server.listen(server_settings.port, server_settings.ip)
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
