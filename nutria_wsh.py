# Copyright 2011, Google Inc.
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are
# met:
#
#     * Redistributions of source code must retain the above copyright
# notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above
# copyright notice, this list of conditions and the following disclaimer
# in the documentation and/or other materials provided with the
# distribution.
#     * Neither the name of Google Inc. nor the names of its
# contributors may be used to endorse or promote products derived from
# this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
# A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
# THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
import simplejson
import random
from mod_pywebsocket._stream_base import BadOperationException
import logging
logger = logging.getLogger("main")


_GOODBYE_MESSAGE = u'Goodbye from Hackathon!'
world = {}
requests = []
scores = {}
players = {}

f = open("/home/panisson/development/hackathon/pywebsocket/piemontesina.txt")
piemontesina = f.readlines()

def process(message):
    print message
    
    user = message['nick']
    
    if 'action' in message and message['action'] == 'join':
        if user not in scores: scores[user] = 0
        players[user] = message['player']
        send_message(simplejson.dumps({'nick':user, 'type':'join', 'player': message['player']}))
        print '####', user, 'connected', '####'
    
    if 'action' in message and message['action'] == 'kill':
        if 'target_id' in message:
            print '##################', user, 'killed', '####'
            scores[user] -= 1
            id = message['id']
            o = world[id]
            send_message(simplejson.dumps({'nick':user, 'type':'score', 'value':scores[user]}))
            send_message(simplejson.dumps({'id':o.id, 'type':o.type, 'nick':user, 'action':{'type':'remove'}}))
   
    
    if 'type' in message and message['type'] == 'kill':
        
        if 'target_id' in message:
            print '##################', user, 'killed', '####'
            scores[user] -= 1
            id = message['id']
            o = world[id]
            send_message(simplejson.dumps({'nick':user, 'type':'score', 'value':scores[user]}))
            send_message(simplejson.dumps({'id':o.id, 'type':o.type, 'nick':user, 'action':{'type':'remove'}}))
        
        if 'id' in message:
            id = message['id']
            if id in world:
                o = world[id]
                send_message(simplejson.dumps({'id':o.id, 'type':o.type, 'nick':user, 'action':{'type':'remove'}}))
                del world[id]
                scores[user] += 1
                send_message(simplejson.dumps({'nick':user, 'type':'score', 'value':scores[user]}))
            
    if 'action' in message and message['action'] == 'squash':
        id = message['id']
        if id in world:
            o = world[id]
            send_message(simplejson.dumps({'id':o.id, 'type':o.type, 'nick':user, 'action':{'type':'remove'}}))
            del world[id]
            scores[user] += 1
            send_message(simplejson.dumps({'nick':user, 'type':'score', 'value':scores[user]}))
            
            
def send_message(msg):
    print 'Sending message:', msg
    for r in requests:
        #r.ws_stream.send_message('Hackathon: ping', binary=False)
        try:
            r.ws_stream.send_message(msg, binary=False)
        except BadOperationException:
            requests.remove(r)

def web_socket_do_extra_handshake(request):
    # This example handler accepts any request. See origin_check_wsh.py for how
    # to reject access from untrusted scripts based on origin value.

    pass  # Always accept.

def web_socket_transfer_data(request):
    
    print '#### New connection'
    
    requests.append(request)
    
    for user in scores:
        send_message(simplejson.dumps({'nick':user, 'type':'score', 'value':scores[user]}))
        send_message(simplejson.dumps({'nick':user, 'type':'join', 'player':players[user]}))
    
#    for k in world:
#        request.ws_stream.send_message(world[k].to_json(), binary=False)
    
    
    while True:
        try:
            line = request.ws_stream.receive_message()
            if line is None:
                requests.remove(request)
                return
            if isinstance(line, unicode):
                message = simplejson.loads(line)
                process(message)
                if line == _GOODBYE_MESSAGE:
                    return
        except Exception, e:
            logger.error(str(e), exc_info=True)
            requests.remove(request)
        
    print '#### Disconnected'
#        else:
#            request.ws_stream.send_message('Hackathon: '+line, binary=True)

from threading import Thread
import time

class GameObject(object):
    def __init__(self, id, type=None, pos=(0.,0.)):
        self.id = id
        self.type = type
        self.pos = pos
        self.action = None
        
    def to_json(self):
        data = {'id':self.id, 'type':self.type, 'x':self.pos[0], 'y':self.pos[1]}
        if self.action: data['action'] = self.action
        return simplejson.dumps(data)

def game():
    
    t = 0
    id_count = 0
    t_next = 0
    
    while True:
        try:
            
#            if len(world.keys()) == 0:
#                time.sleep(0.2)
#                continue
            
            t += 1
            time.sleep(0.2)
            
            if len(world.keys()) > 100:
                id = random.choice(world.keys())
                o = world[id]
                del world[id]
                send_message(simplejson.dumps({'id':o.id, 'type':o.type, 'nick':'', 'action':{'type':'remove'}}))
            
            if int(t) % 25 == 0:
                i = t/25 % len(piemontesina)
                print 'sending line ', i, 'from piemontesina'
                send_message(simplejson.dumps({'type':'text', 'value':piemontesina[i][:-1]}))
            
    #        print t % (10+int(len(world.keys())/2))
    
            if len(scores) == 0:
                world.clear()
            
            if t > t_next and len(scores) > 0:
                t_next = t + 25 / (len(scores)+1)
            
                x = random.random()
                y = random.random()
                
                r = random.random()
                if len(world.keys()) > 0 and r < 0.5:
                    o = GameObject(id_count, type='zombie', pos=(x,y))
                    o.action = {'type':'follow', 'follow': random.choice(players.keys())}
#                elif len(world.keys()) and r < 0.4:
#                    o = GameObject(id_count, type='cippa', pos=(x,y))
#                    o.action = {'type':'follow', 'follow': random.choice(world.keys())}
                elif r < 0.8:
                    o = GameObject(id_count, type='zombie', pos=(x,y))
                    o.action = {'type':'moveto', 'x': random.random(), 'y': random.random()}
                else:
                    o = GameObject(id_count, type='zombie', pos=(x,y))
                
                id_count+=1
                world[o.id] = o
                send_message(o.to_json())
        except Exception, e:
            logger.error(str(e), exc_info=True)

Thread(target=game).start()


# vi:sts=4 sw=4 et
