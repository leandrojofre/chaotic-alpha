class Tile {
	constructor(x, y, canCollide, width = WIDTH, height = HEIGHT) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.canCollide = canCollide;
	}
}

Tile.prototype.expandWidth = function() {
	this.width += WIDTH;
}

Tile.prototype.expandHeight = function() {
	this.height += HEIGHT;
}

Tile.prototype.move = function(x, y) {
	this.y += y;
	this.x += x;
}

Tile.prototype.drawColor = function(color) {
	context.fillStyle = color;
	context.fillRect(this.x, this.y, this.width, this.height);		
}

class CollisionTile extends Tile {
	constructor({ x, y, width, height }) {
		super(x, y, true, width, height);
	}
}

class Hitbox extends CollisionTile {
	constructor(x, y, width, height) {
		super({ x, y, width, height });
	}
}

Hitbox.prototype.collided = function(axis) {
	for (const TILE of thisRoom.collisions)
		if (collision(this, TILE, axis)) return true;
	
	for (const KEY of Object.keys(thisRoomNpcs))
		if (collision(this, NPCS[KEY].hitbox, axis)) return true;
	
	return false;
}

class EventTile extends Tile {
	constructor({ x, y, width, height, name, type, warningName = "exclamation", properties = [] }) {
		super(x, y, false, width, height);
		this.name = name;
		this.type = (type === "") ? this.type = "room" : type;
		this.warningName = warningName;
		this.warningImg = EVENT_WARNINGS[warningName];
		this.properties = properties;
		this.customProperties = arrayToPropertiesObject(properties);

		if (this.customProperties.hide === undefined)
			this.customProperties.hide = false;
	}
}

EventTile.prototype.changeWarningImg = function(warningImg) {
	this.warningImg = warningImg;
}

EventTile.prototype.drawWarning = function(target) {
	context.drawImage(
		this.warningImg,
		target.x + (target.width / 2) - (WIDTH / 2),
		target.y - HEIGHT,
		WIDTH,
		HEIGHT
	);
}

class ForegroundTile extends Tile {
	constructor({ x, y, img, width, height, sx = x, sy = y }) {
		super(x, y, false, width, height);
		this.img = img;
		this.sx = sx;
		this.sy = sy;
	}
}

ForegroundTile.prototype.draw = function() {
	context.imageSmoothingEnabled = false;
	context.drawImage(
		this.img,
		this.sx,
		this.sy,
		this.width,
		this.height,
		this.x,
		this.y,
		this.width,
		this.height
	);	
}
