class Item {
	constructor({src, name, description, key, room = "void", x, y, sx}) {
		this.img = new Image();
		this.img.src = src;
		this.name = name;
		this.description = description;
		this.key = key;
		this.room = room;
		this.x = x;
		this.y = y;
		this.width = 32;
		this.height = 32;
		this.sx = sx;
		this.amount = 1;
		this.eventBox = new EventTile(
			{
				x: x - WIDTH / 2,
				y: y - HEIGHT / 2,
				width: this.width + WIDTH,
				height: this.height + HEIGHT,
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

	this.drawWarning();
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

Item.prototype.deleteFromInventory = function(placeOnRoom = {roomName: "void", x: 0, y:0}) {
	this.room = placeOnRoom.roomName;
	this.x = placeOnRoom.x;
	this.y = placeOnRoom.y;

	player.removeItem(this);
}

Item.prototype.isOnInventory = function() {
	return (this.room === "inventory");
}

Item.prototype.drawWarning = function() {
	if (collision(player.hitbox, this.eventBox, "all-still"))
		this.eventBox.drawWarning(this);
}
