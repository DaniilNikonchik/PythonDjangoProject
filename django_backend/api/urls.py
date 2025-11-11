from django.urls import path
from .views import HealthCheckView, ProtectedTestView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('test-protected/', ProtectedTestView.as_view(), name='test-protected'),
]