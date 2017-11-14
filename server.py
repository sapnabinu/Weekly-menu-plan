#!/usr/bin/env python

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import json
import pprint
import createdb
import urlparse
import md5
import time
import Cookie

mealDB = None
loginCookieMap = {}

class S(BaseHTTPRequestHandler):

    mimeMap = { "html" : "text/html",
                "js" : "application/javascript",
                "css" : "text/css",
                "jpg" : "image/jpeg",
                "json" : "application/json" }

    getMap = { "/getrecipes" : "getRecipes",
               "/getplan" : "getPlan",
               "/login" : "login",
               "/logout" : "logout" }

    postMap = { "/addplan" : "addPlan",
                "/login" : "login",
                "/logout" : "logout", 
                "/newuser" : "newuser",
                "/addrecipe" : "addrecipe"}

    
    exemptedPaths = ["/homepage.html", "/login", "/newuser.html", "/newuser" ]

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

    def getRecipes(self):
        recipeList = {
            "BFST" : mealDB.getRecipe("BFST"),
            "LNCH" : mealDB.getRecipe("LNCH"),
            "DNNR" : mealDB.getRecipe("DNNR")
        }
        self._set_headers("json")
        self.wfile.write(json.dumps(recipeList))

    def getPlan(self):
        urlParts = urlparse.urlparse(self.path)
        reqParams = urlparse.parse_qs(urlparse.urlparse(self.path).query)
        print reqParams
        plan = mealDB.getPlan(reqParams["startDate"][0], reqParams["endDate"][0])
        self._set_headers("json")
        self.wfile.write(json.dumps(plan))        

    def do_GET(self):           
        urlParts = urlparse.urlparse(self.path)
        reqPath = urlParts.path

        if not self.path[-3:] in [".js", "css", "gif"] and not self.checkAuth():
            print "failing", self.path
            return
        
        fn = self.getMap.get( reqPath )
        if fn:
            getattr(self, fn)()
            return

        try:
            ext = reqPath.rsplit(".")[-1]
            print reqPath, ext, self.mimeMap.get(ext, "text/html")
            f = open(reqPath[1:], "rb")
            if self._set_headers(ext):
                self.wfile.write(f.read())
        except:
            self._set_headers(None)

    def do_HEAD(self):
        self._set_headers()

    def addPlan(self, data):
        for d in data:
            pprint.pprint(d)
        mealDB.addPlan(data)
        self._set_headers("html")
        
    def do_POST(self):
        print "post", self.path
        self.data_string = self.rfile.read(int(self.headers['Content-Length']))
        data = json.loads(self.data_string)

        urlParts = urlparse.urlparse(self.path)
        reqPath = urlParts.path
        print "post data:", data
        if self.checkAuth() or self.path in self.exemptedPaths:
            print "check dispatch"
            fn = self.postMap.get(reqPath)
            if fn:
                print "fn:", fn
                getattr(self, fn)(data)
                return
        else:
            print "authentication failed", self.exemptedPaths, self.path
        self._set_headers("None")
        
        
    #ADD RECIPE    
    def addrecipe(self, data):
        for d in data:
            pprint.pprint(d)
        mealDB.addrecipe(data)
        self._set_headers("html")
        
        

    def login(self, data):
        user = data["user"]
        password = data["password"]

        userPass = mealDB.getPassword(user)
        userPassMd5 = md5.md5(userPass).hexdigest()
        if password == userPassMd5:
            self._set_headers("json")
            cookie = md5.md5(str(time.time())).hexdigest()
            loginCookieMap[cookie] = user
            self.wfile.write(json.dumps({"authcookie" : cookie}))
        else:
            self.send_response(401)
            
 
    #NEW USER  
    def newuser(self,data):
        user = data["user"]
        password = data["password"]
               
        #  USERID,PASSWORD,FIRST_NAME,LAST_NAME,EMAIL,PHONE      
        mealDB.addUser(["",password,"","",user,""])
        self._set_headers("html")
       
                    

    def logout(self, data):
        cookie = self.checkAuth()
        if not cookie:
            return

        user = loginCookieMap.pop(cookie)
        self._set_headers("json")
        self.wfile.write(json.dumps({"user" : user}))
        
        

    def checkAuth(self):
        cookieObject = Cookie.SimpleCookie(self.headers.get("Cookie"))
        cookie = None
        if cookieObject:
            cookie = cookieObject['authcookie'].value
        user = loginCookieMap.get(cookie)
        print "User: {} [{}]".format(user, cookie)
        print self.exemptedPaths, self.path, self.path in self.exemptedPaths
        if not user and not self.path in self.exemptedPaths :
            self._set_headers("html")
            self.wfile.write(open("login.html").read())
            return None
        else:
            print "checkAuth succeeded", cookie
            return cookie or "exempt"
        
        
                             
def run(server_class=HTTPServer, handler_class=S, port=8000):
    global mealDB
    mealDB = createdb.MealDB()

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
