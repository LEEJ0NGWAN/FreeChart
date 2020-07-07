from itertools import chain
from threading import Thread
from typequery import GenericMethod
from django.db import connection
from django.contrib.contenttypes.models import ContentType
from django.utils.functional import SimpleLazyObject
from FreeList.account.models import User

class Thread(threading.Thread):
    def __init__(self, group=None, target=None, name=None,
                 args=(), kwargs=None):
        super().__init__(group, target, name, args, kwargs)
        self.done = False
        self.result = None
        self.start()

    def run(self):
        try:
            if self._target:
                self.result = self._target(*self._args, **self._kwargs)
        finally:
            del self._target, self._args, self._kwargs
        connection.close()
        self.done = True

    def join(self, timeout=None):
        if not self._initialized:
            raise RuntimeError("Thread.__init__() n t called")
        if not self._started.is_set():
            raise RuntimeError("cannot join thread before it is started")
        if self is threading.current_thread():
            raise RuntimeError("cannot join current thread")

        if timeout is None:
            self._wait_for_tstate_lock()
        else:
            self._wait_for_tstate_lock(timeout=max(timeout, 0))
        if self.done:
            return self.result


serialize = GenericMethod('serialize')

data = dict()


def _chunker(seq, size):
    return (seq[pos:pos + size] for pos in range(0, len(seq), size))


@serialize.of(bool)
@serialize.of(type(None))
@serialize.of(int)
@serialize.of(float)
@serialize.of(str)
def serialize(value, **kwargs):
    return value


@serialize.of(collections.Iterable)
def serialize(value, **kwargs):
    value = list(value)
    if len(value) > 10:
        thread_list = [
            Thread(target=serialize, args=(element, ), kwargs=kwargs)
            for element in _chunker(value, 10)
        ]
        return list(chain(*[t.join() for t in thread_list]))
    return [
        serialize(element, **kwargs)
        for element in value
    ]