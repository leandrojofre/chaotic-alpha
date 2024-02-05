function catchEvent() {
	for (const NPC of Object.keys(thisRoomNpcs))
		if (collision(player.hitbox, thisRoomNpcs[NPC].eventBox, "all-still")) return thisRoomNpcs[NPC].eventBox;

	for (const TILE of thisRoom.events) {
		if (TILE.customProperties.hide) break;
		if (collision(player.hitbox, TILE, "all-still")) return TILE;
	}

	for (const ITEM of Object.keys(thisRoomItems))
		if (collision(player.hitbox, thisRoomItems[ITEM].eventBox, "all-still")) return thisRoomItems[ITEM].eventBox;
}

async function startEvent(eventTrigger) {
	let eventTriggerName = eventTrigger.name;

	if (eventTrigger.type === "npc") {
		stopGameUpdate();

		let npc = NPCS[eventTriggerName.toLowerCase()];
		let npcName = npc.name.toLowerCase();

		if (
			EVENTS_NPCS[npcName][npc.lvl] === undefined ||
			EVENTS_NPCS[npcName][npc.lvl][npc.lvlProgression] === undefined
		)
			return console.log("No hay más contenido");

		await EVENTS_NPCS[npcName][npc.lvl][npc.lvlProgression]();
		return startGameUpdate();
	}

	if (eventTrigger.type === "changeRoom")
		return changeRoom(
			eventTrigger.customProperties.targetRoom,
			eventTrigger.customProperties.targetTile
		);

	if (eventTrigger.type === "room") {
		return EVENTS_ROOMS[eventTriggerName]();
	}
	
	if (eventTrigger.type === "item") {
		return ITEMS[eventTrigger.name].sendToInventory();
	}
}

function selectUiButton() {
	let buttonSelected;

	for (const $button of Array.from(document.getElementsByName("ui-button"))) {
		if ($button.checked) {
			$button.labels[0].style.backgroundColor = "#362121";
			buttonSelected = $button;
		} else $button.labels[0].style.backgroundColor = "#724046";
	}

	return buttonSelected;
}

function fillItemsInfo() {
	const $itemsInfo = document.getElementById("items-info");
	const itemBag = Array.from(document.getElementsByName("items-info-selector"));
	const selectedItem = ITEMS[itemBag.find(item => item.checked).id];

	if (document.getElementById("item-name").innerText === selectedItem.name) return;

	$itemsInfo.innerHTML = `
		<img id="item-display-img" src="${selectedItem.img.src}">
		<div>
			<p id="item-name">${selectedItem.name}</p>
			<p id="item-description">${selectedItem.description}</p>
		</div>
	`;
}

function fillNpcsInfo() {
	document.getElementById("npc-list").parentNode.style.display = "none";
	const $npcInfo = document.getElementById("npc-stats");
	const npcList = Array.from(document.getElementsByName("npcs-info-selector"));
	const selectedNpc = NPCS[npcList.find(npc => npc.checked).id];

	$npcInfo.style.display = "flex";

	if (document.getElementById("npc-bio")?.innerText !== selectedNpc.bio) {
		$npcInfo.innerHTML = `
			<div id="npc-stats-back-button" class="button"><p>BACK</p></div>
			<div class="stats-info has-custom-background">
				<img src="${selectedNpc.speakingClothesSrc}" class="speaker">
				<div>
					<p id="npc-name">${selectedNpc.name}</p>
					<p id="npc-bio">${selectedNpc.bio}</p>
				</div>
			</div>
			<div id="custom-info-npc" class="custom-info has-custom-background"></div>
		`;
	}

	document.getElementById("npc-stats-back-button").addEventListener("click", () => {
		document.getElementById("npc-list").parentNode.style.display = "flex";
		$npcInfo.style.display = "none";
	}, {once: true});
}

function swapUiScreens() {
	let checkedButton = selectUiButton();
	let buttonName = checkedButton.parentElement.innerText;
	
	if (buttonName === "STATS") {
		document.getElementById("player-name").innerText = player.name;
		document.getElementById("player-bio").innerText = player.bio;

		document.getElementById("player-stats").style.display = "flex";
		document.getElementById("items").style.display = "none";
		document.getElementById("npcs").style.display = "none";
		return;
	}

	let createInfoSelector = function(obj, radioName, callBackName) {
		return `
			<label class="unstyled-button">
				<input type="radio" name="${radioName}-info-selector" id="${obj.key}" class="radio" onclick="${callBackName}()"></input>
				<img src='${obj.img.src}'>
			</label>
		`;
	}

	let createSelectionWindow = function(windowID, elementsToDisplay, radioName, callBackName) {
		document.getElementById(windowID).innerHTML = "";

		for(const key of Object.keys(elementsToDisplay)) {
			const obj = elementsToDisplay[key];
			document.getElementById(windowID).innerHTML += createInfoSelector(obj, radioName, callBackName);
		}
	}

	if (buttonName === "ITEMS") {
		createSelectionWindow("item-bag", player.inventory, "items", "fillItemsInfo");

		document.getElementById("player-stats").style.display = "none";
		document.getElementById("items").style.display = "flex";
		document.getElementById("npcs").style.display = "none";
		return;
	}

	if (buttonName === "NPCS") {
		createSelectionWindow("npc-list", NPCS, "npcs", "fillNpcsInfo");

		document.getElementById("player-stats").style.display = "none";
		document.getElementById("items").style.display = "none";
		document.getElementById("npcs").style.display = "flex";
		return;
	}
}

function detectResumeKey(e) {
	if (e.key.toLowerCase() === 'q') resumeGame();
}

function resumeGame() {
	document.getElementById("inventory").style.display = "none";
	document.getElementById("game").style.display = "flex";
	window.removeEventListener("keydown", detectResumeKey);
	document.getElementById("npc-stats-back-button").click();

	startGameUpdate();
}

function pauseGame() {
	stopGameUpdate();
	document.getElementById("game").style.display = "none";
	document.getElementById("inventory").style.display = "flex";

	swapUiScreens();
	window.addEventListener("keydown", detectResumeKey);
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