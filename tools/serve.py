#!/usr/bin/env python3
"""Local preview of public/ that behaves like production nginx:
missing paths get public/404.html with a real 404 status.
Usage: python3 serve.py [port]   (binds 127.0.0.1 only)
"""
import functools
import http.server
import pathlib
import sys

PUBLIC = pathlib.Path(__file__).resolve().parent.parent / "public"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8787


class Handler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        page = PUBLIC / "404.html"
        if code == 404 and page.is_file():
            body = page.read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)


handler = functools.partial(Handler, directory=str(PUBLIC))
with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
    print(f"Serving {PUBLIC} on http://127.0.0.1:{PORT} (Ctrl+C to stop)")
    httpd.serve_forever()
