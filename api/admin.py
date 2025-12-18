from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, WatchlistItem, WatchHistory, Rating


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'is_active', 'is_staff', 'created_at', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('avatar_seed', 'created_at')}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('email',)}),
    )
    
    readonly_fields = ('created_at', 'date_joined', 'last_login')


@admin.register(WatchlistItem)
class WatchlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'content_type', 'vote_average', 'added_at')
    list_filter = ('content_type', 'added_at')
    search_fields = ('user__email', 'title', 'content_id')
    ordering = ('-added_at',)
    raw_id_fields = ('user',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(WatchHistory)
class WatchHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'content_type', 'progress', 'watched_at')
    list_filter = ('content_type', 'watched_at')
    search_fields = ('user__email', 'title', 'content_id')
    ordering = ('-watched_at',)
    raw_id_fields = ('user',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'content_type', 'rating', 'rated_at')
    list_filter = ('content_type', 'rating', 'rated_at')
    search_fields = ('user__email', 'title', 'content_id')
    ordering = ('-rated_at',)
    raw_id_fields = ('user',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
