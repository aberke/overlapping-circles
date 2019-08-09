
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
		return ((this.innerArcs.length == 0) && (this.outerArcs.length == 0));
	}

	isSameArc(otherArc) {
		if (!this.circle.isSameCircle(otherArc.circle))
			return false;
		
		let allowance = 0.0000001 * Math.PI;
		
		return ((Math.abs(this.endpoints[0] - otherArc.endpoints[0]) < allowance) 
			&&  (Math.abs(this.endpoints[1] - otherArc.endpoints[1]) < allowance))
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

	get midangle() {
		let a0 = this.angleRange[0];
		let a1 = this.angleRange[1];

		if (a1 < a0) {
			a1 = a1 - 2 * Math.PI;
		}

		return (a0 + a1) / 2;
	}

	get midpoint() {
		return this.angleToPoint(this.midangle);
	}

	getIntersections(otherArc) {
		return this.circle.intersections(otherArc.circle);
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
		console.log('BREAK');
		console.log(this, otherArc)
		// Break this arc apart by the otherArc iff the otherArc intersects this arc
		let intersections = this.getIntersections(otherArc);
		console.log('inter', intersections);
		if (intersections.length == 1 || intersections.length > 2) {
			console.error('Broken function!!');
		}
		if (intersections.length == 0)
			return [this];

		let intersection0 = intersections[0];
		let intersection1 = intersections[1];
		let angle0 = this.pointToAngle(intersection0);
		let angle1 = this.pointToAngle(intersection1);

		console.log('angles', angle0, angle1)
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
			if ((greaterAngle > this.angleRange[0]) && (lesserAngle <= this.angleRange[0])) {
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

	draw(translation) {
		let diam = this.circle.radius;
		arc(this.circle.center.x + translation.x, this.circle.center.y + translation.y, diam, diam, this.angleRange[0], this.angleRange[1]);
	}
}
