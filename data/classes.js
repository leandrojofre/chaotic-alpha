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
			if (collision(this, npcs[KEY].hitbox, axis)) return true;
		
		return false;
	}
}

class EventTile extends Tile {
	constructor({x, y, width, height, name, type = "room", warningName = "exclamation", properties = []}) {
		super(x, y, false, width, height);
		this.name = name;
		this.type = type;
		this.warningImg = EVENT_WARNINGS[warningName];
		this.customProperties = arrayToPropertiesObject(properties);
	}

	changeWarningImg(warningImg) {
		this.warningImg = warningImg;
	}

	drawWarning(target) {
		context.drawImage(this.warningImg, target.x, target.y - HEIGHT, WIDTH, HEIGHT);
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

class Room {
	constructor({ name, x, y, width, height, src, foregroundSrc, roofSrc,backgroundColor }) {
		this.name = name;
		this.backgroundColor = backgroundColor;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.img = new Image();
		this.img.src = src;
		this.foregroundImg = new Image();
		this.foregroundImg.src = foregroundSrc;
		this.roofImg = new Image();
		this.roofImg.src = roofSrc;
		this.events = [];
		this.collisions = [];
		this.foregrounds = [];
	}

	drawWarning() {
		for (const TILE of this.events)
			if (collision(player.hitbox, TILE, "all-still")) return TILE.drawWarning(player);
	}

	draw() {
		context.imageSmoothingEnabled = false;
		context.drawImage(this.img, this.x, this.y, this.width, this.height);
		context.drawImage(this.foregroundImg, this.x, this.y, this.width, this.height);
	}

	drawBackground() {
		context.fillStyle = this.backgroundColor;
		context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	}

	drawRoof() {
		context.imageSmoothingEnabled = false;
		context.drawImage(this.roofImg, this.x, this.y, this.width, this.height);

		// for (const TILE of this.events)
		// 	TILE.drawColor("rgba(0, 255, 0, 0.3)");
		// for (const TILE of this.collisions)
		// 	TILE.drawColor("rgba(255, 0, 0, 0.3)");
		// for (const TILE of this.foregrounds)
		// 	TILE.drawColor("rgba(0, 0, 255, 0.3)");
	}
	
	move(x, y) {
		this.x += x;
		this.y += y;

		[...this.events, ...this.collisions, ...this.foregrounds].forEach(tile => tile.move(x, y));
	}
}

class Sprite {
	constructor({ src, name, x, y, width, height, sy, animate, sWidth, sHeight, frameSpeed }) {
		this.img = new Image();
		this.img.src = src;
		this.name = name;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.sx = 0;
		this.sy = sy;
		this.animate = animate ?? false;
		this.sWidth = sWidth ?? width;
		this.sHeight = sHeight ?? height;
		this.frameRate = 0;
		this.frameSpeed = frameSpeed ?? 18;
		this.frameStart = 1;
		this.frameEnd = 5;
	}

	draw() {
		context.imageSmoothingEnabled = false;

		// this.eventBox?.drawColor("rgba(0, 255, 0, 0.3)");
		// this.hitbox?.drawColor("rgba(255, 0, 0, 0.3)");
	
		context.drawImage(
			this.img,
			this.sx,
			this.sy,
			this.sWidth,
			this.sHeight,
			this.x,
			this.y,
			this.width,
			this.height
		);
	
		if (!this.animate) return;
		if (!(animationID % this.frameSpeed === 0)) return;
	
		this.frameRate++;
		if (this.frameRate >= this.frameEnd)
			this.frameRate = this.frameStart;
	
		this.sx = this.frameRate * (this.sWidth);
	}
}

class Player extends Sprite {
	constructor({ src, width, height, sy, frameSpeed, name, room, textColor, textBackground }) {
		super({
			src,
			x: SCREEN_WIDTH / 2 - width / 2,
			y: SCREEN_HEIGHT / 2 - height / 2,
			width,
			height,
			sy,
			frameSpeed,
			name
		});
		this.room = room;
		this.textColor = textColor;
		this.textBackground = textBackground;
		this.Vx = 0;
		this.Vy = 0;
		this.hitbox = new Hitbox(this.x + width / 4, this.y + height - width / 2, width / 2, width / 2);
	}

	walk() {
		this.hitbox.Vx = this.Vx;
		this.hitbox.Vy = this.Vy;
		
		if ((KEY_PRESSED.w || KEY_PRESSED.s) && !this.hitbox.collided('y'))
			moveObjects(0, this.Vy);
		if ((KEY_PRESSED.a || KEY_PRESSED.d) && !this.hitbox.collided('x'))
			moveObjects(this.Vx, 0);
		
		if (!KEY_PRESSED.a && !KEY_PRESSED.d && !KEY_PRESSED.w && !KEY_PRESSED.s) {
			this.animate = false;
			this.sx = 0;
		}
	}
}

class Npc extends Sprite {
	constructor({ src, x, y, width, height, sy, animate, frameSpeed, name, room, textColor, textBackground, lvl, lvlProgression }) {
		super({ src, x, y, width, height, sy, animate, frameSpeed, name });
		this.room = room;
		this.textColor = textColor;
		this.textBackground = textBackground;
		this.lvl = lvl;
		this.lvlProgression = lvlProgression;
		this.hitbox = new Hitbox(x + width / 4, y + height - width / 2, width / 2, width / 2);
		this.eventBox = new EventTile(
			{
				x: this.hitbox.x - WIDTH,
				y: this.hitbox.y - HEIGHT,
				width: WIDTH * 2 + this.hitbox.width,
				height: HEIGHT * 2 + this.hitbox.height,
				name,
				type: "npc",
				warningName: "talk"
			}
		);
	}

	drawWarning() {
		if (collision(player.hitbox, this.eventBox, "all-still")) this.eventBox.drawWarning(this);
	}

	move(x, y) {
		this.x += x;
		this.y += y;
		this.eventBox.move(x, y);
		this.hitbox.move(x, y);
	}
}
