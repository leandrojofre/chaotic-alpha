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
	for (const KEY of Object.keys(thisRoomItems))
		thisRoomItems[KEY].move(x, y);
}

function drawWarnings() {
	for (const KEY of Object.keys(thisRoomNpcs))
		if (thisRoomNpcs[KEY].drawWarning()) return;
	
	thisRoom.drawWarning();
}

function drawObjects() {
	thisRoom.draw();
	let drawables = [player];

	for (const KEY of Object.keys(thisRoomItems))
		drawables.push(thisRoomItems[KEY]);

	for (const KEY of Object.keys(thisRoomNpcs))
		drawables.push(thisRoomNpcs[KEY]);

	if (thisRoom.foregrounds[0] !== undefined)
		drawables.push(...thisRoom.foregrounds);

	drawables.sort((a, b) => (a.y + a.height) - (b.y + b.height));
	drawables.forEach(obj => obj.draw());
}

function gameUpdate() {
	animationID = window.requestAnimationFrame(gameUpdate);
	context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	thisRoom.drawBackground();
	drawObjects();
	thisRoom.drawRoof();
	drawWarnings();
	
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
		}, 50)
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
	const SIMBOL_COLLISION_FOREGROUND = SIMBOL_COLLISION + 3;

	let boundsData = findLayer("bounds").data;
	let mappedBoundsData = [];

	while (boundsData.length > 0)
		mappedBoundsData.push(boundsData.splice(0, ROW_LENGTH));
	
	mappedBoundsData.forEach((row, i) => {
		row.forEach((tile, j) => {
			const X = j * WIDTH;
			const Y = i * HEIGHT;
			if (tile === SIMBOL_COLLISION) 
				room.collisions.push(new CollisionTile({ x: X, y: Y, width: WIDTH, height: HEIGHT }));
			if (tile === SIMBOL_FOREGROUND) 
				room.foregrounds.push(new ForegroundTile({ x: X, y: Y, img: room.foregroundImg }));
			if (tile === SIMBOL_COLLISION_FOREGROUND) {
				room.collisions.push(new CollisionTile({ x: X, y: Y, width: WIDTH, height: HEIGHT }));
				room.foregrounds.push(new ForegroundTile({ x: X, y: Y, img: room.foregroundImg }));
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

function loadTileObjects(room) {
	
	room.events = room.events.map(tile => new EventTile(tile));
	room.collisions = room.collisions.map(tile => new CollisionTile(tile));
	room.foregrounds = room.foregrounds.map(tile => {
		tile.img = room.foregroundImg;
		return new ForegroundTile(tile);
	});
}

async function createCollisionsInRooms() {
	for (const KEY of Object.keys(ROOMS)) {
		if (ROOMS[KEY].events.length > 0 && !(ROOMS[KEY].events[0] instanceof Tile)) {
			loadTileObjects(ROOMS[KEY]);
			continue;
		}

		let jsonData;

		await fetch(`./tiled/${ROOMS[KEY].name}.json`)
			.then(response => response.json())
			.then(json => jsonData = json);

		ROOMS[KEY].width = jsonData.width * WIDTH;
		ROOMS[KEY].height = jsonData.height * HEIGHT;

		createTileObjects(ROOMS[KEY], jsonData);
	}
}

function setLoadingScreen(extraText = "") {
	context.fillStyle='black';
	context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	const takeTextInfo = (text) => {return context.measureText(text);};
	
	context.font = "32px Ohrenstead";
	context.fillStyle = "white";

	let loadingText = "Loading.." + extraText;
	let loadingTextInfo = takeTextInfo(loadingText);

	context.fillText(loadingText, (SCREEN_WIDTH / 2) - (loadingTextInfo.width / 2), SCREEN_HEIGHT / 2);
}

async function startGame() {
	document.getElementById("main-menu").style.display = "none";
	document.getElementById("game").style.display = "flex";
	
	setLoadingScreen(" Font");
	await loadFonts("Ohrenstead", "./Ohrenstead.ttf");

	$CANVAS_OVERWORLD.style.display = "flex";

	setLoadingScreen(" Npcs");
	await fetch("./json/entities.json")
		.then(response => response.json())
		.then(async(json) => {
			player = new Player(json.player);
			let imagesToLoad = [player.img];

			for (const KEY of Object.keys(json)) {
				if (KEY === "player") continue;
				json[KEY].key = KEY;
				NPCS[KEY] = new Npc(json[KEY]);
				imagesToLoad.push(NPCS[KEY].img);
			}

			await loadImages(imagesToLoad);
			
			player.frameEnd = player.img.width / player.sWidth;
			for (const key of Object.keys(NPCS))
				NPCS[key].frameEnd = NPCS[key].img.width / NPCS[key].sWidth;
		});

	setLoadingScreen(" Room");
	await fetch("./json/rooms.json")
		.then(response => response.json())
		.then(async(json) => {
			let imagesToLoad = [];

			for (const KEY of Object.keys(json)) {
				ROOMS[KEY] = new Room(json[KEY]);
				imagesToLoad.push(ROOMS[KEY].img, ROOMS[KEY].foregroundImg, ROOMS[KEY].roofImg);
			}

			await loadImages(imagesToLoad);
		});

	setLoadingScreen(" Generating collisions");
	await createCollisionsInRooms();

	setLoadingScreen(" Items");
	await fetch("./json/items.json")
		.then(response => response.json())
		.then(async(json) => {
			let imagesToLoad = [];

			for (const KEY of Object.keys(json)) {
				json[KEY].src = `./img/item/${KEY}.png`;
				json[KEY].key = KEY;
				ITEMS[KEY] = new Item(json[KEY]);
				imagesToLoad.push(ITEMS[KEY].img);

				if (ITEMS[KEY].room === "inventory")
					ITEMS[KEY].sendToInventory();
			}

			await loadImages(imagesToLoad);
		})

	changeRoom(player.room, "playerSpawn");
}

window.onload = () => {
	document.getElementById("start-button").onclick = () => startGame();
	document.getElementsByName("ui-button").forEach($button => $button.onclick = () => swapUiScreens());
}
