function collision(obj1, obj2, axis) {
	if (axis === 'x')
		return (
			obj1.y < obj2.y + obj2.height &&
			obj1.y + obj1.height > obj2.y &&
			obj1.x + obj1.width - obj1.Vx > obj2.x &&
			obj1.x - obj1.Vx < obj2.x + obj2.width
		);
	if (axis === 'y')
		return (
			obj1.y - obj1.Vy < obj2.y + obj2.height &&
			obj1.y + obj1.height - obj1.Vy > obj2.y && 
			obj1.x + obj1.width > obj2.x &&
			obj1.x < obj2.x + obj2.width
		);
}

function moveObjects(x, y) {
	thisRoom.move(x, y);
	
	for (const KEY of Object.keys(thisRoomNpcs))
		thisRoomNpcs[KEY].move(x, y);
}

function drawObjects() {
	thisRoom.draw();

	let drawables = [player];
	for (const KEY of Object.keys(thisRoomNpcs))
		drawables.push(thisRoomNpcs[KEY]);

	if (thisRoom.foregrounds[0] !== undefined) drawables.push(...thisRoom.foregrounds);

	drawables.sort((a, b) => a.y - b.y);
	drawables.forEach(obj => obj.draw());
}

function gameUpdate() {
	animationID = window.requestAnimationFrame(gameUpdate);
	context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	context.fillStyle = "lightblue";
	context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	drawObjects();
	player.walk();

}

function startGameUpdate() {
	gameUpdate();
	window.addEventListener("keydown", keyDown);
	window.addEventListener("keyup", keyUp);
}

async function loadFonts(fontName, url) {
	const font = new FontFace(fontName, `url(${url})`);
	await font.load();
	document.fonts.add(font);
}

async function loadImages(images) {
	let imagesLoaded = 0;
	let loadIsFinished = false;
	let interval;
	const MAX_IMAGES = images.length;

	for (let i = 0; i < MAX_IMAGES; i++)
		images[i].onload = () => {
			imagesLoaded++;
			if (imagesLoaded === MAX_IMAGES) return loadIsFinished = true;
		};
	
	await new Promise((resolve) => 
		interval = setInterval(() => {
			if (loadIsFinished)
				resolve(clearInterval(interval));
		}, 100)
	);
}

async function timeOut(timeInSeconds) {
	await new Promise(resolve => setTimeout(resolve, timeInSeconds * 1000));
}

function changeRoom(roomName, tileName) {
	player.room = roomName;

	for (const KEY of Object.keys(rooms))
		if (rooms[KEY].name === player.room) thisRoom = rooms[KEY];

	thisRoomNpcs = {};
	for (const KEY of Object.keys(npcs))
		if (npcs[KEY].room === player.room) thisRoomNpcs[KEY] = npcs[KEY];

	let tile = thisRoom.events.find(tile => tile.name === tileName);
	let offsetX = player.hitbox.x - tile.x - (tile.width / 2 - player.hitbox.width / 2);
	let offsetY = player.hitbox.y - tile.y - (tile.height / 2 - player.hitbox.height / 2);

	moveObjects(offsetX, offsetY);
	startGameUpdate();
}

function joinTiles(tileArray) {
	let isAdjacent = (obj1, obj2, priorAxis, secAxis, priorGap, secGap) => {
		return (
			obj1[priorAxis] + obj1[priorGap] === obj2[priorAxis] &&
			obj1[secAxis] === obj2[secAxis] &&
			obj1[secGap] === obj2[secGap]
		);
	}

	let i = 0;
	while (i < tileArray.length - 1) {
		if (isAdjacent(tileArray[i], tileArray[i + 1], "x", "y", "width", "height")) {
			tileArray[i].expandWidth();
			tileArray.splice(i + 1, 1);
		} else i++;
	}

	tileArray.sort((a, b) => a.x - b.x);

	i = 0;
	while (i < tileArray.length - 1) {
		if (isAdjacent(tileArray[i], tileArray[i + 1], "y", "x", "height", "width")) {
			tileArray[i].expandHeight();
			tileArray.splice(i + 1, 1);
		} else i++;
	}
}

function createTileObjects(room, jsonData) {
	let layers = jsonData.layers;
	let findLayer = layerName => layers.find(layer => layer.name === layerName);
	
	const ROW_LENGTH = room.width / WIDTH;
	const SIMBOL_COLLISION = jsonData.tilesets.find(set => set.source === "bounds.tsx").firstgid;
	const SIMBOL_FOREGROUND = SIMBOL_COLLISION + 2;

	let boundsData = findLayer("bounds").data;
	let mappedBoundsData = [];

	while (boundsData.length > 0)
		mappedBoundsData.push(boundsData.splice(0, ROW_LENGTH));

	mappedBoundsData.forEach((row, i) => {
		row.forEach((tile, j) => {
			const X = j * WIDTH;
			const Y = i * HEIGHT;
			if (tile === SIMBOL_COLLISION) 
				room.collisions.push(new CollisionTile(X, Y, WIDTH, HEIGHT));
			if (tile === SIMBOL_FOREGROUND) 
				room.foregrounds.push(new ForegroundTile(X, Y, room.foregroundImg));
			if (tile === SIMBOL_FOREGROUND + SIMBOL_COLLISION) {
				room.collisions.push(new CollisionTile(X, Y, WIDTH, HEIGHT));
				room.foregrounds.push(new ForegroundTile(X, Y, room.foregroundImg));
			}
		});
	});

	let eventsData = findLayer("events").layers;
	let findPropertie = (propertiesArray, name) =>
		propertiesArray.find(propertie => propertie.name === name).value;

	for(const TILE of eventsData) {
		const X = findPropertie(TILE.properties, "x") * WIDTH;
		const Y = findPropertie(TILE.properties, "y") * HEIGHT;
		const TILE_WIDTH = findPropertie(TILE.properties, "width") * WIDTH;
		const TILE_HEIGHT = findPropertie(TILE.properties, "height") * HEIGHT;
		const NAME = TILE.name;
		room.events.push(new EventTile(X, Y, TILE_WIDTH, TILE_HEIGHT, NAME));
	}

	joinTiles(room.collisions);
	joinTiles(room.foregrounds);
}

async function createCollisionsInRooms() {
	for (const KEY of Object.keys(rooms)) {
		let jsonData;

		await fetch(`./tiled/${rooms[KEY].name}.json`)
			.then(response => response.json())
			.then(json => jsonData = json);

		createTileObjects(rooms[KEY], jsonData);
	}
}

async function startGame() {
	await fetch(`./data/json/entities.json`)
		.then(response => response.json())
		.then(json => {
			player = new Character(json.player);

			for (const KEY of Object.keys(json)) {
				if (KEY === "player") continue;
				json[KEY].name = KEY.charAt(0).toUpperCase() + KEY.slice(1, KEY.length);
				npcs[KEY] = new Npc(json[KEY]);
			}
		});
	
	await fetch(`./data/json/rooms.json`)
		.then(response => response.json())
		.then(json => {
			for (const KEY of Object.keys(json))
				rooms[KEY] = new Room(json[KEY]);
		});

	await createCollisionsInRooms();
	await loadFonts("PressStart2P", "./PressStart2P-Regular.ttf");

	$CANVAS_OVERWORLD.style.display = "flex";
	changeRoom(player.room, "entrance");
}
