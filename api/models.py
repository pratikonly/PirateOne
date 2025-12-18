from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar_seed = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class WatchlistItem(models.Model):
    CONTENT_TYPES = [
        ('movie', 'Movie'),
        ('tv', 'TV Show'),
        ('anime', 'Anime'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist')
    content_id = models.CharField(max_length=50)
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPES)
    title = models.CharField(max_length=255)
    poster_path = models.CharField(max_length=255, blank=True)
    vote_average = models.FloatField(default=0)
    added_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = 'Watchlist Item'
        verbose_name_plural = 'Watchlist Items'
        unique_together = ['user', 'content_id', 'content_type']
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"


class WatchHistory(models.Model):
    CONTENT_TYPES = [
        ('movie', 'Movie'),
        ('tv', 'TV Show'),
        ('anime', 'Anime'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watch_history')
    content_id = models.CharField(max_length=50)
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPES)
    title = models.CharField(max_length=255)
    poster_path = models.CharField(max_length=255, blank=True)
    vote_average = models.FloatField(default=0)
    watched_at = models.DateTimeField(default=timezone.now)
    progress = models.IntegerField(default=0)
    season = models.IntegerField(null=True, blank=True)
    episode = models.IntegerField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Watch History'
        verbose_name_plural = 'Watch History'
        ordering = ['-watched_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"


class Rating(models.Model):
    CONTENT_TYPES = [
        ('movie', 'Movie'),
        ('tv', 'TV Show'),
        ('anime', 'Anime'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    content_id = models.CharField(max_length=50)
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPES)
    title = models.CharField(max_length=255)
    rating = models.IntegerField()
    rated_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = 'Rating'
        verbose_name_plural = 'Ratings'
        unique_together = ['user', 'content_id', 'content_type']
        ordering = ['-rated_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}: {self.rating}/10"
