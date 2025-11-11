from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse

class HealthCheckView(APIView):
    permission_classes = []
    
    def get(self, request):
        return Response({
            'status': 'success',
            'message': 'Django API работает корректно',
            'service': 'Dom Khvoi Backend'
        })

class ProtectedTestView(APIView):
    def get(self, request):
        return Response({
            'message': f'Привет, {request.user.username}!',
            'user_info': {
                'username': request.user.username,
                'email': request.user.email,
                'phone': request.user.phone
            }
        })

def root_view(request):
    """Корневой view с информацией об API"""
    html = """
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dom Khvoi API</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #2e5e4e 0%, #4a8d71 100%);
                color: #333;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                max-width: 800px;
                width: 100%;
                padding: 40px;
            }
            h1 {
                color: #2e5e4e;
                margin-bottom: 10px;
                font-size: 2.5rem;
            }
            .subtitle {
                color: #666;
                margin-bottom: 30px;
                font-size: 1.1rem;
            }
            .status {
                display: inline-block;
                background: #4a8d71;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.9rem;
                margin-bottom: 30px;
            }
            .endpoints {
                margin-top: 30px;
            }
            .endpoint {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 15px;
                border-left: 4px solid #2e5e4e;
            }
            .endpoint-method {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 0.85rem;
                margin-right: 10px;
            }
            .method-get { background: #4a8d71; color: white; }
            .method-post { background: #2e5e4e; color: white; }
            .endpoint-url {
                font-family: 'Courier New', monospace;
                color: #2e5e4e;
                font-weight: 600;
            }
            .endpoint-desc {
                color: #666;
                margin-top: 8px;
                font-size: 0.9rem;
            }
            .links {
                margin-top: 30px;
                padding-top: 30px;
                border-top: 1px solid #eee;
            }
            .links a {
                color: #2e5e4e;
                text-decoration: none;
                margin-right: 20px;
                font-weight: 600;
            }
            .links a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🌲 Dom Khvoi API</h1>
            <p class="subtitle">REST API для управления пользователями и заказами</p>
            <span class="status">✓ API работает</span>
            
            <div class="endpoints">
                <h2 style="color: #2e5e4e; margin-bottom: 20px;">Доступные endpoints:</h2>
                
                <div class="endpoint">
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/health/</span>
                    <div class="endpoint-desc">Проверка работоспособности API</div>
                </div>
                
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/auth/register/</span>
                    <div class="endpoint-desc">Регистрация нового пользователя</div>
                </div>
                
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/auth/login/</span>
                    <div class="endpoint-desc">Вход пользователя (получение JWT токена)</div>
                </div>
                
                <div class="endpoint">
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/auth/profile/</span>
                    <div class="endpoint-desc">Получение профиля пользователя (требует аутентификации)</div>
                </div>
                
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/auth/logout/</span>
                    <div class="endpoint-desc">Выход пользователя</div>
                </div>
                
                <div class="endpoint">
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/test-protected/</span>
                    <div class="endpoint-desc">Тестовый защищенный endpoint (требует аутентификации)</div>
                </div>
            </div>
            
            <div class="links">
                <a href="/api/health/">Проверить API</a>
                <a href="/admin/">Админ панель</a>
                <a href="http://localhost:3000" target="_blank">Frontend (порт 3000)</a>
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)