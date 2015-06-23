import unittest

class TestThreadDevice(unittest.TestCase):
    def _makeOne(self, ctx, **kw):
        from pyramid_bokehserver.forwarder import ThreadDevice
        return ThreadDevice(ctx, **kw)

    def test_context_factory(self):
        inst = self._makeOne(None, in_type=True, out_type=True)
        self.assertEqual(inst.context_factory(), None)

class TestForwarder(unittest.TestCase):
    def _makeOne(self, ctx, input_addr, output_addr, **kw):
        from pyramid_bokehserver.forwarder import Forwarder
        kw['_device'] = DummyDevice
        return Forwarder(ctx, input_addr, output_addr, **kw)

    def test_ctor(self):
        import zmq
        inst = self._makeOne(True, True, True)
        self.assertEqual(inst.device._bind_in, True)
        self.assertEqual(inst.device._bind_out, True)
        self.assertEqual(inst.device._sockopts, (zmq.SUBSCRIBE, b''))

    def test_start(self):
        inst = self._makeOne(True, True, True)
        inst.start()
        self.assertEqual(inst.device.started, True)

    def test_stop(self):
        inst = self._makeOne(True, True, True)
        inst.stop()
        self.assertTrue(inst.device.ctx.termed)
        self.assertTrue(inst.device.joined)


class DummyContext(object):
    def term(self):
        self.termed = True

class DummyDevice(object):
    def __init__(self, ctx, device_type, in_type, out_type):
        self.ctx = DummyContext()
        self.device_type = device_type
        self.in_type = in_type
        self.out_type = out_type

    def bind_in(self, input_addr):
        self._bind_in = input_addr

    def bind_out(self, output_addr):
        self._bind_out = output_addr

    def setsockopt_in(self, *arg):
        self._sockopts = arg

    def start(self):
        self.started = True

    def join(self):
        self.joined = True
