from typing import Callable, Optional, Any


def is_authenticated(func: Callable) -> Callable:
    def wrapper(*args: Optional[Any], **kwargs: Optional[Any]) -> object:  # noqa: ANN401
        if args[0].scope['user'] and not args[0].scope['user'].is_authenticated:
            return args[0].close()
        return func(*args, **kwargs)

    return wrapper
