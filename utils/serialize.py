import uuid
import datetime
import collections
from itertools import chain
from threading import current_thread
from threading import Thread as _Thread
from typequery import GenericMethod
from django.db import connection
from django.contrib.contenttypes.models import ContentType
from django.utils.functional import SimpleLazyObject
from account.models import User

class Thread(_Thread):
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
        if self is current_thread():
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

@serialize.of(collections.Mapping)
def serialize(value, **kwargs):
    result = collections.OrderedDict()
    for key, value in value.items():
        result[key] = serialize(value, **kwargs)
    return result


@serialize.of(datetime.datetime)
@serialize.of(datetime.date)
def serialize(value, **kwargs):
    return value.isoformat()


@serialize.of(datetime.date)
def serialize(value, **kwargs):
    return value.isoformat()


@serialize.of(datetime.time)
def serialize(value, **kwargs):
    return value.replace(microsecond=0).isoformat()


@serialize.of(uuid.UUID)
def serialize(value, **kwargs):
    return str(value)


@serialize.of(SimpleLazyObject)
def serialize(obj, **kwargs):
    return serialize(obj._wrapped, **kwargs)

@serialize.of(User)
def serialize(user, **kwargs):
    result = {
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'email_verified': user.email_verified
    }

    return serialize(result, **kwargs)

