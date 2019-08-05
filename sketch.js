/*
Circle Class
*/
class Circle {
	// Center is a vector
	constructor(center, radius) {
		this.center = center;
		this.radius = radius;
	}

	isSameCircle(otherCircle) {
		return (this.radius == otherCircle.radius 
			&& this.center == otherCircle.center);
	}

	overlaps(otherCircle) {
		// Circles overlap when the distance between their center is
		// less than the sum of their radii
		let dist = this.center.dist(otherCircle.center);
		return (dist < (this.radius + otherCircle.radius));
	}

	contains(otherCircle) {
		return this.center.dist(otherCircle.center) < (this.radius - otherCircle.radius);
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
		this.circles.forEach((c) => { circle(c.center.x, c.center.y, 2*c.radius) });
	}

	addCircle(c) {
		// TODO: avoid adding duplicate circle
		for (let circle of this.circles) {
			if (circle.isSameCircle(c)) {
				console.info("Picture is not adding duplicate circle", c);
				return;
			}
		}
		this.circles.push(c);
	}

	get name() {
		let subPictures = [];
		for (let circle of this.circles) {
			// let currentSubPic;
			// let csp = 0;
			let currentSubPicIndex = -1;
			let sp = 0;
			while (sp < subPictures.length) {
				let subPic = subPictures[sp];
				let didSplice = false;
				for (let otherCircle of subPic) {
					if (circle.isSameCircle(otherCircle)) {
						console.error("same circle?!", circle, otherCircle);
						continue;
					}
					// console.log('overlaps', circle.overlaps(otherCircle))
					// console.log('contains 1,2', circle.contains(otherCircle))
					// console.log('contains 2,1', otherCircle.contains(circle))
					if (circle.overlaps(otherCircle)
						|| circle.contains(otherCircle)
						|| otherCircle.contains(circle)) {
						// circle belongs in same subPic as otherCircle
						if (currentSubPicIndex < 0) {
							currentSubPicIndex = sp;
							subPic.push(circle);
						} else {
							subPictures[currentSubPicIndex] = subPictures[currentSubPicIndex].concat(subPic);
							subPictures.splice(sp, 1);
							didSplice = true;
						}
						break;
					}
				}
				if (!didSplice)
					sp += 1;
			}
			if (currentSubPicIndex < 0) {
				// Make a new subpicture
				let newSubPicture = [circle];
				subPictures.push(newSubPicture);
			}
		}
		console.log(subPictures)
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

let radius = 40;

function mouseClicked() {
	let circleCenter = createVector(mouseX, mouseY)
	let c = new Circle(circleCenter, radius);
	picture.addCircle(c);

	background(255);
	fill(0);
	text(picture.name, 30, 30);
	picture.draw();
}
