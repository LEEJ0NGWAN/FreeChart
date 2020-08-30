from django.urls import path
from rest_framework_simplejwt import views as jwt_views

from . import views_rest

urlpatterns = [
    path('login/', views_rest.Login.as_view()),
    path('email/verify/', views_rest.EmailVerify.as_view()),
    path('password/reset/', views_rest.PasswordReset.as_view()),
    path('check/', views_rest.Check.as_view()),
    path('create/', views_rest.UserCreate.as_view()),
    path('delete/', views_rest.UserDelete.as_view()),
    path('refresh/', jwt_views.TokenRefreshView.as_view()),
    path('verify/', views_rest.Auth.as_view()),
]

