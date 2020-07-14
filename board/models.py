from django.db import models

class Board(models.Model):
    class Meta:
        db_table = 'board'
        verbose_name = 'board'
    owner = models.ForeignKey('account.User', on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=256, verbose_name='제목')
    create_date = models.DateTimeField(auto_now_add=True, verbose_name='작성 날짜')
    modify_date = models.DateTimeField(auto_now=True, verbose_name='수정 날짜')

class Sheet(models.Model):
    class Meta:
        db_table = 'sheet'
        verbose_name = 'sheet'
    owner = models.ForeignKey('account.User', on_delete=models.SET_NULL, null=True)
    board = models.ForeignKey('board.Board', on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=256, verbose_name='이름')
    create_date = models.DateTimeField(auto_now_add=True, verbose_name='작성 날짜')
    modify_date = models.DateTimeField(auto_now=True, verbose_name='수정 날짜')

class Node(models.Model):
    class Meta:
        db_table = 'node'
        verbose_name = 'node'
    sheet = models.ForeignKey('board.Sheet', on_delete=models.SET_NULL, null=True)
    label = models.CharField(max_length=128, verbose_name='라벨')

class Edge(models.Model):
    class Meta:
        db_table = 'edge'
        verbose_name = 'edge'
    sheet = models.ForeignKey('board.Sheet', on_delete=models.SET_NULL, null=True)
    label = models.CharField(max_length=128, verbose_name='라벨')
    node1 = models.ForeignKey(
        'board.Node',
        on_delete=models.CASCADE,
        related_name='node1'
    )
    node2 = models.ForeignKey(
        'board.Node',
        on_delete=models.CASCADE,
        related_name='node2'
    )

