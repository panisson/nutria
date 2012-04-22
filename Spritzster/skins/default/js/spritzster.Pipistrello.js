(function($) {
    var SPEED = 2.0;
    
    function Pipistrello(manager, id, pos, target) {
        this.initialize(manager, id, pos, target);
        return this;
    }
    Pipistrello.prototype = new BitmapAnimation();
    
    Pipistrello.prototype.BitmapAnimation_initialize = Pipistrello.prototype.initialize;
    
    Pipistrello.prototype.initialize = function(manager, id, pos, target) {
        var t = ""; //"?v=" + new Date()  .getTime();
        var localSpriteSheet = new SpriteSheet({
            images: ["/skins/default/img/pipistrello.png"+t],
            frames: {width: 70, height: 60, regX: 30, regY: 35},
            animations: {
                walk_right: [0, 2, "walk_right", 2]
            }
        });

        this.BitmapAnimation_initialize(localSpriteSheet);
        this.x = pos.x || 0;
        this.y = pos.y || 0;
        this.target = target;
        this.manager = manager;
        this.id = id;

        // start playing the first sequence:
        this.gotoAndPlay("walk_right");

        this.direction = 1;
        this.vX = 2;
        this.vY = 2;
        this.hunting = true;
        this.countdown = -1;
    };    
    
    Pipistrello.prototype.onTick = function() {
        // Moving the sprite based on the direction & the speed
        if (this.hunting) {
            var dx = this.target.x - this.x;
            var dy = this.target.y - this.y;
            var d  = Math.sqrt(dx * dx + dy * dy);
            if (d > SPEED) {
                var r = SPEED / d;
                this.x += r * dx; 
                this.y += r * dy;       
            }
            else {
                this.hunting = false;
                if (this.target.id) {
                    this.manager.send({type: "zombie", action: "kill", id: this.id, target_id: this.target.id});
                }
                else {
                    this.manager.send({type: "zombie", action: "arrived", id: this.id});
                }
                
            }
        }
        
        if (this.countdown >= 0) {
            if (this.countdown === 0) {
                if (this.text)
                    this.parent.removeChild(this.text);
                this.parent.removeChild(this);
            }   
            else
                this.countdown -= 1;
        }
    };
    
    Pipistrello.prototype.hitPoint = function(tX, tY) {
        return this.hitRadius(tX, tY, 0);
    };

    Pipistrello.prototype.hitRadius = function(tX, tY, tHit) {
        //early returns speed it up
        if (tX - tHit > this.x + this.hit) { return; }
        if (tX + tHit < this.x - this.hit) { return; }
        if (tY - tHit > this.y + this.hit) { return; }
        if (tY + tHit < this.y - this.hit) { return; }

        //now do the circle distance test
        return this.hit + tHit > Math.sqrt(Math.pow(Math.abs(this.x - tX), 2) + Math.pow(Math.abs(this.y - tY), 2));
    };
    
    Pipistrello.prototype.kill = function() {
        this.manager.send({type: "zombie", action: "squash", id: this.id});
    }

    Pipistrello.prototype.beginRemove = function(mode, nick) {
        if (mode === "squash") {
            this.countdown = 20;
            this.hunting = false;
            this.text = new Text(nick, "12px Arial", "#fff");
            this.text.x = this.x;
            this.text.y = this.y - 20;
            this.text.shadow = new Shadow("#000", 3, 2, 2);
            this.parent.addChild(this.text);
        }
    }
    
    window.Pipistrello = Pipistrello;
})(jQuery);

