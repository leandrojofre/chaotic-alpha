const $CANVAS_OVERWORLD = document.getElementById("overworld");
const $CANVAS_ANIMATION = document.getElementById("animation");
const $TEXT_BOX_NPC_SPEAK = document.getElementById("speak-with-npc")
const BASE_VELOCITY = 4;
const WIDTH = 32;
const HEIGHT = 32;
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 640;
const KEY_PRESSED = {
	w: false,
	a: false,
	s: false,
	d: false,
	e: false
};
const EVENT_WARNINGS = {
	exclamation: new Image(),
	skipText: new Image(),
	talk: new Image()
};

EVENT_WARNINGS.exclamation.src = './img/warning-exclamation.png';
EVENT_WARNINGS.skipText.src = './img/warning-skipText.png';
EVENT_WARNINGS.talk.src = './img/warning-talk.png';

$CANVAS_OVERWORLD.width = SCREEN_WIDTH;
$CANVAS_OVERWORLD.height = SCREEN_HEIGHT;

let context = $CANVAS_OVERWORLD.getContext('2d');
let animationID;

let player;
let npcs = {};
let rooms = {};
let thisRoom;
let thisRoomNpcs = {};
