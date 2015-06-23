import unittest
from pyramid.testing import (
    DummyRequest,
    DummyResource,
    )

from pyramid.response import Response

class Test_crossdomain(unittest.TestCase):
    def setUp(self):
        self.request = DummyRequest()
        self.context = DummyResource()
        self.response = Response()

    def _callFUT(self, **kw):
        from pyramid_bokehserver.crossdomain import crossdomain
        return crossdomain(**kw)

    def _decorate(self, **kw):
        decorator = self._callFUT(**kw)
        def dummy_view(context, request):
            return self.response
        return decorator(dummy_view)

    def _call_decorated(self, **kw):
        decorated = self._decorate(**kw)
        return decorated(self.context, self.request)

    def test_default_params(self):
        response = self._call_decorated()
        h = dict(response.headers)
        self.assertEqual(h['Access-Control-Allow-Origin'], '*')
        self.assertEqual(h['Access-Control-Max-Age'], '21600')

    def test_methods_is_not_None(self):
        response = self._call_decorated(methods=('GET', 'POST'))
        self.assertEqual(
            response.headers['Access-Control-Allow-Methods'],
            'GET, POST',
            )

    def test_origin_is_sequence(self):
        response = self._call_decorated(origin=('a', 'b'))
        self.assertEqual(
            response.headers['Access-Control-Allow-Origin'],
            'a, b',
            )

    def test_headers_is_string(self):
        response = self._call_decorated(headers='abc')
        self.assertEqual(
            response.headers['Access-Control-Allow-Headers'],
            'abc',
            )

    def test_headers_is_sequence(self):
        response = self._call_decorated(headers=('abc', 'def'))
        self.assertEqual(
            response.headers['Access-Control-Allow-Headers'],
            'ABC, DEF',
            )

    def test_max_age_is_timedelta(self):
        from datetime import timedelta
        td = timedelta(seconds=10)
        response = self._call_decorated(max_age=td)
        self.assertEqual(
            response.headers['Access-Control-Max-Age'],
            '10'
            )

    def test_request_method_is_options(self):
        self.request.method = 'OPTIONS'
        response = self._call_decorated()
        self.assertNotEqual(response, self.response)

    def test_request_method_is_not_options(self):
        response = self._call_decorated()
        self.assertEqual(response, self.response)

    def test_request_method_is_not_options_and_not_attach_to_all(self):
        response = self._call_decorated(attach_to_all=False)
        self.assertEqual(response, self.response)
        self.assertFalse('Access-Control-Allow-Origin' in response.headers)

    def test_request_has_requested_headers(self):
        self.request.headers['Access-Control-Request-Headers'] = 'abc'
        response = self._call_decorated()
        self.assertEqual(
            response.headers['Access-Control-Allow-Headers'],
            'abc'
            )
