/*
Circle Class
*/
class Circle {
	constructor(centerX, centerY, radius) {
		this.centerX = centerX;
		this.centerY = centerY;
		this.radius = radius;
	}
}

/*
Picture Class
*/
class Picture {
	constructor(circles) {
		this.circles = circles;
	}

	draw() {
		noFill();
		this.circles.forEach((c) => { circle(c.centerX, c.centerY, c.radius) });
	}

	addCircle(c) {
		// TODO: avoid adding duplicate circle
		this.circles.push(c);
	}

	get name() {
		// TODO: use circles to make name
		if (this.circles.length > 0) {
			return this.circles.length + '{}';
		} else {
			return '';
		}
	}
}



// Ew global things.  Fix this.
let picture;
function setup() {
  let canvas = createCanvas(800, 800);
  canvas.parent('canvas-container');

  // Name the picture
  textSize(32);

  // Make the initial picture
  picture = new Picture([]);
}


function mouseClicked() {
	let c = new Circle(mouseX, mouseY, 80);
	picture.addCircle(c);
	console.log('circles:', picture.circles);
	picture.draw();
}

function draw() {
	background(255);
	fill(0);
	text(picture.name, 30, 30);
	picture.draw();
}
