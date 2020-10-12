from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from account.api.password import PasswordController
from account.api.email import EmailController
from account.api.user import UserController
from account.views_rest import AccountController
from board.api.board import BoardController
from board.api.sheet import SheetController
from board.api.element import ElementController
from board.views_rest import ChildController, SheetCopy, TutorialElement

urlpatterns = [
    path('accounts/', AccountController.as_view()),
    path('accounts/email', EmailController.as_view()),
    path('accounts/password', PasswordController.as_view()),
    path('accounts/token', jwt_views.TokenRefreshView.as_view()),
    path('users', UserController.as_view()),
    path('children', ChildController.as_view()),
    path('boards', BoardController.as_view()),
    path('sheets', SheetController.as_view()),
    path('sheets/copies', SheetCopy.as_view()),
    path('sheets/elements', ElementController.as_view()),
    path('sheets/test/elements', TutorialElement.as_view())
]

# from board.views_rest import GetDefaultData

# urlpatterns += [
#     path(
#         'getDefaultData/',
#         GetDefaultData.as_view(),
#         name='GetDefaultDataView'
#     )
# ]

