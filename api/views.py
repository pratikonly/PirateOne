import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import User, WatchlistItem, WatchHistory, Rating


def get_user_data(user):
    return {
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'avatar_seed': user.avatar_seed or user.email,
        'created_at': user.created_at.isoformat(),
        'date_joined': user.date_joined.isoformat(),
    }


@csrf_exempt
@require_http_methods(["POST"])
def register_view(request):
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        
        if not email or not password:
            return JsonResponse({'error': 'Email and password are required'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already registered'}, status=400)
        
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name,
            avatar_seed=email,
        )
        
        login(request, user)
        
        return JsonResponse({
            'success': True,
            'user': get_user_data(user)
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return JsonResponse({'error': 'Email and password are required'}, status=400)
        
        user = authenticate(request, username=email, password=password)
        
        if user is None:
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                'success': True,
                'user': get_user_data(user)
            })
        else:
            return JsonResponse({'error': 'Invalid email or password'}, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    logout(request)
    return JsonResponse({'success': True})


@csrf_exempt
@require_http_methods(["GET"])
def check_auth_view(request):
    if request.user.is_authenticated:
        return JsonResponse({
            'authenticated': True,
            'user': get_user_data(request.user)
        })
    return JsonResponse({'authenticated': False})


@csrf_exempt
@require_http_methods(["GET", "POST", "DELETE"])
def watchlist_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    if request.method == 'GET':
        items = WatchlistItem.objects.filter(user=request.user)
        return JsonResponse({
            'watchlist': [{
                'id': item.id,
                'content_id': item.content_id,
                'content_type': item.content_type,
                'title': item.title,
                'poster_path': item.poster_path,
                'vote_average': item.vote_average,
                'added_at': item.added_at.isoformat(),
            } for item in items]
        })
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            item, created = WatchlistItem.objects.update_or_create(
                user=request.user,
                content_id=str(data.get('content_id')),
                content_type=data.get('content_type', 'movie'),
                defaults={
                    'title': data.get('title', ''),
                    'poster_path': data.get('poster_path', ''),
                    'vote_average': data.get('vote_average', 0),
                }
            )
            return JsonResponse({
                'success': True,
                'created': created,
                'item': {
                    'id': item.id,
                    'content_id': item.content_id,
                    'content_type': item.content_type,
                    'title': item.title,
                }
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            content_id = str(data.get('content_id'))
            content_type = data.get('content_type', 'movie')
            
            deleted, _ = WatchlistItem.objects.filter(
                user=request.user,
                content_id=content_id,
                content_type=content_type
            ).delete()
            
            return JsonResponse({'success': True, 'deleted': deleted > 0})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "POST", "DELETE"])
def history_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    if request.method == 'GET':
        items = WatchHistory.objects.filter(user=request.user)[:50]
        return JsonResponse({
            'history': [{
                'id': item.id,
                'content_id': item.content_id,
                'content_type': item.content_type,
                'title': item.title,
                'poster_path': item.poster_path,
                'vote_average': item.vote_average,
                'watched_at': item.watched_at.isoformat(),
                'progress': item.progress,
                'season': item.season,
                'episode': item.episode,
            } for item in items]
        })
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            item = WatchHistory.objects.create(
                user=request.user,
                content_id=str(data.get('content_id')),
                content_type=data.get('content_type', 'movie'),
                title=data.get('title', ''),
                poster_path=data.get('poster_path', ''),
                vote_average=data.get('vote_average', 0),
                progress=data.get('progress', 0),
                season=data.get('season'),
                episode=data.get('episode'),
            )
            return JsonResponse({'success': True, 'id': item.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    elif request.method == 'DELETE':
        try:
            WatchHistory.objects.filter(user=request.user).delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def ratings_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    if request.method == 'GET':
        ratings = Rating.objects.filter(user=request.user)
        return JsonResponse({
            'ratings': [{
                'id': item.id,
                'content_id': item.content_id,
                'content_type': item.content_type,
                'title': item.title,
                'rating': item.rating,
                'rated_at': item.rated_at.isoformat(),
            } for item in ratings]
        })
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            rating, created = Rating.objects.update_or_create(
                user=request.user,
                content_id=str(data.get('content_id')),
                content_type=data.get('content_type', 'movie'),
                defaults={
                    'title': data.get('title', ''),
                    'rating': data.get('rating', 0),
                }
            )
            return JsonResponse({'success': True, 'id': rating.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def check_watchlist_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'in_watchlist': False})
    
    content_id = request.GET.get('content_id')
    content_type = request.GET.get('content_type', 'movie')
    
    exists = WatchlistItem.objects.filter(
        user=request.user,
        content_id=content_id,
        content_type=content_type
    ).exists()
    
    return JsonResponse({'in_watchlist': exists})
