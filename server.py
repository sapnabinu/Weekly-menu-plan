#!/usr/bin/env python

import SimpleHTTPServer

class MyHTTPRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        SimpleHTTPServer.SimpleHTTPRequestHandler.end_headers(self)

if __name__ == '__main__':
    SimpleHTTPServer.test(HandlerClass=MyHTTPRequestHandler)
