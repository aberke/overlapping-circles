
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
			let arc = new Arc(circle, [0, 2*Math.PI]);
			let space = new Space([arc], []);
			spacesQueue.push(space);
		}
		// spacesQueue has been initialized
		while (spacesQueue.length > 0) {
			console.log(spacesQueue);
			// There are spaces we will create for the next iteration of this loop
			// they go in the nextQueue and they are added to the spacesQueue at the
			// end of this iteration of the loop
			let nextQueue = [];
			// dequeue
			let workingSpace = spacesQueue.shift();
			console.log('workingSpace', workingSpace)
			// For each of the other items in the SpacesQueue, see how they overlap
			// with the workingSpace and break down the working space
			for (let otherSpace of spacesQueue) {
				console.log('otherSpace', otherSpace)
				// create the new space that might result from the overlap
				// between working and other space
				// if it has arcs it will end up in the nextQueue.
				let newSpace = new Space();
				// check both the inner and outer arcs of the other space for overlaps
				for (let otherInnerArc of otherSpace.innerArcs) {

					// The list of arcs is going to change throughout this loop
					let newWorkingSpaceInnerArcs = [];
					let newWorkingSpaceOuterArcs = [];

					for (let workingInnerArc of workingSpace.innerArcs) {
						console.log('other inner & working inner')
						let workingArcPieces = workingInnerArc.break(otherInnerArc);
						console.log('broken workingArcPieces', workingArcPieces);
						// arcPieces has 1, 2, or 3 pieces in it
						for (let workingArcPiece of workingArcPieces) {
							// If the arc piece is contained in the other arc's circle,
							// then it belongs to the new space.
							// Otherwise it belongs to the working space
							let workingArcPieceMidpoint = workingArcPiece.midpoint;
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
							let otherArcPieceMidpoint = otherArcPiece.midpoint;
							if (workingInnerArc.circle.containsPoint(otherArcPieceMidpoint)) {
								newSpace.innerArcs.push(otherArcPiece);
								newWorkingSpaceOuterArcs.push(otherArcPiece);
							}
						}
					}

					for (let workingOuterArc of workingSpace.outerArcs) {
						console.log('other inner & working outer')
						let workingArcPieces = workingOuterArc.break(otherInnerArc);
						// arcPieces has 1, 2, or 3 pieces in it
						for (let workingArcPiece of workingArcPieces) {
							// If the arc piece is contained in the other arc's circle,
							// then it belongs to the new space.
							// Otherwise it belongs to the working space
							let workingArcPieceMidpoint = workingArcPiece.midpoint;
							if (otherInnerArc.circle.containsPoint(workingArcPieceMidpoint)) {
								// this arc piece belongs to the new space
								newSpace.outerArcs.push(workingArcPiece);
							} else {
								newWorkingSpaceOuterArcs.push(workingArcPiece);
							}
						}

						let otherArcPieces = otherInnerArc.break(workingOuterArc);
						for (let otherArcPiece of otherArcPieces) {
							let otherArcPieceMidpoint = otherArcPiece.midpoint;
							if (!workingOuterArc.circle.containsPoint(otherArcPieceMidpoint)) {
								newSpace.innerArcs.push(otherArcPiece);
								// is this always right?? // TODO(alex): think about this
								newWorkingSpaceOuterArcs.push(otherArcPiece);
							}
						}

					}
					workingSpace.innerArcs = newWorkingSpaceInnerArcs;
					workingSpace.outerArcs = newWorkingSpaceOuterArcs;
				}

				// We are now looking at the OUTTER arcs of the other space
				for (let otherOuterArc of otherSpace.outerArcs) {

					// The list of arcs is going to change throughout this loop
					let newWorkingSpaceInnerArcs = [];
					let newWorkingSpaceOuterArcs = [];

					for (let workingInnerArc of workingSpace.innerArcs) {
						console.log('other outer & working inner')

						let workingArcPieces = workingInnerArc.break(otherOuterArc);
						// arcPieces has 1, 2, or 3 pieces in it
						for (let workingArcPiece of workingArcPieces) {
							// If the arc piece is contained in the other arc's circle,
							// then it belongs to the new space.
							// Otherwise it belongs to the working space
							let workingArcPieceMidpoint = workingArcPiece.midpoint;
							if (otherOuterArc.circle.containsPoint(workingArcPieceMidpoint)) {
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
								newWorkingSpaceOuterArcs.push(otherArcPiece);
							}
						}
					}

					for (let workingOuterArc of workingSpace.outerArcs) {
						console.log('other outer & working outer')
						let workingArcPieces = workingOuterArc.break(otherOuterArc);
						// arcPieces has 1, 2, or 3 pieces in it
						for (let workingArcPiece of workingArcPieces) {
							// If the arc piece is contained in the other arc's circle,
							// then it belongs to the new space.
							// Otherwise it belongs to the working space
							let workingArcPieceMidpoint = workingArcPiece.midpoint;
							if (otherOuterArc.circle.containsPoint(workingArcPieceMidpoint)) {
								newWorkingSpaceOuterArcs.push(workingArcPiece);
							} else {
								newSpace.outerArcs.push(workingArcPiece);
							}
						}

						let otherArcPieces = otherOuterArc.break(workingOuterArc);
						for (let otherArcPiece of otherArcPieces) {
							alert('figure me out!')
							let otherArcPieceMidpoint = otherArcPiece.midpoint;
							if (!workingOuterArc.circle.containsPoint(otherArcPieceMidpoint)) {
								newSpace.outerArcs.push(otherArcPiece);
								// TODO(alex): figure this out
								newWorkingSpaceInnerArcs.push(otherArcPiece);
							}
						}

					}
					workingSpace.innerArcs = newWorkingSpaceInnerArcs;
					workingSpace.outerArcs = newWorkingSpaceOuterArcs;
				}
				// Check if the space is already in the nextQueue, spacesQueue
				if (!newSpace.isEmpty && !newSpace.isInArray(nextQueue) && !newSpace.isInArray(spacesQueue)) {
					nextQueue.push(newSpace);
				}
			}

			if (!workingSpace.isInArray(foundSpaces)) {
				foundSpaces.push(workingSpace);
			}

			// spacesQueue = spacesQueue.concat(nextQueue);
		}

		return foundSpaces;
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
