class Sprite {
	constructor({
		src,
		x = 0,
		y = 0,
		width,
		height,
		sy = 0,
		animate = false,
		sWidth = width,
		sHeight = height,
		frameSpeed = 18,
		frameStart = 0
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
		this.frameStart = frameStart;
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
		frameStart = 1,
		name,
		key,
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
			frameSpeed,
			frameStart
		});
		this.speakingClothesSrc = speakingClothesSrc;
		this.name = name;
		this.key = key;
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
		frameStart,
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
			frameStart,
			name,
			key: "player",
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
		key,
		src = `./img/npc/${key}/overworld.png`,
		speakingClothesSrc,
		x,
		y,
		width = 64,
		height = 64,
		sy,
		animate,
		frameSpeed,
		frameStart,
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
			frameStart,
			name,
			key,
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
				name: key,
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

AnimationHandler.prototype.setFrame = function(sx, sy) {
	this.sx = sx * this.sWidth;
	this.sy = sy * this.sHeight;

	animationUpdate();
}

AnimationHandler.prototype.nextFrame = function() {
	this.sx += this.sWidth;

	animationUpdate();
}

AnimationHandler.prototype.stopAnimationLoop = function(sx, sy) {
	window.cancelAnimationFrame(animationID);

	this.animate = false;
	this.setFrame(sx, sy);

	animationUpdate();
}

AnimationHandler.prototype.setAnimationLoop = function(startIndex, endIndex, sy, frameSpeed) {
	this.stopAnimationLoop(endIndex - 1, sy);
	this.frameStart = startIndex;
	this.frameEnd = endIndex;
	this.frameSpeed = frameSpeed;
	this.sy = sy * this.sHeight;
	this.animate = true;

	animationUpdate();
}

AnimationHandler.prototype.setAnimation = async function(startIndex, endIndex, sy, frameSpeed) {
	const FRAME_DURATION_SEC = 1 / (60 / frameSpeed);
	
	this.setFrame(startIndex, sy);
	await timeOut(FRAME_DURATION_SEC);

	for (let i = 1; i < endIndex; i++) {
		this.nextFrame();
		await timeOut(FRAME_DURATION_SEC);
	}
}
