function catchEvent() {
	for(const NPC of Object.keys(thisRoomNpcs))
		if (collision(player.hitbox, thisRoomNpcs[NPC].eventBox, "all-still")) return thisRoomNpcs[NPC].eventBox;

	for(const TILE of thisRoom.events) {
		if (TILE.customProperties.hide) break;
		if (collision(player.hitbox, TILE, "all-still")) return TILE;
	}
}

function startEvent(eventTrigger) {
	let eventTriggerName = eventTrigger.name;

	if (eventTrigger.type === "npc") {
		let npc = NPCS[eventTriggerName.toLowerCase()];
		let npcName = npc.name.toLowerCase();

		if (
			EVENTS_NPCS[npcName][npc.lvl] === undefined ||
			EVENTS_NPCS[npcName][npc.lvl][npc.lvlProgression] === undefined
		)
			return console.log("No hay más contenido");;

		return EVENTS_NPCS[npcName][npc.lvl][npc.lvlProgression]();
	}

	if (eventTrigger.type === "changeRoom")
		return changeRoom(
			eventTrigger.customProperties.targetRoom,
			eventTrigger.customProperties.targetTile
		);

	if (eventTrigger.type === "room") {
		return EVENTS_ROOMS[eventTriggerName]();
	}
}

function pauseGame() {
	stopGameUpdate();
			
	document.getElementById("game").style.display = "none";
	document.getElementById("inventory").style.display = "flex";

	document.getElementById("player-name").innerText = player.name;
	document.getElementById("player-bio").innerText = "?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????";
}

function keyDown(e) {
	let key = e.key.toLowerCase();

	switch (key) {
		case "w":
			player.animate = true;
			player.Vy = BASE_VELOCITY;
			KEY_PRESSED.w = true;
			break;
		case "s":
			player.animate = true;
			player.Vy = -BASE_VELOCITY;
			KEY_PRESSED.s = true;
			break;
		case "a":
			player.animate = true;
			player.Vx = BASE_VELOCITY;
			player.sy = player.height;
			KEY_PRESSED.a = true;
			break;
		case "d":
			player.animate = true;
			player.Vx = -BASE_VELOCITY;
			player.sy = 0;
			KEY_PRESSED.d = true;
			break;
		case "q":
			pauseGame();
			break;
		case "shift":
			KEY_PRESSED.shift = true;
			break;
		default:
			break;
	}
}

function keyUp(e) {
	let key = e.key.toLowerCase();

	switch (key) {
		case "w":
			KEY_PRESSED.w = false;
			if (KEY_PRESSED.s) return player.Vy = -BASE_VELOCITY;
			player.Vy = 0;
			break;
		case "s":
			KEY_PRESSED.s = false;
			if (KEY_PRESSED.w) return player.Vy = BASE_VELOCITY;
			player.Vy = 0;
			break;
		case "a":
			KEY_PRESSED.a = false;
			if (KEY_PRESSED.d) return player.Vx = -BASE_VELOCITY, player.sy = 0;
			player.Vx = 0;
			break;
		case "d":
			KEY_PRESSED.d = false;
			if (KEY_PRESSED.a) return player.Vx = BASE_VELOCITY, player.sy = player.sHeight;
			player.Vx = 0;
			break;
		case "e":
			let event = catchEvent();
			if (event !== undefined) startEvent(event);
			break;
		case "shift":
			KEY_PRESSED.shift = false;
			break;
		default:
			break;
	}
}