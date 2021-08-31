import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post


def index(request):
    return render(request, "network/index.html")

@login_required
def new_post(request):
    if request.method == 'POST':
        user = request.user
        content = request.POST['content']
        if content:
            post = Post(content=content, owner = user)
            post.save()
    return HttpResponseRedirect(reverse("index"))

@csrf_exempt
@login_required
def edit(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required"})

    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."})

    data = json.loads(request.body)
    content = data.get("content")
    command = data.get("command")
    if content:
            if request.user == post.owner:
                post.content = content
                post.save()

                return JsonResponse({"success": "Post content updated"})#HttpResponse(status=204)

            else:
                return JsonResponse({"error": "Access forbiden. Loggedin user differs from post owner"})

    if command: # =='like'
        post.like_unlike(request.user)
        return JsonResponse(post.serialize(), safe=False)


def posts(request, filter):

    if filter == 'all':
        try:
            posts = Post.objects.all()

        except Post.DoesNotExist:
            return JsonResponse({"error": "Posts not found for filter : "+filter}, status=404)

    # Filter posts from people that the current user follows
    elif filter == 'following':
        try:
            currentUser = request.user

            # Users that the current user follows
            followingUsers = currentUser.following.all()

            # Create query set to then add posts
            posts = Post.objects.none()

            # Add posts from people that the current user follows to the query set
            for user in followingUsers:
                posts |= Post.objects.filter(owner=user)

        except Post.DoesNotExist:
            return JsonResponse({"error": "Posts not found for filter : "+filter}, status=404)

    else:
        try:
            user = User.objects.get(username=filter)
            posts = Post.objects.filter(owner=user)

        except Post.DoesNotExist:
            return JsonResponse({"error": "Posts not found for filter : "+filter}, status=404)

    posts = posts.order_by("-timestamp").all()

    return JsonResponse([post.serialize() for post in posts], safe=False)


@login_required
def following(request):
    return render(request, "network/following.html")

def profile(request, username):
    user=User.objects.get(username=username)
    logged_user=request.user
    followBtn_initLabel="Follow"
    if logged_user in user.followers.all():
        followBtn_initLabel="Unfollow"
    return render(request,"network/profile.html",{
        "profile":user,
        "followBtn_initLabel":followBtn_initLabel
    })

@login_required
def follow(request, username):
    user=User.objects.get(username=username)
    current_user=request.user
    current_user.follow_unfollow(user)
    return JsonResponse(user.serialize(), safe=False)

@login_required
def like(request, post_id):
    post=Post.objects.get(pk=post_id)
    post.like_unlike(request.user)
    return JsonResponse(post.serialize(), safe=False)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
