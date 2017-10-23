#!/usr/bin/env python

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import json
import pprint

class S(BaseHTTPRequestHandler):

    mimeMap = { "html" : "text/html",
                "js" : "application/javascript",
                "css" : "text/css",
                "jpg" : "image/jpeg" }
    
    def _set_headers(self, extension):
        mimetype = self.mimeMap.get(extension)
        if not mimetype:
            self.send_response(404)
        else:
            self.send_response(200)
        self.send_header('Content-type', mimetype)
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.end_headers()

        return bool(mimetype)

    def do_GET(self):
        try:
            ext = self.path.rsplit(".")[-1]
            print self.path, ext, self.mimeMap.get(ext, "text/html")
            f = open(self.path[1:], "rb")
            if self._set_headers(ext):
                self.wfile.write(f.read())
        except:
            self._set_headers(None)

    def do_HEAD(self):
        self._set_headers()

    def addPlan(self, data):
        for d in data:
            pprint.pprint(d)
        
    def do_POST(self):
        self.data_string = self.rfile.read(int(self.headers['Content-Length']))
        data = json.loads(self.data_string)

        if self.path == "/addplan":
            self.addPlan(data)
        else:
            print "Nothing to do"

        self._set_headers("html")
        return

def run(server_class=HTTPServer, handler_class=S, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print 'Starting httpd...'
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

if len(argv) == 2:
    run(port=int(argv[1]))
else:
    run()

# 
# import SimpleHTTPServer
# 
# class MyHTTPRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
#     def end_headers(self):
#         self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
#         self.send_header("Pragma", "no-cache")
#         self.send_header("Expires", "0")
#         SimpleHTTPServer.SimpleHTTPRequestHandler.end_headers(self)
# 
# if __name__ == '__main__':
#     SimpleHTTPServer.test(HandlerClass=MyHTTPRequestHandler)
# 
