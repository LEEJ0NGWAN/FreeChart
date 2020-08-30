from django.urls import path
from account.api.user import UserController
from board.api.board import BoardController
from board.api.sheet import SheetController
from board.api.element import ElementController
from board.views_rest import ChildController, SheetCopy

urlpatterns = [
    path(
        'user/', 
        UserController.as_view(), 
        name='UserView'),
    path(
        'board/', 
        BoardController.as_view(),
        name='BoardView'),
    path(
        'sheet/',
        SheetController.as_view(),
        name='SheetView'),
    path(
        'sheet/element/',
        ElementController.as_view(),
        name='ElementView'),
    path(
        'child/',
        ChildController.as_view(),
        name='ChildView'),
    path(
        'sheet/copy/',
        SheetCopy.as_view(),
        name='SheetCopyView')
]

