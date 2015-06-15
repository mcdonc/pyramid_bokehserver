from __future__ import print_function

import sys
import imp
from bokeh.plotting import output_server, show, push
from bokeh.io import curdoc

# we are expecting to be called with:
# argv[1] is "show" or "update"
# argv[2] is the document name in bokeh-server
# argv[3] is the script that defines the document

def die(message):
    print(message, file=sys.stderr)
    sys.exit(1)

open_browser = False
if sys.argv[1] == "show":
    open_browser = True
elif sys.argv[1] == "update":
    open_browser = False
else:
    die("need to specify 'show' or 'update'")

docname = sys.argv[2]
scriptpath = sys.argv[3]

output_server(docname)

imp.load_source(docname, scriptpath)

if open_browser:
    show(curdoc()) # show implies a push first
else:
    push()
