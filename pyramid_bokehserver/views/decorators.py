from __future__ import absolute_import

from functools import wraps

from pyramid.httpexceptions import HTTPUnauthorized

def login_required(func):
    @wraps(func)
    def wrapper(context, request):
        if not request.current_user():
            return HTTPUnauthorized("You must be logged in")
        return func(context, request)
    return wrapper
