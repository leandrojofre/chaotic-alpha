class Sprite {
	constructor({ src, x=0, y=0, width, height, sy=0, animate=false, sWidth=width, sHeight=height, frameSpeed=18 }) {
		this.img = new Image();
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
		this.img.onload = () => this.frameEnd = this.img.width / this.sWidth;
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
			frameSpeed
		});
		this.name = name;
		this.room = room;
		this.textColor = textColor;
		this.textBackground = textBackground;
		this.Vx = 0;
		this.Vy = 0;
		this.acceleration = 1;
		this.hitbox = new Hitbox(this.x + width / 4, this.y + height - width / 2, width / 2, width / 2);
	}

	walk() {
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
}

class Npc extends Sprite {
	constructor({ src, x, y, width, height, sy, animate, frameSpeed, name, room, textColor, textBackground, lvl, lvlProgression }) {
		super({ src, x, y, width, height, sy, animate, frameSpeed });
		this.name = name;
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

class AnimationHandler extends Sprite {
	constructor(obj) {
		super(obj);
	}

	checkFrame(sx, sy) {
		return (this.sx === sx * this.sWidth && this.sy === sy * this.sHeight);
	}

	setAnimationLoop(startIndex, endIndex, frameSpeed) {
		window.cancelAnimationFrame(animationID);

		this.frameStart = startIndex;
		this.frameEnd = endIndex;
		this.frameSpeed = frameSpeed;
		this.animate = true;

		animationUpdate();
	}

	stopAnimationLoop(sx, sy) {
		window.cancelAnimationFrame(animationID);

		this.sx = sx * this.sWidth;
		this.sy = sy * this.sHeight;
		this.animate = false;

		animationUpdate();
	}

	setFrame(sx, sy) {
		this.sx = sx * this.sWidth;
		this.sy = sy * this.sHeight;

		animationUpdate();
	}

	nextFrame() {
		this.sx += this.sWidth;

		animationUpdate();
	}
}
