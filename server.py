#!/usr/bin/env python3
"""
Lightweight HTTP Server for Cyberpunk Quantum Death-Roll Randomiser.
Usage:
    uv run --python C:\\Users\\adder\\.gemini\\venv python server.py
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

def main():
    os.chdir(DIRECTORY)
    # Enable address reuse so port isn't blocked on restart
    socketserver.TCPServer.allow_reuse_address = True
    
    # Try PORT, fallback to 8081 if in use
    global PORT
    for p in [8080, 8081, 8082, 8000]:
        try:
            with socketserver.TCPServer(("", p), Handler) as httpd:
                PORT = p
                url = f"http://localhost:{PORT}"
                print(f"================================================================")
                print(f"  QUANTUM DEATH-ROLL TRUE RANDOMISER ONLINE")
                print(f"  Local HUD: {url}")
                print(f"================================================================")
                print("Press Ctrl+C to terminate the server.\n")
                webbrowser.open(url)
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == "__main__":
    main()
