(function($) {
    var SPEED = 2.0;
    
    function Zombie(manager, id, pos, target) {
        this.initialize(manager, id, pos, target);
        return this;
    }
    Zombie.prototype = new BitmapAnimation();
    
    Zombie.prototype.BitmapAnimation_initialize = Zombie.prototype.initialize;
    
    Zombie.prototype.initialize = function(manager, id, pos, target) {
        var t = ""; //"?v=" + new Date()  .getTime();
        var localSpriteSheet = new SpriteSheet({
            images: ["/skins/default/img/zombie_left.png"+t, "/skins/default/img/zombie_right.png"+t],
            frames: {width: 46, height: 44, regX: 22, regY: 23},
            animations: {
                walk_left: [0, 11, "walk_left", 2],
                walk_right: [12, 23, "walk_right", 2],
                squash_right: [24, 28, false, 2]
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
    
    Zombie.prototype.onTick = function() {
        // Moving the sprite based on the direction & the speed
        if (this.hunting) {
            var dx = this.target.x - this.x + 20;
            var dy = this.target.y - this.y + 20;
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
    
    Zombie.prototype.hitPoint = function(tX, tY) {
        return this.hitRadius(tX, tY, 0);
    };

    Zombie.prototype.hitRadius = function(tX, tY, tHit) {
        //early returns speed it up
        if (tX - tHit > this.x + this.hit) { return; }
        if (tX + tHit < this.x - this.hit) { return; }
        if (tY - tHit > this.y + this.hit) { return; }
        if (tY + tHit < this.y - this.hit) { return; }

        //now do the circle distance test
        return this.hit + tHit > Math.sqrt(Math.pow(Math.abs(this.x - tX), 2) + Math.pow(Math.abs(this.y - tY), 2));
    };
    
    Zombie.prototype.kill = function() {
        this.manager.send({type: "zombie", action: "squash", id: this.id});
    }

    Zombie.prototype.beginRemove = function(mode, nick) {
        if (mode === "squash") {
            this.gotoAndPlay("squash_right");
            this.countdown = 20;
            this.hunting = false;
            this.text = new Text(nick, "12px Arial", "#fff");
            this.text.x = this.x;
            this.text.y = this.y - 20;
            this.text.shadow = new Shadow("#000", 3, 2, 2);
            this.parent.addChild(this.text);
        }
    }
    
    window.Zombie = Zombie;
})(jQuery);

