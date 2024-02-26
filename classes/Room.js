class Room {
	constructor({
		name,
		x = 0,
		y = 0,
		width,
		height,
		backgroundColor,
		events = [],
		collisions = [],
		foregrounds = []
	}) {
		this.name = name;
		this.backgroundColor = backgroundColor;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.img = new Image();
		this.img.src = `./img/room/${name}/room.png`;
		
		this.foregroundImg = new Image();
		this.foregroundImg.src = `./img/room/${name}/foreground.png`;

		this.roofImg = new Image();
		this.roofImg.src = `./img/room/${name}/roof.png`;

		this.events = events;
		this.collisions = collisions;
		this.foregrounds = foregrounds;
	}
}

Room.prototype.drawWarning = function() {
	for (const TILE of this.events)
		if (!TILE.customProperties.hide && collision(player.hitbox, TILE, "all-still")) return TILE.drawWarning(player);
}

Room.prototype.draw = function() {
	context.imageSmoothingEnabled = false;
	context.drawImage(this.img, this.x, this.y, this.width, this.height);
	context.drawImage(this.foregroundImg, this.x, this.y, this.width, this.height);
}

Room.prototype.drawBackground = function() {
	context.fillStyle = this.backgroundColor;
	context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

Room.prototype.drawRoof = function() {
	context.imageSmoothingEnabled = false;
	context.drawImage(this.roofImg, this.x, this.y, this.width, this.height);

	// for (const TILE of this.events)
	// 	TILE.drawColor("rgba(0, 255, 0, 0.3)");
	// for (const TILE of this.collisions)
	// 	TILE.drawColor("rgba(255, 0, 0, 0.3)");
	// for (const TILE of this.foregrounds)
	// 	TILE.drawColor("rgba(0, 0, 255, 0.3)");
}

Room.prototype.move = function(x, y) {
	this.x += x;
	this.y += y;

	[...this.events, ...this.collisions, ...this.foregrounds].forEach(tile => tile.move(x, y));
}
