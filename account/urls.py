from django.urls import path

from . import views_rest

urlpatterns = [
    path('logout/', views_rest.Logout.as_view()),
    path('login/', views_rest.login),
]

