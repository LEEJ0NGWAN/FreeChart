from django.urls import path

from . import views_rest

urlpatterns = [
    path('logout/', views_rest.app_logout),
    path('login/', views_rest.app_login),
]