function catchEvent() {
	for (const NPC of Object.keys(thisRoomNpcs))
		if (collision(player.hitbox, thisRoomNpcs[NPC].eventBox, "all-still")) return thisRoomNpcs[NPC].eventBox;

	for (const TILE of thisRoom.events) {
		if (TILE.customProperties.hide) continue;
		if (collision(player.hitbox, TILE, "all-still")) return TILE;
	}

	for (const ITEM of Object.keys(thisRoomItems))
		if (collision(player.hitbox, thisRoomItems[ITEM].eventBox, "all-still")) return thisRoomItems[ITEM].eventBox;
}

async function startEvent(eventTrigger) {
	let eventTriggerName = eventTrigger.name;

	if (eventTrigger.type === "npc") {
		stopGameUpdate();

		let npc = NPCS[eventTriggerName];

		if (
			EVENTS_NPCS[npc.key][npc.lvl] === undefined ||
			EVENTS_NPCS[npc.key][npc.lvl][npc.lvlProgression] === undefined
		)
			return console.log("No hay más contenido");

		await EVENTS_NPCS[npc.key][npc.lvl][npc.lvlProgression]();
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
		} else $button.labels[0].style.backgroundColor = "";
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

	if (document.getElementById("npc-display-img").src !== selectedNpc.speakingClothesSrc)
		document.getElementById("npc-display-img").src = selectedNpc.speakingClothesSrc;

	if (document.getElementById("npc-bio").innerText !== selectedNpc.bio)
		document.getElementById("npc-bio").innerText = selectedNpc.bio;

	if (document.getElementById("npc-name").innerText !== selectedNpc.name)
		document.getElementById("npc-name").innerText = selectedNpc.name;

	$npcInfo.style.display = "flex";

	document.getElementById("npc-stats-back-button").addEventListener("click", () => {
		document.getElementById("npc-list").parentNode.style.display = "flex";
		npcList.forEach(input => input.checked = false);
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

	const createInfoSelector = function(obj, radioName, callBack) {
		const $label = document.createElement("label");
		$label.className = "unstyled-button";

		const $input = document.createElement("input");
		$input.type = "radio";
		$input.className = "radio";
		$input.name = `${radioName}-info-selector`;
		$input.id = obj.key;
		$input.onclick = () => callBack()

		const $img = document.createElement("img");
		$img.src = obj.img.src;

		if (radioName === "npcs") {
			$img.style.setProperty("--sprite-width", `${obj.img.width * -1}px`);
			$img.style.setProperty("--step-start", `${obj.frameStart * obj.width * -1}px`);
			$img.style.translate = `0px -${obj.sy * 2}px`;
			$img.style.animation = `
				idle
				${1 / (60 / obj.frameSpeed) * (obj.frameEnd - obj.frameStart)}s
				steps(${obj.frameEnd - obj.frameStart})
				infinite
			`;
		}

		$label.appendChild($input);
		$label.appendChild($img);

		return $label;
	}

	const createSelectionWindow = function(windowID, elementsToDisplay, radioName, callBackOnclick) {
		document.getElementById(windowID).innerHTML = "";

		for(const key of Object.keys(elementsToDisplay)) {
			const obj = elementsToDisplay[key];
			document.getElementById(windowID).appendChild(createInfoSelector(obj, radioName, callBackOnclick));
		}
	}

	if (buttonName === "ITEMS") {
		createSelectionWindow("item-bag", player.inventory, "items", fillItemsInfo);

		document.getElementById("player-stats").style.display = "none";
		document.getElementById("items").style.display = "flex";
		document.getElementById("npcs").style.display = "none";
		return;
	}

	if (buttonName === "NPCS") {
		createSelectionWindow("npc-list", NPCS, "npcs", fillNpcsInfo);

		document.getElementById("player-stats").style.display = "none";
		document.getElementById("items").style.display = "none";
		document.getElementById("npcs").style.display = "flex";
		return;
	}
}

function detectResumeKey(e) {
	if (e.key.toLowerCase() === 'q') resumeGame();
}

function resumeGame(can_startGameUpdate = true) {
	document.getElementById("inventory").style.display = "none";
	document.getElementById("game").style.display = "flex";
	window.removeEventListener("keydown", detectResumeKey);
	document.getElementById("npc-stats-back-button")?.click();

	if (can_startGameUpdate) startGameUpdate();
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
	
	if (key === "e") return KEY_PRESSED.e = false;

	KEY_PRESSED[key] = true;
	
	if (key === "a" || key === "d") KEY_PRESSED.lastKeyX = key;
	if (key === "w" || key === "s") KEY_PRESSED.lastKeyY = key;
}

function keyUp(e) {
	let key = e.key.toLowerCase();
	
	if (key === "e") return KEY_PRESSED.e = true;

	KEY_PRESSED[key] = false;

	if (key === "a" && KEY_PRESSED.d) KEY_PRESSED.lastKeyX = "d";
	if (key === "d" && KEY_PRESSED.a) KEY_PRESSED.lastKeyX = "a";
	if (key === "w" && KEY_PRESSED.s) KEY_PRESSED.lastKeyY = "s";
	if (key === "s" && KEY_PRESSED.w) KEY_PRESSED.lastKeyY = "w";
}