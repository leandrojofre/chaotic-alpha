const EVENTS_NPCS = {
	placeholder: [
		[
			async () => { // Level 0, Progression 0

				setSpeakers({
					name: "placeholder",
					position: 0
				});

				await speakWithNpc([
					"placeholder/ HI",
					"player/ Uhhh.. Hi?<br>What are you?",
					"placeholder/ No more budget for dialogues!",
					"player/ ..",
					"placeholder/ Before you go, take this.."
				]);

				await speakWithNpcAnimation([
					"placeholder/ The developer needs to make a test, that's why he put me as the Placeholder.",
					async () => NPCS.placeholder.name = "Placeholder",
					"player/ ¿Who?",
					() => animationHandler.setFrame(1, 0),
					"placeholder/ Just take it.",
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
					},
					"placeholder/ We knew the world would not be the same. A few people laughed, a few people cried. Most people were silent. I remembered the line from the Hindu scripture, the Bhagavad-Gita. Vishnu is trying to persuade the Prince that he should do his duty, and, to impress him, takes on his multi-armed form and says, 'Now I am become Death, the destroyer of worlds.' I suppose we all thought that, one way or another.",
					"player/ ¿What?",
					"placeholder/ A test for the overflowing text."
				], {
					src: "./img/npc/placeholder/animationEv-0-0.png",
					sWidth: 256,
					sHeight: 256
				});

				await speakWithNpc([
					"placeholder/ Enjoy your day and try to not die!"
				])

				ITEMS.core_of_chaos.sendToInventory();
				NPCS.placeholder.lvlProgression++;
			},
			async () => { // Level 0, Progression 1
				
				setSpeakers({
					name: "placeholder",
					position: 0
				});
				
				await changeClothes("npc", "test");
				await speakWithNpc([
					"placeholder/ That's all"
				]);
			}
		]
	]
};
