class Item {
	constructor({src, name, key, room, x, y, width, height, sx}) {
		this.img = new Image();
		this.img.src = src;
		this.name = name;
		this.key = key;
		this.room = room;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.sx = sx;
		this.eventBox = new EventTile(
			{
				x: x - WIDTH / 2,
				y: y - HEIGHT / 2,
				width: width + WIDTH,
				height: height + HEIGHT,
				name: key,
				type: "item"
			}
		);
	}
}

Item.prototype.draw = function() {
	context.drawImage(
		this.img,
		this.sx,
		0,
		this.width,
		this.height,
		this.x,
		this.y,
		this.width,
		this.height
	);
}

Item.prototype.move = function(x, y) {
	this.x += x;
	this.y += y;
	this.eventBox.move(x, y);
}

Item.prototype.sendToInventory = function() {
	this.room = "inventory";
	player.addItem(this);
}

Item.prototype.drawWarning = function() {
	if (collision(player.hitbox, this.eventBox, "all-still"))
		this.eventBox.drawWarning(this);
}