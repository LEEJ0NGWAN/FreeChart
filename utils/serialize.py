import uuid
import datetime
import collections
from itertools import chain
from functools import singledispatch
from threading import current_thread
from threading import Thread as _Thread
from django.db import connection
from django.contrib.contenttypes.models import ContentType
from django.utils.functional import SimpleLazyObject
from account.models import User
from board.models import (Board, Sheet, Node, Edge)

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


def _chunker(seq, size):
    return (seq[pos:pos + size] for pos in range(0, len(seq), size))


@singledispatch
def serialize(value, **kwargs):
    pass


@serialize.register(bool)
@serialize.register(type(None))
@serialize.register(int)
@serialize.register(float)
@serialize.register(str)
def value_parse(value, **kwargs):
    return value


@serialize.register(collections.Iterable)
def iter_parse(value, **kwargs):
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


@serialize.register(collections.Mapping)
def map_parse(value, **kwargs):
    result = collections.OrderedDict()
    for key, value in value.items():
        result[key] = serialize(value, **kwargs)
    return result

@serialize.register(datetime.datetime)
@serialize.register(datetime.date)
def date_parse(value, **kwargs):
    return value.isoformat()


@serialize.register(datetime.time)
def time_parse(value, **kwargs):
    return value.replace(microsecond=0).isoformat()


@serialize.register(uuid.UUID)
def uuid_parse(value, **kwargs):
    return str(value)


@serialize.register(SimpleLazyObject)
def slo_parse(obj, **kwargs):
    return serialize(obj._wrapped, **kwargs)

@serialize.register(User)
def user_parse(user, **kwargs):
    result = {
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'email_verified': user.email_verified
    }

    return serialize(result, **kwargs)

@serialize.register(Board)
def board_parse(board, **kwargs):
    result = {
        'id': board.id,
        'title': board.title,
        'parent_id': board.parent_id,
        'create_date': board.create_date,
        'modify_date': board.modify_date
    }

    if kwargs.get('change_parent'):
        result['parent_id'] = kwargs.get('new_parent_id')

    return serialize(result, **kwargs)

@serialize.register(Sheet)
def sheet_parse(sheet, **kwargs):
    result = {
        'id': sheet.id,
        'title': sheet.title,
        'board_id': sheet.board_id,
        'create_date': sheet.create_date,
        'modify_date': sheet.modify_date
    }

    if kwargs.get('change_parent'):
        result['board_id'] = kwargs.get('new_parent_id')

    return serialize(result, **kwargs)

@serialize.register(Node)
def node_parse(node, **kwargs):
    result = {
        'id': node.id,
        'label': node.label,
        'x': node.x,
        'y': node.y,
    }

    return serialize(result, **kwargs)

@serialize.register(Edge)
def edge_parse(edge, **kwargs):
    result = {
        'id': edge.id,
        'label': edge.label,
        'from': edge.node_from_id,
        'to': edge.node_to_id,
        'dashes': edge.dashes,
        'arrows': {
            'to': {
                'enabled': edge.arrow,
            }
        },
        'width': edge.width,
    }

    return serialize(result, **kwargs)

