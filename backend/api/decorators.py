from functools import wraps
from rest_framework.response import Response
from rest_framework import status

def token_required(view_func):
    @wraps(view_func)
    def _wrapped_view(view, *args, **kwargs):
        if hasattr(view, 'request'):
            request = view.request
        else:
            request = view

        token = request.session.get('gmail_credentials') or request.headers.get('Authorization')
        print("\nhere\n")
        if not token:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_403_FORBIDDEN
            )
        return view_func(view, *args, **kwargs)
    return _wrapped_view