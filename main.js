function collision(obj1, obj2, axis) {
	if (axis === "x")
		return (
			obj1.y < obj2.y + obj2.height &&
			obj1.y + obj1.height > obj2.y &&
			obj1.x + obj1.width - (obj1.Vx * obj1.acceleration) > obj2.x &&
			obj1.x - (obj1.Vx * obj1.acceleration) < obj2.x + obj2.width
		);
	if (axis === "y")
		return (
			obj1.y - (obj1.Vy * obj1.acceleration) < obj2.y + obj2.height &&
			obj1.y + obj1.height - (obj1.Vy * obj1.acceleration) > obj2.y && 
			obj1.x + obj1.width > obj2.x &&
			obj1.x < obj2.x + obj2.width
		);
	if (axis === "all-still")
		return (
			obj1.y - BASE_VELOCITY < obj2.y + obj2.height &&
			obj1.y + obj1.height + BASE_VELOCITY > obj2.y && 
			obj1.x + obj1.width + BASE_VELOCITY > obj2.x &&
			obj1.x - BASE_VELOCITY < obj2.x + obj2.width
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
	for (const KEY of Object.keys(thisRoomNpcs)) {
		drawables.push(thisRoomNpcs[KEY]);
		thisRoomNpcs[KEY].drawWarning();
	}

	if (thisRoom.foregrounds[0] !== undefined) drawables.push(...thisRoom.foregrounds);

	drawables.sort((a, b) => (a.y + a.height) - (b.y + b.height));
	drawables.forEach(obj => obj.draw());

	thisRoom.drawWarning();
}

function gameUpdate() {
	animationID = window.requestAnimationFrame(gameUpdate);
	context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	thisRoom.drawBackground();
	drawObjects();
	thisRoom.drawRoof();
	
	player.walk();
}

function startPlayerInput() {
	window.addEventListener("keydown", keyDown);
	window.addEventListener("keyup", keyUp);
}

function stopPlayerInput() {
	window.removeEventListener("keydown", keyDown);
	window.removeEventListener("keyup", keyUp);

	for (const KEY of Object.keys(KEY_PRESSED))
		KEY_PRESSED[KEY] = false;
}

function startGameUpdate() {
	context = $CANVAS_OVERWORLD.getContext('2d');
	gameUpdate();
	startPlayerInput();	
}

function stopGameUpdate() {
	stopPlayerInput();
	window.cancelAnimationFrame(animationID);
}

function arrayToPropertiesObject(array) {
	let obj = {};
	for(const PROP of array)
		obj[PROP.name] = PROP.value;
	return obj;
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

	for (const IMG of images)
		IMG.onload = () => {
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

function joinTiles(tileArray) {
	let isAdjacent = (obj1, obj2, priorAxis, secAxis, priorGap, secGap) => {
		return (
			obj1[priorAxis] + obj1[priorGap] === obj2[priorAxis] &&
			obj1[secAxis] === obj2[secAxis] &&
			obj1[secGap] === obj2[secGap]
		);
	}

	tileArray.sort((a, b) => a.x - b.x);

	let i = 0;
	while (i < tileArray.length - 1) {
		if (isAdjacent(tileArray[i], tileArray[i + 1], "y", "x", "height", "width")) {
			tileArray[i].expandHeight();
			tileArray.splice(i + 1, 1);
		} else i++;
	}

	tileArray.sort((a, b) => a.y - b.y);

	i = 0;
	while (i < tileArray.length - 1) {
		if (isAdjacent(tileArray[i], tileArray[i + 1], "x", "y", "width", "height")) {
			tileArray[i].expandWidth();
			tileArray.splice(i + 1, 1);
		} else i++;
	}
}

function createTileObjects(room, jsonData) {
	let layers = jsonData.layers;
	let findLayer = layerName => layers.find(layer => layer.name === layerName);
	
	const ROW_LENGTH = room.width / WIDTH;
	const SIMBOL_COLLISION = jsonData.tilesets.find(tileSet => tileSet.source === "..\/aseprite\/rooms\/bounds.tsx").firstgid;
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

	for(const TILE of eventsData) {
		TILE.objects[0].y -= TILE.objects[0].height;
		room.events.push(new EventTile(TILE.objects[0]));
	}

	joinTiles(room.collisions);
	joinTiles(room.foregrounds);
}

async function createCollisionsInRooms() {
	for (const KEY of Object.keys(ROOMS)) {
		let jsonData;

		await fetch(`./tiled/${ROOMS[KEY].name}.json`)
			.then(response => response.json())
			.then(json => jsonData = json);

		createTileObjects(ROOMS[KEY], jsonData);
	}
}

function setLoadingScreen(extraText = "") {
	context.fillStyle='black';
	context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	const takeTextInfo = (text) => {return context.measureText(text);};
	
	context.font = "16px PressStart2P";
	context.fillStyle = "white";

	let loadingText = "Loading.." + extraText;
	let loadingTextInfo = takeTextInfo(loadingText);

	context.fillText(loadingText, (SCREEN_WIDTH / 2) - (loadingTextInfo.width / 2), SCREEN_HEIGHT / 2);
}

async function startGame() {
	document.getElementById("main-menu").style.display = "none";
	document.getElementById("game").style.display = "flex";
	
	setLoadingScreen(" Font");
	await loadFonts("PressStart2P", "./PressStart2P-Regular.ttf");

	$CANVAS_OVERWORLD.style.display = "flex";

	setLoadingScreen(" Npcs sprites");
	await fetch(`./json/entities.json`)
		.then(response => response.json())
		.then(async (json) => {
			player = new Player(json.player);
			let imagesToLoad = [player.img];

			for (const KEY of Object.keys(json)) {
				if (KEY === "player") continue;
				NPCS[KEY] = new Npc(json[KEY]);
				imagesToLoad.push(NPCS[KEY].img);
			}

			await loadImages(imagesToLoad);
		});

	setLoadingScreen(" Room images");
	await fetch(`./json/rooms.json`)
		.then(response => response.json())
		.then(async (json) => {
			let imagesToLoad = [];

			for (const KEY of Object.keys(json)) {
				ROOMS[KEY] = new Room(json[KEY]);
				imagesToLoad.push(ROOMS[KEY].img, ROOMS[KEY].foregroundImg, ROOMS[KEY].roofImg);
			}

			await loadImages(imagesToLoad);
		});

	setLoadingScreen(" Generating collisions");
	await createCollisionsInRooms();

	changeRoom(player.room, "playerSpawn");
}

window.onload = () => {
	document.getElementById("start-button").onclick = () => startGame();
	document.getElementsByName("ui-button").forEach($button => $button.onclick = () => swapUiScreens());
}
