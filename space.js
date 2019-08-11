
class Space {
	/*
	innerArcs :[]
	outerArcs: []
	*/
	constructor(innerArcs=[], outerArcs=[]) {
		this.innerArcs = innerArcs;
		this.outerArcs = outerArcs;
	}
	get overlapNum() {
		return innerArcs.length;
	}

	isSameSpace(otherSpace) {
		for (let arc of this.innerArcs) {
			for (let otherArc of otherSpace.innerArcs) {
				if (!arc.isSameArc(otherArc)) {
					return false;
				}
			}
		}
		for (let arc of this.outerArcs) {
			for (let otherArc of otherSpace.outerArcs) {
				if (!arc.isSameArc(otherArc)) {
					return false;
				}
			}
		}
		return true;
	}

	draw(translation, scale) {
		for (let a of this.innerArcs) {
			a.draw(translation, scale)
		}
		for (let a of this.outerArcs) {
			console.log('drawing arc', a)
			a.draw(translation, scale);
		}
	}

	isInArray(array) {
		for(let s of array) {
			if (this.isSameSpace(s)) {
				return true;
			}
		}
		return false;
	}
}
