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
		console.log('circles', this.circles)
		this.circles.forEach((c) => { circle(c.centerX, c.centerY, c.radius) });
	}

	addCircle(c) {
		// TODO: avoid adding duplicate circle
		this.circles.push(c);
	}

	get name() {
		// TODO: use circles to make name
		return '1{}';
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
	noFill();
	picture.draw();
	text(picture.name, 30, 30);
	fill(0);
}
