
// Ew global things.  Fix this.
let picture;
let circleCenter, circleRadius;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  colorMode(HSB, 255);
  ellipseMode(CENTER);

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

	let translation = createVector(0, 200);
	let hue = 0;
	for (let subPic of picture.subPictures) {
		for (let space of subPic.spaces) {
			stroke(color((hue+=15)%255, 255, 255));
			space.draw(translation);
		}
	}
}
