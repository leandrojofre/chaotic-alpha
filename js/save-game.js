async function loadGame() {

	if (localStorage.length === 0) return alert("No hay partidas guardadas");

	loadFonts("Ohrenstead", "./Ohrenstead.ttf");
	const playerData = JSON.parse(localStorage.getItem("player"));
	const npcsData = JSON.parse(localStorage.getItem("npcs"));
	const roomsData = JSON.parse(localStorage.getItem("rooms"));
	const itemsData = JSON.parse(localStorage.getItem("items"));

	player = new Player(playerData);
	await loadImages([player.img]);

	for (const KEY of Object.keys(npcsData)) {
		let npcData = npcsData[KEY];

		NPCS[KEY] = new Npc(npcData);
		await loadImages([NPCS[KEY].img]);
	}
	
	for (const KEY of Object.keys(roomsData)) {
		let roomData = roomsData[KEY];

		ROOMS[KEY] = new Room(roomData);
		await loadImages([
			ROOMS[KEY].img,
			ROOMS[KEY].foregroundImg,
			ROOMS[KEY].roofImg
		]);
	}

	for (const KEY of Object.keys(itemsData)) {
		let itemData = itemsData[KEY];

		ITEMS[KEY] = new Item(itemData);
		await loadImages([ITEMS[KEY].img]);

		if (ITEMS[KEY].room === "inventory")
			ITEMS[KEY].sendToInventory();
	}

	await createCollisionsInRooms();
	
	document.getElementById("main-menu").style.display = "none";
	document.getElementById("game").style.display = "flex";
	$CANVAS_OVERWORLD.style.display = "flex";

	changeRoom(player.room, "playerSpawn");
}

async function loadGameFromPause() {

	if (localStorage.length === 0) return alert("No hay partidas guardadas");

	const playerData = JSON.parse(localStorage.getItem("player"));
	const npcsData = JSON.parse(localStorage.getItem("npcs"));
	const roomsData = JSON.parse(localStorage.getItem("rooms"));
	const itemsData = JSON.parse(localStorage.getItem("items"));

	player = new Player(playerData);
	await loadImages([player.img]);

	for (const KEY of Object.keys(npcsData)) {
		let npcData = npcsData[KEY];

		NPCS[KEY] = new Npc(npcData);
		await loadImages([NPCS[KEY].img]);
	}
	
	for (const KEY of Object.keys(roomsData)) {
		let roomData = roomsData[KEY];

		ROOMS[KEY] = new Room(roomData);
		await loadImages([
			ROOMS[KEY].img,
			ROOMS[KEY].foregroundImg,
			ROOMS[KEY].roofImg
		]);
	}

	for (const KEY of Object.keys(itemsData)) {
		let itemData = itemsData[KEY];

		ITEMS[KEY] = new Item(itemData);
		await loadImages([ITEMS[KEY].img]);

		if (ITEMS[KEY].room === "inventory")
			ITEMS[KEY].sendToInventory();
	}

	await createCollisionsInRooms();
	
	resumeGame(false);
	changeRoom(player.room, "playerSpawn");
}

function setItemLStorage(key, value) {
	localStorage.setItem(key, value);
}

async function saveGame() {
	
	if (animationHandler !== undefined) return alert("No vas romper mi juego");
	
	stopGameUpdate();

	setItemLStorage("player", JSON.stringify(player));
	setItemLStorage("npcs", JSON.stringify(NPCS));
	setItemLStorage("rooms", JSON.stringify(ROOMS));
	setItemLStorage("items", JSON.stringify(ITEMS));

	startGameUpdate()
}
