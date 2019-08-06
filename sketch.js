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
		let hue = 90;
		for (let subPic of this.subPictures) {
			hue = (hue + 30) % 255;
			stroke(hue, 255, 255);
			for (let c of subPic) {
				circle(c.center.x, c.center.y, 2*c.radius)
			}
		}
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
		return '1{}'
	}

	get subPictures() {
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
		return subPictures
	}

}

function lexSort(unorderedName) {
	// Return the name with sub-pictures sorted lexicographically 
	if (unorderedName.length == 0) {
		return '';
	}

	let depth = 0;
	let groups = [];
	let stack = [];

	for(let j = 0; j < unorderedName.length; j++) {
		if (unorderedName[j] == '{') {
			stack.push(j); // record the index where the bracket appeared
		} 
		if (unorderedName[j] == '}') {
			let open = stack.pop();
			let num = unorderedName[open - 1];
			let close = j;
			let parent = stack[stack.length - 1]
			let depth = stack.length
			groups.push([num, open, close, parent, depth]);
		}
	}

	// sort by overlap num
	groups = groups.sort(function(a, b) {
		if (b[0] == undefined) {
			return 1;
		} else if (a[0] == undefined) {
			return -1;
		}
		return a[0] - b[0];
	});

	// sort by parent
	groups = groups.sort(function(a, b) {
		if (b[3] == undefined) {
			return 1;
		} else if (a[3] == undefined) {
			return -1;
		}
		return a[3] - b[3];
	});

	console.log(groups);

	class OverlapSpace {
		constructor(overlapNum) {
			this.overlapNum = overlapNum;
			this.children = []
		}
	}

	//build a lookuptable
	let table = Object();
	for (let space of groups) {
		let key = space[1];
		table[key] = new OverlapSpace(space[0]);
	}
	console.log(table);

	//build a tree
	table[undefined] = new OverlapSpace("0")
	root = table[undefined]
	console.log('root', root)
	for (let space of groups) {
		let key = space[1];
		let parentKey = space[3];
		let parent = table[parentKey];
		let node = table[key];
		console.log('adding', key, parentKey, parent, node);
		parent.children.push(node);
	}

	console.log(root);

	// Traverse tree
	function print(node) {
		string = node.overlapNum + '{'
		for (let child of node.children) {
			string += print(child);
		}
		return string + '}'
	}
	console.log(print(root))
}

// Ew global things.  Fix this.
let picture;
let circleCenter, circleRadius;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  colorMode(HSB, 255);

  // Name the picture
  textSize(32);

  // Make the initial picture
  picture = new Picture([]);

  // Test the lexSort function
  lexSort('1{}3{}1{5{}2{}1{}}');
}

function mousePressed() {
	circleCenter = createVector(mouseX, mouseY);
}

function mouseReleased() {
	circleRadius = circleCenter.dist(createVector(mouseX, mouseY));
	let c = new Circle(circleCenter, circleRadius);
	picture.addCircle(c);

	background(255);
	fill(0);
	text(picture.name, 30, 30);
	picture.draw();
}
