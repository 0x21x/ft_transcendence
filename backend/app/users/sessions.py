from uuid import uuid4
from rest_framework_simplejwt.tokens import AuthUser
from .models.sessions import Sessions

class NoTokenError(Exception):
    pass

def get_session_token_for_user(user: AuthUser) -> str:
    session = Sessions.objects.get_or_create(user=user)[0]
    if session.token is None:
        raise NoTokenError
    return session.token

def login_session(user: AuthUser) -> None:
    session = Sessions.objects.get_or_create(user=user)[0]
    session.token = uuid4().hex
    session.save()
    return session

def logout_session(user: AuthUser) -> None:
    session = Sessions.objects.get_or_create(user=user)[0]
    session.token = None
    session.save()

def check_session(user: AuthUser, token: str) -> bool:
    try:
        session_token = get_session_token_for_user(user)
        if session_token != token:
            return False
    except NoTokenError:
        return True
    return True