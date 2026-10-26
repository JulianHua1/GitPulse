#!/usr/bin/env python3
"""
Simple HTTP server for running the dashboard locally in Replit
"""
import http.server
import socketserver
import os
import json
from urllib.parse import urlparse, parse_qs

class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Handle API endpoints for dashboard data
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            # Serve static files
            super().do_GET()
    
    def handle_api_request(self):
        """Handle API requests for dashboard data"""
        try:
            if self.path == '/api/streak-count':
                self.serve_file_content('logs/streak-count.txt', 'text/plain')
            elif self.path == '/api/activity-log':
                self.serve_file_content('logs/daily-activity.log', 'text/plain')
            elif self.path == '/api/last-update':
                self.serve_file_content('logs/last-update.txt', 'text/plain')
            elif self.path == '/api/streak-info':
                self.serve_file_content('logs/streak-info.txt', 'text/plain')
            else:
                self.send_error(404, "API endpoint not found")
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")
    
    def serve_file_content(self, file_path, content_type):
        """Serve file content with proper headers"""
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
            else:
                # Create demo data if file doesn't exist
                demo_content = self.get_demo_content(file_path)
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(demo_content.encode('utf-8'))
        except Exception as e:
            self.send_error(500, f"Error reading file: {str(e)}")
    
    def get_demo_content(self, file_path):
        """Generate demo content for missing files"""
        if 'streak-count.txt' in file_path:
            return "7"
        elif 'daily-activity.log' in file_path:
            from datetime import datetime, timedelta
            activities = []
            for i in range(7):
                date = datetime.now() - timedelta(days=i)
                activities.append(f"Daily activity commit - {date.strftime('%Y-%m-%d %H:%M:%S')} IST (Day {7-i})")
            return '\n'.join(reversed(activities))
        elif 'last-update.txt' in file_path:
            from datetime import datetime
            now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            return f"Last updated: {now} IST\nCurrent streak: 7 consecutive days"
        elif 'streak-info.txt' in file_path:
            from datetime import datetime, timedelta
            start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            return f"Streak started: {start_date}"
        return "Demo data"

def find_available_port(start_port=5000):
    """Find an available port starting from the given port"""
    import socket
    port = start_port
    while port < start_port + 100:  # Try up to 100 ports
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(("0.0.0.0", port))
                return port
        except OSError:
            port += 1
    raise RuntimeError("No available ports found")

def run_server():
    """Run the development server"""
    PORT = int(os.environ.get('PORT', '5000'))
    
    # Change to the directory containing the dashboard files
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create logs directory if it doesn't exist
    os.makedirs('logs', exist_ok=True)
    
    # Allow socket reuse
    class ReusableServer(socketserver.TCPServer):
        allow_reuse_address = True
    
    with ReusableServer(("127.0.0.1", PORT), DashboardHandler) as httpd:
        print(f"🚀 Dashboard server running on port {PORT}")
        print(f"📊 Open your dashboard at: http://127.0.0.1:{PORT}")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n⛔ Server stopped")

if __name__ == "__main__":
    run_server()
