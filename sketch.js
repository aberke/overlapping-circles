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

	intersections(otherCircle) {

		if (this.isSameCircle(otherCircle) || this.contains(otherCircle)) {
			return [];
		}

		let D = this.center.dist(otherCircle.center);

		let x1 = this.center.x;
		let y1 = this.center.y;
		let x2 = otherCircle.center.x;
		let y2 = otherCircle.center.y;

		let rs = this.radius**2 - otherCircle.radius**2;
		let ra = this.radius**2 + otherCircle.radius**2;

		let eq1 = (a, b) => (1/2 * (a + b)) + (rs / (2 * D**2) * (b - a))
		let root = Math.sqrt(2 * (ra / D**2) - (rs ** 2 / D**4) - 1)

		let points = [createVector(0, 0), createVector(0, 0)];
		points[0].x = eq1(x1, x2) + 1/2 * root * (y2 - y1);
		points[1].x = eq1(x1, x2) - 1/2 * root * (y2 - y1);
		points[0].y = eq1(y1, y2) + 1/2 * root * (x1 - x2);
		points[1].y = eq1(y1, y2) - 1/2 * root * (x1 - x2);

		return points;
	}
}



class Arc {
	/*
	circle := Circle(center{x,y}, radius)
	angleRange := (radians, radians)
	*/
	constructor(circle, angleRange) {
		this.circle = circle;
		this.angleRange = angleRange;
	}

	get isEmpty() {
		return ((this.innerArcs.length == 0) && (this.outterArcs.length == 0));
	}

	pointToAngle(point) {
		// Note that converting from angles to points and back is only precise to about 2.1e-8 pixels
		return Math.acos((point.x - this.circle.center.x) / this.circle.radius);
	}

	angleToPoint(angle) {
		return createVector(
			this.circle.center.x + this.circle.radius * Math.cos(angle),
			this.circle.center.y + this.circle.radius * Math.sin(angle)
		);
	}

	get endpoints() {
		// TODO figure out if this is a good idea to use...
		// Could be expensive to compute this everytime we need these
		let pts = [this.angleToPoint(this.angleRange[0]), this.angleToPoint(this.angleRange[1])];
		return pts;
	}


	getIntersections(otherArc) {
		this.circle.intersections(otherArc.circle);
	}

	angleIsInRange(angle) {
		angle = angle % 2*Math.PI; // just in case we are bad at coding
		// Angles are always stored in clockwise direction [first encountered angle, second angle]
		let ar0 = this.angleRange[0];
		let ar1 = this.angleRange[1];
		if (ar0 < ar1) // normal case
			return ((ar0 < angle) && (angle < ar1));
		// else (ar0 > ar1) happens when angle range wraps around 2PI / 0
		// check if angle between ar0 and 2PI and then check if between 0 and ar1
		return ((ar0 < angle) || (angle < ar1));
	}

	break(otherArc) {
		// Returns a list of arcs that this arc is broken into

		// Break this arc apart by the otherArc iff the otherArc intersects this arc
		let intersections = this.getIntersections(otherArc);
		if (intersections.length == 1 || intersections.length > 2) {
			console.error('Broken function!!');
		}
		if (intersections.length == 0)
			return [this];

		let intersection0 = intersections[0];
		let intersection1 = intersections[1];
		let angle0 = this.pointToAngle(intersection0);
		let angle1 = this.pointToAngle(intersection1);


		if (this.angleIsInRange(angle0) && this.angleIsInRange(angle1)) {
			// The other Arc intersects this arc twice, so we will return 3 arcs
			let orderedAngleList;
			let lesserAngle, greaterAngle;
			if (angle0 <= angle1) {
				lesserAngle = angle0;
				greaterAngle = angle1;
			} else {
				lesserAngle = angle1;
				greaterAngle = angle0;
			}
			// check if the angles wrap around 2PI / 0
			if ((greater > this.angleRange[0]) && (lesserAngle <= this.angleRange[0])) {
				orderedAngleList = [greaterAngle, lesserAngle];
			} else { 
				// normal case
				orderedAngleList = [lesserAngle, greaterAngle];
			}
			return [
				new Arc(this.circle, [this.angleRange[0], orderedAngleList[0]]),
				new Arc(this.circle, [orderedAngleList[0], orderedAngleList[1]]),
				new Arc(this.circle, [orderedAngleList[1], this.angleRange[1]]),
			];
		}
		// otherwise we return 2 arcs because one of the angles is not in the range
		if (this.angleIsInRange(angle0)) {
			// we create 2 new arcs
			return [
				new Arc(this.circle, [this.angleRange[0], angle0]),
				new Arc(this.circle, [angle0, this.angleRange[1]]),
			];
		}
		if (this.angleIsInRange(angle1)) {
			// we create 2 new arcs
			return [
				new Arc(this.circle, [this.angleRange[0], angle1]),
				new Arc(this.circle, [angle1, this.angleRange[1]]),
			];
		}
		// Otherwise these arcs did not intersect (though their circles may still have intersected)
		return [this];
	}

}

class Space {
	/*
	innerArcs :[]
	outterArcs: []
	*/
	constructor(innerArcs=[], outterArcs=[]) {
		this.innerArcs = innerArcs;
		this.outterArcs = outterArcs;
	}
	get overlapNum() {
		return innerArcs.length;
	}
}

/*
Picture Class
*/
class Picture {
	constructor(circles) {
		this.circles = circles;
	}

	get spaces() {
		// Returns a list of found spaces
		// each space starts as a circle from the (sub)picture
		// that is then divided by the other circles it intersects
		let foundSpaces = [];
		// There is a working spacesQueue that contains each of the
		// spaces that need to be further broken down to a final foundSpace
		// the SpacesQueue is initialized with all of the circles in the subpicture
		// The initial spaces in the queue contain full circles as one innerArc
		let spacesQueue = [];
		// initialize the queue
		for (let circle of this.circles) {
			let space = new Space([new Arc(circle, [0, 2*Math.PI], [])]);
			spacesQueue.push(space);
		}
		// spacesQueue has been initialized
		while (spacesQueue.length > 0) {
			// There are spaces we will create for the next iteration of this loop
			// they go in the nextQueue and they are added to the spacesQueue at the
			// end of this iteration of the loop
			let nextQueue = [];
			// dequeue
			let workingSpace = spacesQueue.shift();


			// For each of the other items in the SpacesQueue, see how they overlap
			// with the workingSpace and break down the working space
			for (let otherSpace of spacesQueue) {

				// create the new space that might result from the overlap
				// between working and other space
				// if it has arcs it will end up in the nextQueue.
				let newSpace = new Space();
				// check both the inner and outter arcs of the other space for overlaps
				for (let otherInnerArc of otherSpace.innerArcs) {

					// The list of arcs is going to change throughout this loop
					let newWorkingSpaceInnerArcs = [];
					let newWorkingSpaceOutterArcs = [];


					for (let workingInnerArc of workingSpace.innerArcs) {

						let workingArcPieces = workingInnerArc.break(otherInnerArc);
						// arcPieces has 1, 2, or 3 pieces in it
						for (let workingArcPiece of workingArcPieces) {
							// If the arc piece is contained in the other arc's circle,
							// then it belongs to the new space.
							// Otherwise it belongs to the working space
							let workingArcPieceMidpoint = workingArcPiece.midpoint; // TODO: right this function
							if (otherInnerArc.circle.containsPoint(workingArcPieceMidpoint)) {
								// this arc piece belongs to the new space
								// as an inner arc (right? because it was an inner arc before)
								newSpace.innerArcs.push(workingArcPiece);
							} else {
								newWorkingSpaceInnerArcs.push(workingArcPiece);
							}
						}

						let otherArcPieces = otherInnerArc.break(workingInnerArc);
						for (let otherArcPiece of otherArcPieces) {
							let otherArcPieceMidpoint = otherArcPiece.midpoint();
							if (workingInnerArc.circle.containsPoint(otherArcPieceMidpoint)) {
								newSpace.innerArcs.push(otherArcPiece);
								newWorkingSpaceOutterArcs.push(otherArcPiece);
							}
						}
					}

					for (let workingOutterArc of workingSpace.outterArcs) {
						let workingArcPieces = workingOutterArc.break(otherInnerArc);
						// arcPieces has 1, 2, or 3 pieces in it
						for (let workingArcPiece of workingArcPieces) {
							// If the arc piece is contained in the other arc's circle,
							// then it belongs to the new space.
							// Otherwise it belongs to the working space
							let workingArcPieceMidpoint = workingArcPiece.midpoint; // TODO: right this function
							if (otherInnerArc.circle.containsPoint(workingArcPieceMidpoint)) {
								// this arc piece belongs to the new space
								newSpace.outterArcs.push(workingArcPiece);
							} else {
								newWorkingSpaceOutterArcs.push(workingArcPiece);
							}
						}

						let otherArcPieces = otherInnerArc.break(workingOutterArc);
						for (let otherArcPiece of otherArcPieces) {
							let otherArcPieceMidpoint = otherArcPiece.midpoint;
							if (!workingOutterArc.circle.containsPoint(otherArcPieceMidpoint)) {
								newSpace.innerArcs.push(otherArcPiece);
								// is this always right?? // TODO(alex): think about this
								newWorkingSpaceOutterArcs.push(otherArcPiece);
							}
						}

					}
					workingSpace.innerArcs = newWorkingSpaceInnerArcs;
					workingSpace.outterArcs = newWorkingSpaceOutterArcs;
				}


				// We are now looking at the OUTTER arcs of the other space
				for (let otherOutterArc of otherSpace.outterArcs) {

					// The list of arcs is going to change throughout this loop
					let newWorkingSpaceInnerArcs = [];
					let newWorkingSpaceOutterArcs = [];


					for (let workingInnerArc of workingSpace.innerArcs) {

						let workingArcPieces = workingInnerArc.break(otherOutterArc);
						// arcPieces has 1, 2, or 3 pieces in it
						for (let workingArcPiece of workingArcPieces) {
							// If the arc piece is contained in the other arc's circle,
							// then it belongs to the new space.
							// Otherwise it belongs to the working space
							let workingArcPieceMidpoint = workingArcPiece.midpoint; // TODO: right this function
							if (otherOutterArc.circle.containsPoint(workingArcPieceMidpoint)) {
								// this arc piece belongs to the new space
								// as an inner arc (right? because it was an inner arc before)
								newSpace.innerArcs.push(workingArcPiece);
							} else {
								newWorkingSpaceInnerArcs.push(workingArcPiece);
							}
						}

						let otherArcPieces = otherInnerArc.break(workingInnerArc);
						for (let otherArcPiece of otherArcPieces) {
							let otherArcPieceMidpoint = otherArcPiece.midpoint;
							if (workingInnerArc.circle.containsPoint(otherArcPieceMidpoint)) {
								newSpace.innerArcs.push(otherArcPiece);
								newWorkingSpaceOutterArcs.push(otherArcPiece);
							}
						}
					}

					for (let workingOutterArc of workingSpace.outterArcs) {
						let workingArcPieces = workingOutterArc.break(otherOutterArc);
						// arcPieces has 1, 2, or 3 pieces in it
						for (let workingArcPiece of workingArcPieces) {
							// If the arc piece is contained in the other arc's circle,
							// then it belongs to the new space.
							// Otherwise it belongs to the working space
							let workingArcPieceMidpoint = workingArcPiece.midpoint; // TODO: right this function
							if (otherOutterArc.circle.containsPoint(workingArcPieceMidpoint)) {
								newWorkingSpaceOutterArcs.push(workingArcPiece);
							} else {
								newSpace.outterArcs.push(workingArcPiece);
							}
						}

						let otherArcPieces = otherInnerArc.break(workingOutterArc);
						for (let otherArcPiece of otherArcPieces) {
							let otherArcPieceMidpoint = otherArcPiece.midpoint;
							if (!workingOutterArc.circle.containsPoint(otherArcPieceMidpoint)) {
								newSpace.outterArcs.push(otherArcPiece);
								// TODO(alex): figure this out
								newWorkingSpaceInnerArcs.push(otherArcPiece);
							}
						}

					}
					workingSpace.innerArcs = newWorkingSpaceInnerArcs;
					workingSpace.outterArcs = newWorkingSpaceOutterArcs;
				}
			}
			// TODO: add check that space is not already in queue
			let isInQueue = false;
			if (!newSpace.isEmpty && !isInqueue()) {
				nextQueue.push(newSpace);
			}
		}
		// TODO: add check that space is not already in queue
		if (!isInqueue()) {
			foundSpaces.push(workingSpace);
		}
	}





	draw(drawPoints) {
		noFill();
		let hue = 90;
		let subPics = this.subPictures;
		for (let subPic of subPics) {
			hue = (hue + 30) % 255;
			stroke(hue, 255, 255);
			for (let c1 of subPic.circles) {

				strokeWeight(1);
				circle(c1.center.x, c1.center.y, 2*c1.radius)

				if (drawPoints) {
					strokeWeight(4);
					point(c1.center.x, c1.center.y);
					strokeWeight(7);
					for (let c2 of subPic.circles) {
						let pts = c1.intersections(c2);
						for (let pt of pts) {
							point(pt.x, pt.y);
						}
					}
				}
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
		return this.orderName('2{}1{}')
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
				for (let otherCircle of subPic.circles) {
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
							subPic.addCircle(circle);
						} else {
							for (let c of subPic.circles) {
								subPictures[currentSubPicIndex].addCircle(c);
							}
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
				let newSubPicture = new Picture([circle]);
				subPictures.push(newSubPicture);
			}
		}
		return subPictures
	}

	orderName(unorderedName) {
		/*
		Function to perform a lexicographic ordering on a picture's unordered name (in bracket form):
		2{2{}1{}}1{} becomes 1{}2{1{}2{}}
		*/

		if (unorderedName.length == 0) {
			return '';
		}

		
		// A tree node that represents a single pair of brackets with a corresponding overlap number (i.e. 2{}).
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
		let root = table[undefined]

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
			let string = node.overlapNum + '{'

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

  // // Test the lexicographic ordering function
  // console.log(picture.orderName('1{}3{}2{2{}1{}}1{}'));
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
	picture.draw(true);
}
