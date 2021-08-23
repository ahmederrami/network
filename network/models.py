from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', blank=True, related_name='followers',symmetrical=False)

    def follow_unfollow(self,user):
        if self.id != user.id: # can't follow themselves
            if user in self.following.all():
                self.following.remove(user)
            else:
                self.following.add(user)


class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(blank=False, null=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    likedBy = models.ManyToManyField(User, blank=True, related_name='liked_posts')

    def like_unlike(self,user):
        if user in self.likedBy.all():
            self.likedBy.remove(user)
        else:
            self.likedBy.add(user)
        self.save()

    def serialize(self):
        return {
            "id": self.pk,
            "user": self.owner.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%m/%d/%Y, %H:%M:%S"),
            "likes": self.likedBy.all().count(),
            "liked_by" : [user.username for user in self.likedBy.all()]
        }