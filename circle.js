
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

	containsPoint(point) {
		let d =  this.center.dist(point)
		if (d == this.radius) {
			console.warn("Point lies on circle!", circle, point);
		}
		return d < this.radius;
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
