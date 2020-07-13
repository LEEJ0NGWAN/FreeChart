from django.urls import path

from . import views_rest

urlpatterns = [
    path('login/', views_rest.login),
    path('logout/', views_rest.Logout.as_view()),
    path('email/verify/', views_rest.EmailVerify.as_view()),
    # TODO: 비밀번호 재설정 api
    # path('password/reset/', views_rest.PasswordReset.as_view()),
]

