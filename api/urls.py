from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('check-auth/', views.check_auth_view, name='check_auth'),
    path('watchlist/', views.watchlist_view, name='watchlist'),
    path('watchlist/check/', views.check_watchlist_view, name='check_watchlist'),
    path('history/', views.history_view, name='history'),
    path('ratings/', views.ratings_view, name='ratings'),
]
