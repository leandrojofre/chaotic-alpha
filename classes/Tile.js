class Tile {
	constructor(x, y, canCollide, width = WIDTH, height = HEIGHT) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.canCollide = canCollide;
	}

	expandWidth() {
		this.width += WIDTH;
	}

	expandHeight() {
		this.height += HEIGHT;
	}

	move(x, y) {
		this.y += y;
		this.x += x;
	}

	drawColor(color) {
		context.fillStyle = color;
		context.fillRect(this.x, this.y, this.width, this.height);		
	}
}

class CollisionTile extends Tile {
	constructor(x, y, width, height) {
		super(x, y, true, width, height);
	}
}

class Hitbox extends CollisionTile {
	constructor(x, y, width, height) {
		super(x, y, width, height);
	}

	collided(axis) {
		for (const TILE of thisRoom.collisions)
			if (collision(this, TILE, axis)) return true;
		
		for (const KEY of Object.keys(thisRoomNpcs))
			if (collision(this, NPCS[KEY].hitbox, axis)) return true;
		
		return false;
	}
}

class EventTile extends Tile {
	constructor({x, y, width, height, name, type, warningName = "exclamation", properties = []}) {
		super(x, y, false, width, height);
		this.name = name;
		this.type = (type === "") ? this.type = "room" : type;
		this.warningImg = EVENT_WARNINGS[warningName];
		this.customProperties = arrayToPropertiesObject(properties);

		if (this.customProperties.hide === undefined)
			this.customProperties.hide = false;
	}

	changeWarningImg(warningImg) {
		this.warningImg = warningImg;
	}

	drawWarning(target) {
		context.drawImage(
			this.warningImg,
			target.x + (target.width / 2) - (WIDTH / 2),
			target.y - HEIGHT,
			WIDTH,
			HEIGHT
		);
	}
}

class ForegroundTile extends Tile {
	constructor(x, y, img) {
		super(x, y, false);
		this.img = img;
		this.sx = x;
		this.sy = y;
	}

	draw() {
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
}
