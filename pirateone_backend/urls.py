from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.http import HttpResponse
from django.views.static import serve
import os

def config_js_view(request):
    tmdb_key = os.environ.get('TMDB_API_KEY', '')
    content = f'''window.CONFIG = {{
    TMDB_API_KEY: '{tmdb_key}'
}};
'''
    return HttpResponse(content, content_type='application/javascript')

# Static file serving routes (must come FIRST)
urlpatterns = [
    re_path(r'^css/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'css')}),
    re_path(r'^js/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'js')}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]

# Dynamic routes
urlpatterns += [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('config.js', config_js_view, name='config_js'),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('login.html', TemplateView.as_view(template_name='login.html'), name='login_page'),
    path('register.html', TemplateView.as_view(template_name='register.html'), name='register_page'),
    path('movies.html', TemplateView.as_view(template_name='movies.html'), name='movies'),
    path('tvshows.html', TemplateView.as_view(template_name='tvshows.html'), name='tvshows'),
    path('anime.html', TemplateView.as_view(template_name='anime.html'), name='anime'),
    path('search.html', TemplateView.as_view(template_name='search.html'), name='search'),
    path('player.html', TemplateView.as_view(template_name='player.html'), name='player'),
    path('watchlist.html', TemplateView.as_view(template_name='watchlist.html'), name='watchlist'),
    path('history.html', TemplateView.as_view(template_name='history.html'), name='history'),
    path('profile.html', TemplateView.as_view(template_name='profile.html'), name='profile'),
    path('settings.html', TemplateView.as_view(template_name='settings.html'), name='settings'),
]
