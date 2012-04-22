(function($) {
    var SOCKET_ADDRESS = "ws://192.168.88.44:8880/nutria";
    var WIDTH = $("#canvas").width();
    var HEIGHT = $("#canvas").height();
    
    var backgroundImage1 = new Bitmap("/skins/default/img/background1.png");
    var entities = {};
    
    var stage, zombie, manager, socket, text, nick;
    
    window.tick = function() {
        stage.update();
    };
        
    function onCanvasClick() {
    }
    
    function createZombieOnPressHandler(zombie) {
        return function(evt) {
            zombie.kill();
        }
    }
    
    function restart() {
        stage.clear();
        stage.addChild(backgroundImage1);
        stage.tickOnUpdate = true;
    }

    function processMessage(data) {
        data = $.parseJSON(data);
        
        console.log("RECV:", data);
        
        var entity = null;

        function getNick(nick) {
            return "hipster_" + nick.replace(/[^a-zA-Z0-9_]/g, "");
        }
        
        function getHipster(nick) {
            var sane = getNick(nick);
            var $p = $("#hipsters ." + sane);
            if ($p.length === 0) {
                $("#hipsters").append('<div class="' + sane + '">' + nick + ": <span></span></div>");
                $p = $("#hipsters ." + sane);
            }
            return $p;
        }

        if (data.type === "join" || data.type === "score") {
            var nick = getNick(data.nick);
            
            if (data.player) {
                var avatar = entities[nick];
                if (avatar) {
                    stage.removeChild(avatar);
                    delete entities[nick];
                }
                avatar = new Avatar(data.nick, data.player.avatar, data.player.x, data.player.y);
                stage.addChild(avatar);
                entities[nick] = avatar;
            }
            
            getHipster(data.nick).find("span").text(data.value);
        }

        function createMonster(manager, id, pos, target) {
            if (pos.y < 300 || target.y < 300)
                return new Pipistrello(manager, id, pos, target);
            else
                return new Zombie(manager, id, pos, target);
        }
        
        if (data.type === "zombie") {
            if (data.action && data.action.type === "remove") {
                var monster = entities[data.id];
                if (monster) {
                    monster.beginRemove("squash", data.nick);
                    delete entities[data.id];
                }
            }
            else if (data.action && data.action.type === "follow") {
                var target = entities[getNick(data.action.follow)];
                if (!target)
                    target = {x:Math.random()*WIDTH*2, y:Math.random()*HEIGHT*2}
                entity = createMonster(manager, data.id, {x:data.x*WIDTH, y:data.y*HEIGHT}, target);
            }
            else if (data.action && data.action.type === "moveto") {
                entity = createMonster(manager, data.id, {x: data.x*WIDTH, y: data.y*HEIGHT},
                    {x: data.action.x*WIDTH, y: data.action.y*HEIGHT});   
            }
            else {
                entity = createMonster(manager, data.id, {x: data.x*WIDTH, y: data.y*HEIGHT},
                    {x: data.x*WIDTH, y: data.y*HEIGHT});   
            }
            
            if (entity)
                entity.onPress = createZombieOnPressHandler(entity);
        }

        if (data.type === "text") {
            if (text)
                stage.removeChild(text);
            text = new Text(data.value, "bold 24px Arial", "#fff");
            text.x = Math.random() * WIDTH * 0.4 + 20;
            text.y = Math.random() * HEIGHT * 0.9 + 20;
            text.shadow = new Shadow("#000", 3, 2, 2);
            text.lineWidth = WIDTH * 0.5;
            stage.addChild(text);
        }
        
        if (entity) {
            entities[entity.id] = entity;
            stage.addChild(entity);
        }
    }
    
    function connect(callback) {
        var socket = null;
        
        if ('WebSocket' in window) {
            socket = new WebSocket(SOCKET_ADDRESS);
        } 
        else if ('MozWebSocket' in window) {
            socket = new MozWebSocket(SOCKET_ADDRESS);
        } 
        else {
            alert("FUCK! FUCK! FUCK!");
            return null;
        }

        socket.onmessage = function(event) {
            processMessage(event.data);
        };

        socket.onopen = callback || function(event) {};
        
        socket.onerror = function() { console.log("CLOSE! CLOSE! CLOSE! (FUCK!)"); };
        socket.onclose = function(event) {};
        
        return socket;
    }
    
    function init() {        
        manager = {
            send : function(data) {
                data.nick = nick;
                socket.send(JSON.stringify(data)); 
                console.log("SEND: " + JSON.stringify(data));           
            }
        };
        
        stage = new Stage($("#canvas")[0]);
        stage.canvas.onclick = onCanvasClick;
        
        Ticker.addListener(window);
        
        restart();
        
        $("form button").on('click', function(evt) {
            nick = $("input[name=nick]").val();
            var avatar = $(evt.target).closest("button").val();
            var x = Math.random() * WIDTH * 0.8 + 50;
            var y = Math.random() * HEIGHT * 0.3 + 300
            if (nick) {
                if (socket)
                    socket.close();
                socket = connect(function() { manager.send({action: "join", player: {avatar: avatar, x: x, y: y}}); });
            }
            return false;
        });
    }
    
    $(init);
    
})(jQuery);
