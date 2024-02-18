class Sprite {
	constructor({
		src,
		x=0,
		y=0,
		width,
		height,
		sy=0,
		animate=false,
		sWidth=width,
		sHeight=height,
		frameSpeed=18
	}) {
		this.img = new Image();
		this.src = src;
		this.img.src = src;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.sx = 0;
		this.sy = sy;
		this.animate = animate;
		this.sWidth = sWidth;
		this.sHeight = sHeight;
		this.frameRate = 0;
		this.frameSpeed = frameSpeed;
		this.frameStart = 1;
		this.frameEnd = 5;
	}
}

Sprite.prototype.draw = function() {
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

class Character extends Sprite {
	constructor({
		src,
		speakingClothesSrc,
		x,
		y,
		width,
		height,
		sy = 0,
		animate,
		frameSpeed,
		name,
		bio,
		room,
		textColor,
		textBackground
	}) {
		super({
			src,
			x,
			y,
			width,
			height,
			sy,
			animate,
			frameSpeed
		});
		this.speakingClothesSrc = speakingClothesSrc;
		this.name = name;
		this.bio = bio;
		this.room = room;
		this.textColor = textColor;
		this.textBackground = textBackground;
		this.hitbox = new Hitbox(
			this.x + ((width -  16) / 2),
			this.y + height - 16,
			16,
			16
		);
	}
}

class Player extends Character {
	constructor({
		src = "./img/npc/player/overworld.png",
		speakingClothesSrc = "./img/npc/player/speak-clothe-default.png",
		width = 64,
		height = 64,
		sy,
		frameSpeed,
		name,
		bio,
		room,
		textColor,
		textBackground
	}) {
		super({
			src,
			speakingClothesSrc,
			width,
			height,
			x: SCREEN_WIDTH / 2 - width / 2,
			y: SCREEN_HEIGHT / 2 - height / 2,
			sy,
			frameSpeed,
			name,
			bio,
			room,
			textColor,
			textBackground
		});
		this.inventory = {};
		this.Vx = 0;
		this.Vy = 0;
		this.acceleration = 1;
	}
}

Player.prototype.walk = function() {
	this.hitbox.Vx = this.Vx;
	this.hitbox.Vy = this.Vy;

	KEY_PRESSED.shift ?
		(this.acceleration = 2, this.hitbox.acceleration = 2) :
		(this.acceleration = 1, this.hitbox.acceleration = 1);

	if ((KEY_PRESSED.w || KEY_PRESSED.s) && !this.hitbox.collided('y'))
		moveObjects(0, this.Vy * this.acceleration);
	if ((KEY_PRESSED.a || KEY_PRESSED.d) && !this.hitbox.collided('x'))
		moveObjects(this.Vx * this.acceleration, 0);
	
	if (!KEY_PRESSED.a && !KEY_PRESSED.d && !KEY_PRESSED.w && !KEY_PRESSED.s) {
		this.animate = false;
		this.sx = 0;
	}
}

Player.prototype.addItem = function(item) {
	if (thisRoomItems[item.key] !== undefined)
		delete thisRoomItems[item.key];
	
	this.inventory[item.key] = item;
}

Player.prototype.removeItem = function(item) {
	delete this.inventory[item.key];
}

class Npc extends Character {
	constructor({
		name,
		src = `./img/npc/${name.toLowerCase()}/overworld.png`,
		speakingClothesSrc,
		x,
		y,
		width = 64,
		height = 64,
		sy,
		animate,
		frameSpeed,
		bio,
		room,
		textColor,
		textBackground,
		lvl = 0,
		lvlProgression = 0
	}) {
		super({
			src,
			speakingClothesSrc,
			x,
			y,
			width,
			height,
			sy,
			animate,
			frameSpeed,
			name,
			bio,
			room,
			textColor,
			textBackground
		});
		this.lvl = lvl;
		this.lvlProgression = lvlProgression;
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
}

Npc.prototype.drawWarning = function() {
	if (!collision(player.hitbox, this.eventBox, "all-still")) return false;
	
	this.eventBox.drawWarning(this);
	return true;
}

Npc.prototype.move = function(x, y) {
	this.x += x;
	this.y += y;
	this.eventBox.move(x, y);
	this.hitbox.move(x, y);
}

class AnimationHandler extends Sprite {
	constructor(obj) {
		super(obj);
	}
}

AnimationHandler.prototype.checkFrame = function(sx, sy) {
	return (this.sx === sx * this.sWidth && this.sy === sy * this.sHeight);
}

AnimationHandler.prototype.setAnimationLoop = function(startIndex, endIndex, frameSpeed) {
	window.cancelAnimationFrame(animationID);

	this.frameStart = startIndex;
	this.frameEnd = endIndex;
	this.frameSpeed = frameSpeed;
	this.animate = true;

	animationUpdate();
}

AnimationHandler.prototype.stopAnimationLoop = function(sx, sy) {
	window.cancelAnimationFrame(animationID);

	this.sx = sx * this.sWidth;
	this.sy = sy * this.sHeight;
	this.animate = false;

	animationUpdate();
}

AnimationHandler.prototype.setFrame = function(sx, sy) {
	this.sx = sx * this.sWidth;
	this.sy = sy * this.sHeight;

	animationUpdate();
}

AnimationHandler.prototype.nextFrame = function() {
	this.sx += this.sWidth;

	animationUpdate();
}
