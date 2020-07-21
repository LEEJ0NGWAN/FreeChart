from django.urls import path

from . import views_rest

urlpatterns = [
    path('login/', views_rest.login),
    path('logout/', views_rest.Logout.as_view()),
    path('email/verify/', views_rest.EmailVerify.as_view()),
    path('password/reset/', views_rest.PasswordReset.as_view()),
    path('check/', views_rest.Check.as_view()),
]

