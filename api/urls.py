from django.urls import path
from account.api.user import UserController
from board.api.board import (
    BoardController, SheetController
)

# TODO: board
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
        'board/sheet/',
        SheetController.as_view(),
        name='SheetView'),
]

