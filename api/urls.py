from django.urls import path
from account.api.user import UserController
from board.api.board import (
    BoardController, SheetController, ElementController, ChildController
)

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
        name='ChildView'
    )
]

