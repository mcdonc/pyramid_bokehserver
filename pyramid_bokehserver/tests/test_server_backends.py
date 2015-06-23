import unittest

class TestAbstractServerModelStorage(unittest.TestCase):
    def _makeOne(self):
        from pyramid_bokehserver.server_backends import (
            AbstractServerModelStorage)
        inst = AbstractServerModelStorage()
        return inst

    def test_get(self):
        inst = self._makeOne()
        self.assertRaises(NotImplementedError, inst.get, None)

    def test_set(self):
        inst = self._makeOne()
        self.assertRaises(NotImplementedError, inst.set, None, None)

    def test_create(self):
        inst = self._makeOne()
        self.assertRaises(NotImplementedError, inst.create, None, None)

class TestRedisServerModelStorage(unittest.TestCase):
    def _makeOne(self, exists=True):
        redisconn = DummyRedisConn(exists, {'json':'[1, 2, 3]'})
        from pyramid_bokehserver.server_backends import (
            RedisServerModelStorage)
        inst = RedisServerModelStorage(redisconn)
        return inst

    def test_get_data_is_None(self):
        inst = self._makeOne()
        self.assertEqual(inst.get(None), None)

    def test_get(self):
        inst = self._makeOne()
        self.assertEqual(inst.get('json'), [1,2,3])

    def test_set(self):
        import json
        inst = self._makeOne()
        inst.set('foo', [4,5,6])
        self.assertEqual(inst.redisconn.get('foo'), json.dumps([4,5,6]))

    def test_create_exists_already(self):
        from bokeh.exceptions import DataIntegrityException
        inst = self._makeOne()
        self.assertRaises(DataIntegrityException, inst.create, 'json', 'abc')
        self.assertEqual(inst.redisconn.watching, 'json')
        self.assertEqual(inst.redisconn.multied, True)
        self.assertTrue(inst.redisconn.entered)
        self.assertTrue(inst.redisconn.exited)

    def test_create_doesnt_exist(self):
        inst = self._makeOne(False)
        inst.create('json', 'abc')
        self.assertEqual(inst.redisconn.watching, 'json')
        self.assertTrue(inst.redisconn.multied)
        self.assertEqual(inst.redisconn['json'], '"abc"')
        self.assertTrue(inst.redisconn.executed)
        self.assertTrue(inst.redisconn.entered)
        self.assertTrue(inst.redisconn.exited)

class TestInMemoryServerModelStorage(unittest.TestCase):
    def _makeOne(self):
        import json
        from pyramid_bokehserver.server_backends import (
            InMemoryServerModelStorage)
        inst = InMemoryServerModelStorage({'json':json.dumps([1,2,3])})
        return inst

    def test_get_notexists(self):
        inst = self._makeOne()
        self.assertEqual(inst.get('foo'), None)

    def test_get_exists(self):
        inst = self._makeOne()
        self.assertEqual(inst.get('json'), [1,2,3])

    def test_set(self):
        inst = self._makeOne()
        inst.set('foo', 'bar')
        self.assertEqual(inst._data['foo'], '"bar"')

    def test_create_exists(self):
        from bokeh.exceptions import DataIntegrityException
        inst = self._makeOne()
        self.assertRaises(DataIntegrityException, inst.create, 'json', None)

    def test_create_notexists(self):
        inst = self._makeOne()
        inst.create('foo','bar')
        self.assertEqual(inst._data['foo'], '"bar"')

class ShelveServerModelStorage(unittest.TestCase):
    def _makeOne(self):
        import json
        from pyramid_bokehserver.server_backends import (
            ShelveServerModelStorage)
        shelve_module = DummyShelve({'json':json.dumps([1,2,3])})
        inst = ShelveServerModelStorage(shelve_module)
        return inst

    def test_get_notexists(self):
        inst = self._makeOne()
        self.assertEqual(inst.get('foo'), None)
        self.assertTrue(inst.shelve_module.closed)

    def test_get_exists(self):
        inst = self._makeOne()
        self.assertEqual(inst.get('json'), [1,2,3])
        self.assertTrue(inst.shelve_module.closed)

    def test_set(self):
        inst = self._makeOne()
        inst.set('foo', 'bar')
        self.assertEqual(inst.shelve_module._data['foo'], '"bar"')
        self.assertTrue(inst.shelve_module.closed)

    def test_create_exists(self):
        from bokeh.exceptions import DataIntegrityException
        inst = self._makeOne()
        self.assertRaises(DataIntegrityException, inst.create, 'json', None)
        self.assertTrue(inst.shelve_module.closed)

    def test_create_notexists(self):
        inst = self._makeOne()
        inst.create('foo','bar')
        self.assertEqual(inst.shelve_module._data['foo'], '"bar"')
        self.assertTrue(inst.shelve_module.closed)

class DummyRedisConn(dict):
    def __init__(self, exists, *arg, **kw):
        dict.__init__(self, *arg, **kw)
        self._exists = exists

    def set(self, k, v):
        self[k] = v

    def __enter__(self, *arg, **kw):
        self.entered = True
        return self

    def __exit__(self, *arg, **kw):
        self.exited = True

    def pipeline(self):
        return self

    def watch(self, key):
        self.watching = key

    def multi(self):
        self.multied = True

    def execute(self):
        self.executed = True

    def exists(self, key):
        return self._exists

class DummyShelve(object):
    def __init__(self, data):
        self._data = data

    def open(self, fn):
        return self

    def get(self, key, default=None):
        return self._data.get(key, default)

    def close(self):
        self.closed = True

    def __setitem__(self, k, v):
        self._data[k] = v

    def __contains__(self, k):
        return k in self._data
