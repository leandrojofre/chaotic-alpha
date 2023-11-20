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
		default:
			break;
	}
}