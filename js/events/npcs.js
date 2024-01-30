const EVENTS_NPCS = {
	placeholder: [
		[
			async () => { // Level 0, Progression 0
				stopGameUpdate();

				setSpeakers({
					name: "placeholder",
					position: 0,
					clothe: "default"	
				});

				await speakWithNpc([
					"placeholder/ HI",
					"player/ Uhhh.. Hi?<br>What are you?",
					"placeholder/ No more budget for dialogues!",
					"player/ ..",
					"placeholder/ Before you go, take this.."
				]);

				await speakWithNpcAnimation([
					"placeholder/ The developer needs to make a test",
					"player/ Who?",
					() => animationHandler.setFrame(1, 0),
					"placeholder/ Just take it",
					async () => {
						await animationInteract([
							"test1",
							createActionButton(4, 3, 2, 2, async () => {
								animationHandler.setFrame(0, 0);
								
								toggleTextBoxAnimation();
								await readDialogues([
									"placeholder/ Lost it and you'll die",
									"player/ Uh.. ok",
									"placeholder/ Great job!"
								], $SPEAK_ANIMATION);
								toggleTextBoxAnimation();

								animationHandler.setFrame(2, 0);
							})
						]);
						await animationInteract([
							"test2",
							createActionButton(1, 1, 1, 2, async () => {
								animationHandler.setFrame(0, 0);
								
								toggleTextBoxAnimation();
								await readDialogues([
									"player/ ..",
								], $SPEAK_ANIMATION);
								toggleTextBoxAnimation();
							})
						])
					}
				], {src: "./img/npc/placeholder/animationEv-0-0.png"});

				await speakWithNpc([
					"placeholder/ Enjoy your day and try to not die!"
				])

				NPCS.placeholder.lvlProgression++;
				startGameUpdate();
			},
			async () => { // Level 0, Progression 1
				stopGameUpdate();

				setSpeakers({
					name: "placeholder",
					position: 0,
					clothe: "default"	
				});

				await speakWithNpc([
					"placeholder/ That's all"
				]);

				startGameUpdate();
			}
		]
	]
};
