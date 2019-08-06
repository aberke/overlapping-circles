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

function orderName(unorderedName) {
	/*
		Function to perform a lexicographic ordering on a picture's unordered name (in bracket form):
		2{2{}1{}}1{} will be converted to 1{}2{1{}2{}}
	*/

	if (unorderedName.length == 0) {
		return '';
	}


	/*
		A tree node that represents a single pair of brackets with a corresponding overlap number (i.e. 2{}).
	*/
	class BracketGroup {
		constructor(overlapNum, parentKey) {
			this.overlapNum = overlapNum;
			this.parentKey = parentKey;
			this.children = [];
		}
	}

	let bracketStack = [];

	// Build a lookup table to map the opening bracket index to the BracketGroup object
	let table = Object();
	table[undefined] = new BracketGroup("0", null)
	root = table[undefined]

	// Iterate through each character in the name. 
	// Note bracket indices and parent bracket indices to build the lookup table.
	for(let j = 0; j < unorderedName.length; j++) {
		if (unorderedName[j] == '{') {
			// record the index where the bracket appeared
			bracketStack.push(j); 
		} 
		if (unorderedName[j] == '}') {
			// Use the index of the opening bracket for this set of brackets as its key in the table
			let openBracket = bracketStack.pop();
			let num = unorderedName[openBracket - 1];
			let parentKey = bracketStack[bracketStack.length - 1]
			table[openBracket] = new BracketGroup(num, parentKey);
		}
	}

	// Give each bracket a parent. It's only fair.
	let keys = Object.keys(table);
	for (let key of keys) {
		let space = table[key];
		let parent = table[space.parentKey];
		if (parent) {
			parent.children.push(space);
		}
	}

	// Traverse tree
	function traverse(node) {
		string = node.overlapNum + '{'

		let sortedChildren = node.children.sort(function(a, b) {
			if (b.overlapNum == undefined) {
				return 1;
			} else if (a.overlapNum == undefined) {
				return -1;
			}
			return a.overlapNum - b.overlapNum;
		});

		for (let child of sortedChildren) {
			string += traverse(child);
		}
		return string + '}'
	}

	// Return the reordered name
	return traverse(root);
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

  // Test the lexicographic ordering function
  console.log(orderName('1{}3{}2{2{}1{}}1{}'));
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
