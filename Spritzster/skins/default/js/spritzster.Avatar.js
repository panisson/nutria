(function($) {
    function Avatar(nick, type, x, y) {
        this.initialize(nick, type, x, y);
        return this;
    }
    Avatar.prototype = new Bitmap();
    
    Avatar.prototype.Bitmap_initialize = Avatar.prototype.initialize;
    
    Avatar.prototype.initialize = function(nick, type, x, y) {
        this.Bitmap_initialize("/skins/default/img/" + type + ".png");
        this.x = x || 0;
        this.y = y || 0;
        this.type = type;
        this.id = nick;
    };    
    
    window.Avatar = Avatar;
})(jQuery);
