const $CANVAS_OVERWORLD = document.getElementById("overworld");
const $CANVAS_ANIMATION = document.getElementById("animation");
const $TEXT_BOX_OVERWORLD = document.getElementById("overworld-text-box");
const $TEXT_BOX_NPC_SPEAK = document.getElementById("speak-with-npc");
const $ANIMATION_BOX = document.getElementById("animation-box");
const $SPEAK_ANIMATION = document.getElementById("speak-animation");
const $ACTION_BUTTONS = document.getElementById("action-buttons");
const BASE_VELOCITY = 4;
const WIDTH = 32;
const HEIGHT = 32;
const SCREEN_WIDTH = 960;
const SCREEN_HEIGHT = 640;
const ANIMATION_WIDTH = 512;
const ANIMATION_HEIGHT = 512;
const KEY_PRESSED = {};
const EVENT_WARNINGS = {
	exclamation: new Image(),
	talk: new Image()
};
const NPCS = {};
const ROOMS = {};
const ITEMS = {};

EVENT_WARNINGS.exclamation.src = './img/warning-exclamation.png';
EVENT_WARNINGS.talk.src = './img/warning-talk.png';

$CANVAS_OVERWORLD.width = SCREEN_WIDTH;
$CANVAS_OVERWORLD.height = SCREEN_HEIGHT;
$CANVAS_ANIMATION.width = ANIMATION_WIDTH;
$CANVAS_ANIMATION.height = ANIMATION_HEIGHT;

let context = $CANVAS_OVERWORLD.getContext('2d');
let animationID;

let player;
let thisRoom;
let thisRoomNpcs = {};
let thisRoomItems = {};
