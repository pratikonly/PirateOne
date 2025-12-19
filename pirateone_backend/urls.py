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

    # Frontend routes - clean URLs (no .html in browser)
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='login.html'), name='login_page'),
    path('register/', TemplateView.as_view(template_name='register.html'), name='register_page'),
    path('movies/', TemplateView.as_view(template_name='movies.html'), name='movies'),
    path('tvshows/', TemplateView.as_view(template_name='tvshows.html'), name='tvshows'),
    path('anime/', TemplateView.as_view(template_name='anime.html'), name='anime'),
    path('search/', TemplateView.as_view(template_name='search.html'), name='search'),
    path('player/', TemplateView.as_view(template_name='player.html'), name='player'),
    path('watchlist/', TemplateView.as_view(template_name='watchlist.html'), name='watchlist'),
    path('history/', TemplateView.as_view(template_name='history.html'), name='history'),
    path('profile/', TemplateView.as_view(template_name='profile.html'), name='profile'),
    path('settings/', TemplateView.as_view(template_name='settings.html'), name='settings'),
]

# ONLY add static serving in DEBUG mode (local development)
if settings.DEBUG:
    from django.conf.urls.static import static
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static('/css/', document_root=str(settings.BASE_DIR / 'css'))
    urlpatterns += static('/js/', document_root=str(settings.BASE_DIR / 'js'))