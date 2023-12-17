function changeRoom(roomName, tileName) {
	stopGameUpdate();
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

const EVENTS_ROOMS = {
	exitHome: () => changeRoom("forest-home", "enterHome"),
	enterHome: () => changeRoom("home", "exitHome")
};