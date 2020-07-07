from django.urls import path
from account.api.user import UserController

# TODO: user/api
urlpatterns = [
    path('user/', UserController.as_view(),
         name='UserView'),
#     path('user/phone/verify/', PhoneVerifyView.as_view(),
#          name='PhoneVerifyView'),
#     path('user/password/', UserPasswordView.as_view(),
#          name='UserPassword'),
#     path('user/findpassword/', UserFindPasswordView.as_view(),
#          name='UserFindPassword'),
#     path('user/search/', UserSearchView.as_view(),
#          name='UserSearch'),
]

