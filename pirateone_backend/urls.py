from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
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

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
