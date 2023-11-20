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
}

class CollisionTile extends Tile {
	constructor(x, y, width, height) {
		super(x, y, true, width, height);
	}

	collided(axis) {
		for (const TILE of thisRoom.collisions)
			if (collision(this, TILE, axis)) return true;
		
		for (const KEY of Object.keys(thisRoomNpcs))
			if (collision(this, npcs[KEY].hitbox, axis)) return true;
		
		return false;
	}

	draw() {
		context.fillStyle='red';
		context.fillRect(this.x, this.y, this.width, this.height);		
	}
}

class EventTile extends Tile {
	constructor(x, y, width, height, name, warningName = "exclamation") {
		super(x, y, false, width, height);
		this.name = name;
		this.warningImg = EVENT_WARNINGS[warningName];
	}

	drawWarning() {
		context.drawImage(this.warningImg, player.x, player.y - HEIGHT, WIDTH, HEIGHT);
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
		// context.fillStyle='blue';
		// context.fillRect(this.x, this.y, this.width, this.height);		
	}
}

class Room {
	constructor({ name, x, y, width, height, src, foregroundSrc }) {
		this.name = name;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.img = new Image();
		this.img.src = src;
		this.foregroundImg = new Image();
		this.foregroundImg.src = foregroundSrc;
		this.events = [];
		this.collisions = [];
		this.foregrounds = [];
	}

	draw() {
		context.imageSmoothingEnabled = false;
		context.drawImage(this.img, this.x, this.y, this.width, this.height);
		context.drawImage(this.foregroundImg, this.x, this.y, this.width, this.height);
	}
	
	move(x, y) {
		this.x += x;
		this.y += y;

		this.collisions.forEach(tile => tile.move(x, y));
		this.foregrounds.forEach(tile => tile.move(x, y));
	}
}

class Sprite {
	constructor({ src, x, y, width, height, sy, animate, sWidth, sHeight, frameSpeed }) {
		this.img = new Image();
		this.img.src = src;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.sx = 0;
		this.sy = sy;
		this.sWidth = sWidth ?? width;
		this.sHeight = sHeight ?? height;
		this.animate = animate ?? false;
		this.frameRate = 0;
		this.frameSpeed = frameSpeed ?? 18;
		this.frameStart = 1;
		this.frameEnd = 5;
	}

	draw() {
		context.imageSmoothingEnabled = false;
	
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
		
		// this.hitbox?.draw();
	
		if (!this.animate) return;
		if (!(animationID % this.frameSpeed === 0)) return;
		console.log(animationID);
	
		this.frameRate++;
		if (this.frameRate >= this.frameEnd)
			this.frameRate = this.frameStart;
	
		this.sx = this.frameRate * (this.sWidth);

	}
}

class Character extends Sprite {
	constructor({ src, width, room, height, sy, frameSpeed }) {
		super({
			src,
			x: SCREEN_WIDTH / 2 - width / 2,
			y: SCREEN_HEIGHT / 2 - height / 2,
			width,
			height,
			sy,
			frameSpeed
		});
		this.room = room;
		this.Vx = 0;
		this.Vy = 0;
		this.hitbox = new CollisionTile(this.x + width / 4, this.y + height - width / 2, width / 2, width / 2);
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
	constructor({ src, x, y, width, height, sy, animate, frameSpeed, room, name }) {
		super({ src, x, y, width, height, sy, animate, frameSpeed });
		this.name = name;
		this.room = room;
		this.hitbox = new CollisionTile(x + width / 4, y + height - width / 2, width / 2, width / 2);
	}

	move(x, y) {
		this.x += x;
		this.y += y;
		this.hitbox.move(x, y);
	}
}
