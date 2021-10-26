import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Post

POSTS_BY_PAGE=5

def index(request):
    # select all posts
    posts = Post.objects.all().order_by('-timestamp')

    # Display only a few posts by a single page (POSTS_BY_PAGE)
    paginator = Paginator(posts, POSTS_BY_PAGE)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, "network/index.html", {
        'posts':page_obj
    })

def profile(request, username):
    user = User.objects.get(username=username)
    # Select all user posts
    posts = Post.objects.filter(owner=user).order_by('-timestamp')
    
    paginator = Paginator(posts, POSTS_BY_PAGE)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    logged_user=request.user
    followBtn_initLabel="Follow"
    if logged_user in user.followers.all():
        # if logged user is a follower he is allowed to unfollow
        followBtn_initLabel="Unfollow"
    
    return render(request, "network/profile.html", {
        "profile":user,
        "posts":page_obj,
        "followBtn_initLabel":followBtn_initLabel
    })

login_required
def followingUsers_posts(request):
    currentUser=request.user
    # Users that the current user follows
    followingUsers = currentUser.following.all()

    # Create query set to then add posts
    posts = Post.objects.none()

    # Add posts from people that the current user follows to the query set
    for user in followingUsers:
        posts |= Post.objects.filter(owner=user)
    
    posts = posts.order_by('-timestamp')
    paginator = Paginator(posts, POSTS_BY_PAGE)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "network/following.html", {
        "posts":page_obj
    })


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
def edit_post(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required"})

    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."})

    data = json.loads(request.body)
    content = data.get("content")
    if content:
            if request.user == post.owner:
                post.content = content
                post.save()

                return JsonResponse({"success": "Post content updated"})#HttpResponse(status=204)

            else:
                return JsonResponse({"error": "Access forbiden. Loggedin user differs from post owner"})

@login_required
def like_post(request, post_id):
    post=Post.objects.get(pk=post_id)
    post.like_unlike(request.user)
    return JsonResponse(post.serialize(), safe=False)

@login_required
def follow_user(request, username):
    user=User.objects.get(username=username)
    current_user=request.user
    current_user.follow_unfollow(user)
    return JsonResponse(user.serialize(), safe=False)

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
