from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.http import HttpResponse
from django.conf import settings
import os

def config_js_view(request):
    tmdb_key = os.environ.get('TMDB_API_KEY', '')
    content = f'''window.CONFIG = {{
    TMDB_API_KEY: '{tmdb_key}'
}};
'''
    return HttpResponse(content, content_type='application/javascript')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('config.js', config_js_view, name='config_js'),

    # Frontend routes - now with 'api/' prefix for templates
    path('', TemplateView.as_view(template_name='api/index.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='api/login.html'), name='login_page'),
    path('register/', TemplateView.as_view(template_name='api/register.html'), name='register_page'),
    path('movies/', TemplateView.as_view(template_name='api/movies.html'), name='movies'),
    path('tvshows/', TemplateView.as_view(template_name='api/tvshows.html'), name='tvshows'),
    path('anime/', TemplateView.as_view(template_name='api/anime.html'), name='anime'),
    path('search/', TemplateView.as_view(template_name='api/search.html'), name='search'),
    path('player/', TemplateView.as_view(template_name='api/player.html'), name='player'),
    path('watchlist/', TemplateView.as_view(template_name='api/watchlist.html'), name='watchlist'),
    path('history/', TemplateView.as_view(template_name='api/history.html'), name='history'),
    path('profile/', TemplateView.as_view(template_name='api/profile.html'), name='profile'),
    path('settings/', TemplateView.as_view(template_name='api/settings.html'), name='settings'),
]

# ONLY add static serving in DEBUG mode (local development)
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static('/css/', document_root=str(settings.BASE_DIR / 'css'))
    urlpatterns += static('/js/', document_root=str(settings.BASE_DIR / 'js'))