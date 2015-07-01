import unittest

try:
    import mock
except ImportError:
    from unittest import mock

from pyramid import testing

class UserModule(object):

    @property
    def User(self):
        return self

    def load(self, storage, username):
        self.storage = storage
        self.username = username
        return self

    def apiuser_from_request(self, request):
        return None

class NoneUserModule(object):

    @property
    def User(self):
        return self

    def load(self, storage, username):
        return None

    def new_user(self, storage, username, *arg, **kw):
        self.username = username
        return self

    def apiuser_from_request(self, request):
        return None

class DummyLogger(object):
    def __init__(self):
        self.msgs = []
    def info(self, msg):
        self.msgs.append(msg)

class DummyUser(object):
    username = 'fred'
    apikey = 'apikey'

class TestBokehAuthenticationPolicy(unittest.TestCase):
    def _makeOne(self, *arg, **kw):
        from pyramid_bokehserver.auth import BokehAuthenticationPolicy
        return BokehAuthenticationPolicy(*arg, **kw)

    def test_current_user_name(self):
        inst = self._makeOne(default_username='bob')
        request = testing.DummyRequest()
        self.assertEqual(inst.current_user_name(request), 'bob')

    @mock.patch('pyramid_bokehserver.auth.user', new_callable=UserModule)
    def test_current_user(self, user_module):
        inst = self._makeOne(default_username='bob')
        request = testing.DummyRequest()
        request.registry.servermodel_storage = True
        user = inst.current_user(request)
        self.assertEqual(user.username, 'bob')

    @mock.patch('pyramid_bokehserver.auth.user', new_callable=NoneUserModule)
    def test_current_user_None_no_default_username(self, user_module):
        inst = self._makeOne()
        request = testing.DummyRequest()
        request.registry.servermodel_storage = True
        user = inst.current_user(request)
        self.assertEqual(user, None)

    @mock.patch('pyramid_bokehserver.auth.user', new_callable=NoneUserModule)
    def test_current_user_None_with_default_username(self, user_module):
        inst = self._makeOne(default_username='bob')
        request = testing.DummyRequest()
        request.registry.servermodel_storage = True
        user = inst.current_user(request)
        self.assertEqual(user.username, 'bob')

    @mock.patch('pyramid_bokehserver.auth.logger', new_callable=DummyLogger)
    def test_print_connection_info(self,logger):
        inst = self._makeOne()
        user = DummyUser()
        inst.print_connection_info(user)
        self.assertEqual(
            logger.msgs,
            ['connect using the following',
             "output_server(docname, username='fred', userapikey='apikey')"]
            )


class TestBokehAuthorizationPolicy(unittest.TestCase):
    def setUp(self):
        self.config = testing.setUp()

    def tearDown(self):
        testing.tearDown()

    def _makeOne(self, *arg, **kw):
        from pyramid_bokehserver.auth import BokehAuthorizationPolicy
        return BokehAuthorizationPolicy(*arg, **kw)

    def test__is_defaultuser_true(self):
        self.config.testing_securitypolicy(userid='fred')
        inst = self._makeOne()
        request = testing.DummyRequest()
        request.registry.default_username = 'fred'
        result = inst._is_defaultuser(request)
        self.assertTrue(result)

    def test__is_defaultuser_false_no_defaultuser(self):
        self.config.testing_securitypolicy(userid='fred')
        inst = self._makeOne()
        request = testing.DummyRequest()
        request.registry.default_username = None
        self.assertFalse(inst._is_defaultuser(request))

    def test__is_defaultuser_false(self):
        self.config.testing_securitypolicy(userid='fred')
        inst = self._makeOne()
        request = testing.DummyRequest()
        request.registry.default_username = 'bob'
        result = inst._is_defaultuser(request)
        self.assertFalse(result)
