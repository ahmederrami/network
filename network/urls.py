
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("newpost", views.new_post, name="new_post"),
    path("posts/<str:filter>", views.posts, name="posts"),
    path("edit/<int:post_id>", views.edit, name="edit"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user/<str:username>", views.profile, name="profile"),
    path("follow/<str:username>", views.follow, name="follow")
]
