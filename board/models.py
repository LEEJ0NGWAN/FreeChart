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

