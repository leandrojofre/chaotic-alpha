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
			if (!TILE.customProperties.hide && collision(player.hitbox, TILE, "all-still")) return TILE.drawWarning(player);
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
