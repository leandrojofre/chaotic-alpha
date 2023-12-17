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

function generateDialogue(npcName, text) {
	let speaker = (npcName === "player") ? player : npcs[npcName];
	
	$TEXT_BOX_NPC_SPEAK.style.webkitTextFillColor = speaker.textColor;
	$TEXT_BOX_NPC_SPEAK.innerHTML = `<p>${speaker.name}:</p><p>${text}</p>`;
	$TEXT_BOX_NPC_SPEAK.style.backgroundColor = speaker.textBackground;
	$TEXT_BOX_NPC_SPEAK.style.border = `4px solid ${speaker.textColor}`;
}

async function changeSpeakerImg(speakerNum, speakerName, imgName) {
	const $SPEAKER = document.getElementById(`speaker-${speakerNum}`);
	$SPEAKER.src = `./img/npc/${speakerName}/speak-clothe-${imgName}.png`;
	await loadImages([$SPEAKER]);
}

async function speakWithNpc(dialogues, npc, npcPos) {

	await changeSpeakerImg(npcPos, npc, "default");
	await changeSpeakerImg(1 - npcPos, "player", "default");

	drawBlackBackground();

	$TEXT_BOX_NPC_SPEAK.style.display = "flex";
	document.querySelectorAll(".speaker").forEach(speaker => speaker.style.display = "flex");

	for (const DIALOGUE of dialogues) {
		generateDialogue(DIALOGUE[0], DIALOGUE[1]);

		if (DIALOGUE[2] !== undefined)
			await DIALOGUE[2].forEach(newImg => changeSpeakerImg(newImg.speakerNum, newImg.speakerName, newImg.imgName));

		await awaitClick(document);
	}

	$TEXT_BOX_NPC_SPEAK.style.display = "none";
	document.querySelectorAll(".speaker").forEach(speaker => speaker.style.display = "none");
}

// , [{speakerNum: , speakerName: "", imgName: ""}]


const EVENTS_NPCS = {
	placeholder: [
		[
			async () => {
				stopGameUpdate();

				const DIALOGUES = [
					["placeholder", "HI"],
					["player", "Uhhh.. Hi?"],
					["player", "What are you?"],
					["placeholder", "No more budget for dialogues!"],
					["player", "..."]
				]

				await speakWithNpc(DIALOGUES, "placeholder", 1);

				startGameUpdate();
			}
		]
	]
};