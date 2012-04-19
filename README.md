First, get the mod_pywebsocket package by running:
```
$ svn checkout http://pywebsocket.googlecode.com/svn/trunk/src/mod_pywebsocket mod_pywebsocket
```
After, run the pywebsocket standalone server with the command:
```
$ python mod_pywebsocket/standalone.py -m handler_map.txt -p 8080
```
There's still a problem on stopping the thread created in the application, so to stop the server you must use kill -9
