This project consists of designing a Twitter-like social network website for making posts and following users. It was developed using python (django) and javascript. Below are the features of the application.    
# 🕐 New Post  
At the top of the page, a “New Post” box is shown. So the authenticated user can write a new text-based post by filling in text into the text area. Then he has to click the submit button to submit the post.  
# 🕑 All Posts 
The “All Posts” link in the navigation bar take the user to a page where he can see all posts from all users. Each post include the username of the poster, the post content itself, the date and time at which the post was made, and the number of “likes” the post has. The most recent posts appear first.
# 🕒 Profile Page 
From user posts list, if the authenticated user clicks on a username, it takes him to user’s profile page. This page display the number of followers the user has, as well as the number of people that the user follows. It also display all of the posts for that user in reverse chronological order. To follow or unfollow this user, the authenticated user has a button to toggle between the two options.   
# 🕓 Following 
The “Following” link in the navigation bar take the authenticated user to a page where he see all posts made by users that he follows. This page is similar to "All Posts" page, but is limited to posts from users he follows.  
# 🕔 Pagination  
On any page that displays posts, posts are displayed 10 on a page. If there are more than ten posts, a “Next” button appears to take the user to the next page of posts (which are older than the current page of posts). If not on the first page, a “Previous” button appear to take the user to the previous page of posts as well.
# 🕔 Edit Post
Users are able to click the “Edit” button on any of their own posts to edit that post. When the content is updated, user can save it using "save" button. 
# 🕔 “Like” and “Unlike”  
Authenticated user is able to click like icon on any post to toggle whether or not he “likes” that post. The "likes" count is displayed and is updated each time a user click on that icon.
