// , ["speakerName imgName", "speakerName imgName"]

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