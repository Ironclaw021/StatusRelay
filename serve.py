#!/usr/bin/env python3
"""
Simple Python HTTP server launcher for the Discord Status Checker.
No npm/Node required — uses Python's built-in http.server.
Serves on http://localhost:3000
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path
import time

PORT = 3000
HANDLER = http.server.SimpleHTTPRequestHandler

def main():
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    print(f"Starting HTTP server on http://localhost:{PORT}")
    print(f"Serving files from: {project_root}")
    print("Press Ctrl+C to stop.\n")
    
    try:
        with socketserver.TCPServer(("", PORT), HANDLER) as httpd:
            # Open browser after a short delay
            time.sleep(0.5)
            webbrowser.open(f"http://localhost:{PORT}")
            
            print(f"Server running! Open http://localhost:{PORT} in your browser.")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
    except OSError as e:
        if e.errno == 48 or e.errno == 98:  # Address already in use
            print(f"Error: Port {PORT} is already in use.")
            print("Try closing other instances or use a different port.")
        else:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
