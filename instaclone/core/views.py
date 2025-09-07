from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse


def home(request):
    return render(request, 'core/home.html')

def about(request):
    return render(request, 'core/about.html')
