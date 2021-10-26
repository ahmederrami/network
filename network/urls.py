
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("following", views.followingUsers_posts, name="following"),
    path("newpost", views.new_post, name="new_post"),
    path("edit/<int:post_id>", views.edit_post, name="edit"),
    path("like/<int:post_id>", views.like_post, name="like"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("<str:username>", views.profile, name="profile"),
    path("follow/<str:username>", views.follow_user, name="follow")
]
