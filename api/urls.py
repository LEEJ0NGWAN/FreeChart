from django.urls import path
from account.api.user import UserController

# TODO: board
urlpatterns = [
    path(
        'user/', 
        UserController.as_view(), 
        name='UserView'),
    # path(
    #     'board/', 
    #     BoardController.as_view(),
    #     name='BoardView'),
]

