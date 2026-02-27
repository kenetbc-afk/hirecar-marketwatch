#!/usr/bin/env python3
"""Simple HTTP server that explicitly sets the directory to avoid os.getcwd() sandbox issues."""
import http.server
import socketserver
import sys
import os

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
directory = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

with socketserver.TCPServer(("", port), Handler) as httpd:
    print(f"Serving {directory} on http://localhost:{port}")
    httpd.serve_forever()
