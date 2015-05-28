from __future__ import absolute_import

from datetime import timedelta

from pyramid.response import Response

from functools import update_wrapper, wraps
from six import string_types

def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))

    if headers is not None and not isinstance(headers, string_types):
        headers = ', '.join(x.upper() for x in headers)

    if not isinstance(origin, string_types):
        origin = ', '.join(origin)

    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        return methods
        options_resp = Response()
        return options_resp.headers['allow']

    def decorator(f):
        @wraps(f)
        def wrapped_function(context, request):
            if automatic_options and request.method == 'OPTIONS':
                resp = Response()
            else:
                resp = f(context, request)
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            requested_headers = request.headers.get(
                'Access-Control-Request-Headers'
            )
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            elif requested_headers :
                h['Access-Control-Allow-Headers'] = requested_headers
            return resp
        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)

    return decorator
