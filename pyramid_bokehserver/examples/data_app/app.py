from __future__ import print_function

import time
import subprocess
import sys

from bokeh.session import Session
from bokeh.document import Document
from bokeh.models import PlotObject

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from caller import peek_source_location

def die(message):
    print(message, file=sys.stderr)
    sys.exit(1)

docname = "mydocname"

# here was playing with adding file/line to models
# _old_plot_object_init = PlotObject.__init__
# def new_plot_object_init(self, *k, **kw):
#     _old_plot_object_init(self, *k, **kw)
#     loc = peek_source_location()
#     if loc:
#         self.application_filename = loc.filename
#         self.application_lineno = loc.lineno

# PlotObject.__init__ = new_plot_object_init

# not currently used
def refresh_via_spawn(src_path, open_browser=False):
    print("reloading " + src_path)
    if open_browser:
        mode = "show"
    else:
        mode = "update"
    code = subprocess.call([sys.executable, "./wrapper.py", mode, docname, src_path])
    if code != 0:
        print("Child process exited nonzero", file=sys.stderr)

def load(src_path):
    if False:
        import imp
        imp.load_source(docname, src_path)
    else:
        import ast
        from types import ModuleType
        source = open(src_path, 'r').read()
        nodes = ast.parse(source, src_path)
        code = compile(nodes, filename=src_path, mode='exec')
        module = ModuleType(docname)
        exec(code, module.__dict__)

def refresh_via_local(src_path, open_browser=False):
    from bokeh.plotting import output_server, show, push
    from bokeh.io import curdoc
    if open_browser:
        output_server(docname)
    # TODO rather than clearing curdoc() we'd ideally
    # save the old one and compute a diff to send
    curdoc().clear()
    load(src_path)
    if open_browser:
        show(curdoc())
    else:
        push()

def refresh(src_path, open_browser=False):
    refresh_via_local(src_path, open_browser)

class FileChangeHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        #print("file event: " + repr(event))
        #print("event_type: " + event.event_type)
        #print("src_path: " + event.src_path)
        if event.event_type == "modified" and event.src_path.endswith("/sample.py"):
            refresh(event.src_path)

if __name__ == "__main__":
#    session = Session()
#    session.use_doc(docname)
#    doc = Document()
#    session.load_document(doc)

    path = "."
    event_handler = FileChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()

    refresh("./sample.py", open_browser=True)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
