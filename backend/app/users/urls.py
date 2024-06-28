from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, VerifyView, Auth42View, Callback42View

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('verify/', VerifyView.as_view()),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('42/', Auth42View.as_view(), name='auth42'),
    path('42/callback/', Callback42View.as_view(), name='auth42_callback'),
]