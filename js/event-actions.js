function changeElementStyle(element, options) {
	for (const option of options) {
		element.style[option[0]] = option[1];
	}
}

// * ROOMS ---

function changeRoom(roomName, tileName) {
	stopGameUpdate();
	player.room = roomName;

	for (const KEY of Object.keys(ROOMS))
		if (ROOMS[KEY].name === player.room) {
			thisRoom = ROOMS[KEY];
			break;
		}

	thisRoomNpcs = {};
	for (const KEY of Object.keys(NPCS))
		if (NPCS[KEY].room === player.room) thisRoomNpcs[KEY] = NPCS[KEY];

	let tile = thisRoom.events.find(tile => tile.name === tileName);
	let offsetX = player.hitbox.x - tile.x - (tile.width / 2 - player.hitbox.width / 2);
	let offsetY = player.hitbox.y - tile.y - (tile.height / 2 - player.hitbox.height / 2);

	moveObjects(offsetX, offsetY);
	startGameUpdate();
}

// * NPCS ---

const SPEAKERS = {
	npc: {
		name: "",
		position: 0,
		clothe: ""
	},
	player: {
		name: "player",
		position: 1,
		clothe: "default"
	}
};
				
function setSpeakers(optionsNpc, clothePlayer) {
	SPEAKERS.npc = optionsNpc;
	SPEAKERS.player.position = 1 - optionsNpc.position;
	SPEAKERS.player.clothe = clothePlayer ?? "default";
}

async function timeOut(timeInSeconds) {
	await new Promise(resolve => setTimeout(resolve, timeInSeconds * 1000));
}

async function awaitClick(targetElement) {
	let interval;
	let userClicked = false;
	targetElement.addEventListener("click", () => userClicked = true, { once: true });

	await new Promise((resolve) => {
		interval = setInterval(() => {
			if (userClicked) resolve(clearInterval(interval));
		},
		100);
	});
}

function drawBlackBackground() {
	context.globalAlpha = 0.85;
	context.fillStyle = '#272222';
	context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	context.globalAlpha = 1;
}

function generateDialogue(text, textBox) {
	let speakerName = text.split("/ ")[0];
	let dialogue = text.slice(speakerName.length + "/ ".length);
	let speaker = (speakerName === "player") ? player : NPCS[speakerName];
	
	changeElementStyle(textBox, [
		["webkitTextFillColor", speaker.textColor],
		["backgroundColor", speaker.textBackground],
		["border", `4px solid ${speaker.textColor}`]
	])
	
	textBox.innerHTML = `<p>${speaker.name}:</p><p>${dialogue}</p>`;
}

async function changeSpeakerImg(speakerKey) {
	let speaker = SPEAKERS[speakerKey];

	const $SPEAKER = document.getElementById(`speaker-${speaker.position}`);
	
	if ($SPEAKER.src.includes(`/img/npc/${speaker.name}/speak-clothe-${speaker.clothe}.png`))
		return;

	$SPEAKER.src = `./img/npc/${speaker.name}/speak-clothe-${speaker.clothe}.png`;
	
	await loadImages([$SPEAKER]);
}

async function changeClothes(objKey, clothe) {
	SPEAKERS[objKey].clothe = clothe;
	await changeSpeakerImg(objKey);
}

function generateJsonDialogueArray(array) {
	let jsonDialogueArray = [];

	for (let i = 0, j = 0; i < array.length; i++) {
		const element = array[i];
		
		if (typeof element === "string") {
			jsonDialogueArray[j] = {};
			jsonDialogueArray[j].text = element;
			j++;
		}

		if (typeof element === "function")
			jsonDialogueArray[j - 1].event = element;
	}

	return jsonDialogueArray;
}

async function readDialogues(dialogues, targetBoxElement) {
	for (const DIALOGUE of generateJsonDialogueArray(dialogues)) {
		generateDialogue(DIALOGUE.text, targetBoxElement);
		await awaitClick(document);

		if (DIALOGUE.event !== undefined) {
			await DIALOGUE.event();
		}
		
	}
}

async function speakWithNpc(dialogues) {
	await changeSpeakerImg("npc");
	await changeSpeakerImg("player");
	drawBlackBackground();
	$TEXT_BOX_OVERWORLD.style.display = "flex";

	await readDialogues(dialogues, $TEXT_BOX_NPC_SPEAK);
	await timeOut(0.25);
	$TEXT_BOX_OVERWORLD.style.display = "none";
}

// * ANIMATIONS

let animationHandler;

function animationUpdate() {
	if (animationHandler.animate)
		animationID = window.requestAnimationFrame(animationUpdate);

	animationHandler.draw();
}

async function setAnimationHandler(animationHandlerOptions) {
	animationHandler = new AnimationHandler(animationHandlerOptions);
	await loadImages([animationHandler.img]);
}

async function startAnimation(animationHandlerOptions) {
	animationHandlerOptions.width = ANIMATION_WIDTH;
	animationHandlerOptions.height = ANIMATION_HEIGHT;
	animationHandlerOptions.sWidth = ANIMATION_WIDTH / 2;
	animationHandlerOptions.sHeight = ANIMATION_HEIGHT / 2;
	await setAnimationHandler(animationHandlerOptions);

	$ANIMATION_BOX.style.display = "flex";
	context = $CANVAS_ANIMATION.getContext('2d');
	animationUpdate();
}

function stopAnimation() {
	window.cancelAnimationFrame(animationID);
	animationHandler = undefined;
	$ANIMATION_BOX.style.display = "none";
}

function toggleTextBoxAnimation() {
	if ($SPEAK_ANIMATION.style.display === "flex") {
		$SPEAK_ANIMATION.style.display = "none";
		$ACTION_BUTTONS.style.display = "flex";
	} else if ($SPEAK_ANIMATION.style.display === "none") {
		$SPEAK_ANIMATION.style.display = "flex";
		$ACTION_BUTTONS.style.display = "none";
	}
}

async function speakWithNpcAnimation(dialogues, animationHandlerOptions) {
	await startAnimation(animationHandlerOptions);
	$SPEAK_ANIMATION.style.display = "flex";

	await readDialogues(dialogues, $SPEAK_ANIMATION);
	$SPEAK_ANIMATION.style.display = "none";

	stopAnimation();
}

function showCheckedButtonActBox() {
	let arrayRadioButtons = Array.from(document.getElementsByName("action-button"));
	let enabledRadioButtons = arrayRadioButtons.filter($radioButton => !$radioButton.disabled);

	for (const $radioButton of enabledRadioButtons) {
		if ($radioButton.checked)
			document.getElementById(`action-box-${$radioButton.id}`).style.display = "block";
		else document.getElementById(`action-box-${$radioButton.id}`).style.display = "none";
	}
}

function disableRadioButton($radioButton) {
	$radioButton.disabled = true;

	changeElementStyle($radioButton.labels[0], [
		["backgroundColor", "#a8836e"],
		["cursor", "url(./img/cursor.png) 20 20, pointer"]
	]);
}

function enableRadioButton($radioButton) {
	$radioButton.disabled = false;

	changeElementStyle($radioButton.labels[0], [
		["backgroundColor", "#e3b898"],
		["cursor", "url(./img/cursor1.png) 20 20, pointer"]
	]);
}

function enableRadioButtons(arrayIDs) {
	let verifyIDs = (verifier) => {
		for (const ID of arrayIDs)
			if (ID === verifier) return true;
		return false;
	};

	document.getElementsByName("action-button").forEach($button => {
		if (verifyIDs($button.id)) {
			enableRadioButton($button);
		} else {
			disableRadioButton($button);
		}
	})
}

function createActionButton(x, y , w, h, ev) {
	return {x: x * 64, y: y * 64, w: w * 64, h: h * 64, event: ev};
}

async function animationInteract(...buttons) {
	const $interactiveElements = document.getElementById("interactive-elements");
	let interactiveElements = [];
	let buttonsToEnable = [];
	
	async function resolveActionQueue(element, resolvePromise) {
		for (const action of element.actionQueue) {
			action.parentNode.removeChild(action);
			action.actionExecuted = true;
			await element.actionQueue.shift().executeAction();
		}
		
		if (Array.from(element.$actionBox.children).every(action => action.actionExecuted === true))
			resolvePromise(
				disableRadioButton(element.$optionButton),
				element.$actionBox.parentNode.removeChild(element.$actionBox)
			);
		else await timeOut(0.3).then(() => resolveActionQueue(element, resolvePromise));
	}

	for (let i = 0, j = 0; i < buttons.length; i++) {
		for (const button of buttons[i]) {
			if (j === 0) {
				interactiveElements.push({
					$optionButton: document.getElementById(`${button}`),
					$actionBox: document.createElement("div"),
					actionQueue: []
				});

				changeElementStyle(interactiveElements[i].$actionBox, [
					["display", "none"],
					["position", "relative"],
					["zIndex", i],
					["width", "var(--animation-width)"],
					["height", "var(--animation-width)"]
				]);

				$interactiveElements.appendChild(interactiveElements[i].$actionBox);
				interactiveElements[i].$actionBox.id = `action-box-${button}`;
				interactiveElements[i].$optionButton.onclick = () => showCheckedButtonActBox();
				buttonsToEnable.push(button);
				j++;
				continue;
			}

			let $button = document.createElement("div");

			$button.executeAction = button.event;
			changeElementStyle($button, [
				["position", "absolute"],
				["backgroundColor", "rgba(255, 0, 255, 0.5)"],
				["width", `${button.w}px`],
				["height", `${button.h}px`],
				["top", `${button.y}px`],
				["left", `${button.x}px`],
				["cursor", "url(./img/cursor1.png) 20 20, pointer"],
				["zIndex", j]
			]);

			$button.addEventListener("click", () => 
				interactiveElements[i].actionQueue.push($button)
			);

			j++;
			interactiveElements[i].$actionBox.appendChild($button);
		}

		j = 0;
	}

	enableRadioButtons(buttonsToEnable);

	toggleTextBoxAnimation();
	await Promise.all(interactiveElements.map(element =>
		new Promise(resolve => resolveActionQueue(element, resolve))
	));
	toggleTextBoxAnimation();
}
