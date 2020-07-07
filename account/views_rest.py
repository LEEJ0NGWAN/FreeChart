# TODO: login & logout


@api_view(["POST"])
@csrf_exempt
def login(request):
    """
    {string} username(email)
    {string} password
    """
    pass

@api_view(["POST"])
@permission_classes((AllowAny,))
def logout(request):
    pass