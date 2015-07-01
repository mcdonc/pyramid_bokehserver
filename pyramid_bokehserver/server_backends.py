from __future__ import absolute_import, print_function

import logging
logger = logging.getLogger(__name__)

import json
import shelve

from bokeh.exceptions import DataIntegrityException
from bokeh.util.string import encode_utf8, decode_utf8

class AbstractServerModelStorage(object):
    """Storage class for server side models (non backbone, that would be
    document and user classes)
    """
    def get(self, key):
        """given a key returns json objects"""
        raise NotImplementedError

    def set(self, key, val):
        """given a key and a json object, saves it"""
        raise NotImplementedError

    def create(self, key, val):
        """given a key and a json object, saves it
        differs from set because this method should check
        to make sure the object doesn't already exist
        """
        raise NotImplementedError

class RedisServerModelStorage(object):
    def __init__(self, redisconn):
        self.redisconn = redisconn

    def get(self, key):
        data = self.redisconn.get(key)
        if data is None:
            return None
        attrs = json.loads(decode_utf8(data))
        return attrs

    def set(self, key, val):
        self.redisconn.set(key, json.dumps(val))

    def create(self, key, val):
        with self.redisconn.pipeline() as pipe:
            pipe.watch(key)
            pipe.multi()
            if self.redisconn.exists(key):
                raise DataIntegrityException("%s already exists" % key)
            else:
                pipe.set(key, json.dumps(val))
            pipe.execute()

class InMemoryServerModelStorage(object):
    def __init__(self, data=None):
        if data is None:
            data = {}
        self._data = data

    def get(self, key):
        data = self._data.get(key, None)
        if data is None:
            return None
        attrs = json.loads(decode_utf8(data))
        return attrs

    def set(self, key, val):
        self._data[key] = json.dumps(val)

    def create(self, key, val):
        if key in self._data:
            raise DataIntegrityException("%s already exists" % key)
        self._data[key] = json.dumps(val)

class ShelveServerModelStorage(object):

    def __init__(self, shelve_module=shelve):
        # shelve_module overrideable for testing purposes
        self.shelve_module = shelve_module

    def get(self, key):
        _data = self.shelve_module.open('bokeh.server')
        try:
            key = encode_utf8(key)
            data = _data.get(key, None)
            if data is None:
                return None
            attrs = json.loads(decode_utf8(data))
        finally:
            _data.close()
        return attrs

    def set(self, key, val):
        _data = self.shelve_module.open('bokeh.server')
        try:
            key = encode_utf8(key)
            _data[key] = json.dumps(val)
        finally:
            _data.close()

    def create(self, key, val):
        key = str(key)
        _data = self.shelve_module.open('bokeh.server')
        try:
            if key in _data:
                raise DataIntegrityException("%s already exists" % key)
            _data[key] = json.dumps(val)
        finally:
            _data.close()

