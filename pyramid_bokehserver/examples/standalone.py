from pyramid.config import Configurator
from pyramid.view import view_config
from pyramid.response import Response

@view_config(name='foo')
def foo(request):
    return Response('foo')

if __name__ == '__main__':
    config = Configurator()
    # override security policies / views here, e.g.
    # config.set_authentication_policy(MyPolicy())
    config.include('pyramid_bokehserver')
    config.scan('.')
