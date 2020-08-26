from uuid import uuid4
from django.db import models
from FreeChart.settings import AUTH_USER_MODEL

class Board(models.Model):
    class Meta:
        db_table = 'board'
        verbose_name = 'board'
    owner = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=256, verbose_name='제목')
    create_date = models.DateTimeField(auto_now_add=True, verbose_name='작성 날짜')
    modify_date = models.DateTimeField(auto_now=True, verbose_name='수정 날짜')
    deleted = models.BooleanField(default=False, null=False)

class Sheet(models.Model):
    class Meta:
        db_table = 'sheet'
        verbose_name = 'sheet'
    owner = models.ForeignKey(AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    board = models.ForeignKey('board.Board', on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=256, verbose_name='이름')
    create_date = models.DateTimeField(auto_now_add=True, verbose_name='작성 날짜')
    modify_date = models.DateTimeField(auto_now=True, verbose_name='수정 날짜')
    deleted = models.BooleanField(default=False, null=False)

class Node(models.Model):
    class Meta:
        db_table = 'node'
        verbose_name = 'node'
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    sheet = models.ForeignKey('board.Sheet', on_delete=models.SET_NULL, null=True)
    label = models.CharField(max_length=128, verbose_name='라벨')
    create = models.DateTimeField(auto_now_add=True, verbose_name='작성 날짜')
    modify = models.DateTimeField(auto_now=True, verbose_name='수정 날짜')
    deleted = models.BooleanField(default=False, null=False)
    x = models.IntegerField(null=True)
    y = models.IntegerField(null=True)
    font = models.CharField(max_length=20, default='14')
    shape = models.CharField(max_length=20, default='ellipse')
    color = models.CharField(max_length=8, default='#dddddd')

class Edge(models.Model):
    class Meta:
        db_table = 'edge'
        verbose_name = 'edge'
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    sheet = models.ForeignKey('board.Sheet', on_delete=models.SET_NULL, null=True)
    label = models.CharField(max_length=128, verbose_name='라벨')
    node_from = models.ForeignKey(
        'board.Node',
        on_delete=models.CASCADE,
        related_name='node1'
    )
    node_to = models.ForeignKey(
        'board.Node',
        on_delete=models.CASCADE,
        related_name='node2'
    )
    create = models.DateTimeField(auto_now_add=True, verbose_name='작성 날짜')
    modify = models.DateTimeField(auto_now=True, verbose_name='수정 날짜')
    deleted = models.BooleanField(default=False, null=False)
    dashes = models.BooleanField(default=False)
    arrow = models.IntegerField(default=1)
    width = models.IntegerField(default=3)

