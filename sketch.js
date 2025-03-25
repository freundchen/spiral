let points = []; // Array to store point information
let numPoints = 3000; // Number of points to draw
let goldenAngle = 137.5; // The golden angle in degrees
let distanceIncrement = 0.1; // Start with minimum distance
let shapeSize = 5; // Size of each square
let centerX, centerY; // Center of the canvas
let angularOffset = 0; // Initial angular offset in degrees
let shapeType = 'square'; // Can be 'square', 'circle', or 'triangle'
let drawStyle = 'filled'; // Can be 'filled', 'outline', or 'both'

// Animation variables
let isAnimating = true;
let animationSpeed = 0.01;
let minDistance = 0.1;
let maxDistance = 1.0;
let animationDirection = 1;

// Rotation variables
let rotationSpeed = 0.2; // Degrees per frame
let squareRotationOffset = 0; // Additional rotation for squares

// Color variables
let hueOffset = 0;
let hueSpeed = 0.1;
let hueRange = 60; // Controls how much the hue varies with distance (default 60 degrees)

// Base Shape class
class Shape {
  constructor(x, y, size, hue, saturation, brightness, fillAlpha, strokeAlpha) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.hue = hue;
    this.saturation = saturation;
    this.brightness = brightness;
    this.fillAlpha = fillAlpha;
    this.strokeAlpha = strokeAlpha;
  }

  setStyle(drawStyle) {
    if (drawStyle === 'filled' || drawStyle === 'both') {
      fill(this.hue, this.saturation, this.brightness, this.fillAlpha);
    } else {
      noFill();
    }

    if (drawStyle === 'outline' || drawStyle === 'both') {
      stroke(this.hue, this.saturation, this.brightness, this.strokeAlpha);
      strokeWeight(1);
    } else {
      noStroke();
    }
  }

  draw(drawStyle) {
    this.setStyle(drawStyle);
    this._drawShape();
  }

  _drawShape() {
    // To be implemented by subclasses
  }
}

class Square extends Shape {
  constructor(x, y, size, hue, saturation, brightness, fillAlpha, strokeAlpha, rotation) {
    super(x, y, size, hue, saturation, brightness, fillAlpha, strokeAlpha);
    this.rotation = rotation;
  }

  _drawShape() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    rectMode(CENTER);
    rect(0, 0, this.size, this.size);
    pop();
  }
}

class Circle extends Shape {
  _drawShape() {
    ellipse(this.x, this.y, this.size, this.size);
  }
}

class Triangle extends Shape {
  _drawShape() {
    push();
    translate(this.x, this.y);
    beginShape();
    const r = this.size / 2;
    for (let i = 0; i < 3; i++) {
      let angle = TWO_PI * i / 3 - HALF_PI;
      vertex(cos(angle) * r, sin(angle) * r);
    }
    endShape(CLOSE);
    pop();
  }
}

function setup() {
  let cnv = createCanvas(600, 600);
  centerX = width / 2;
  centerY = height / 2;

  // Set color mode to HSB for easier color manipulation
  colorMode(HSB, 360, 100, 100, 100);
  background(220, 10, 10);
  loop();

  // Add mouse click handler specifically for the canvas
  cnv.mousePressed(toggleAnimation);

  // Create a container for all controls
  let controlsDiv = createDiv();
  controlsDiv.class('controls-container');

  // Helper function to create a control container
  function createControlGroup(title) {
    let group = createDiv();
    group.class('control-group');
    group.child(createP(title));
    return group;
  }

  // Shape Count Control
  let countGroup = createControlGroup('Number of Shapes');
  countGroup.parent(controlsDiv);
  let pointsSlider = createSlider(100, 5000, numPoints, 100);
  pointsSlider.parent(countGroup);
  pointsSlider.input(() => { numPoints = pointsSlider.value(); });

  // Shape Size Control
  let sizeGroup = createControlGroup('Shape Size');
  sizeGroup.parent(controlsDiv);
  let sizeSlider = createSlider(1, 60, shapeSize, 1);
  sizeSlider.parent(sizeGroup);
  sizeSlider.input(() => { shapeSize = sizeSlider.value(); });

  // Rotation Speed Control
  let rotationGroup = createControlGroup('Rotation Speed');
  rotationGroup.parent(controlsDiv);
  let rotationSlider = createSlider(0, 2, rotationSpeed, 0.1);
  rotationSlider.parent(rotationGroup);
  rotationSlider.input(() => { rotationSpeed = rotationSlider.value(); });

  // Hue Speed Control
  let hueSpeedGroup = createControlGroup('Hue Speed');
  hueSpeedGroup.parent(controlsDiv);
  let hueSlider = createSlider(0, 5, hueSpeed, 0.1);
  hueSlider.parent(hueSpeedGroup);
  hueSlider.input(() => { hueSpeed = hueSlider.value(); });

  // Color Range Control
  let hueRangeGroup = createControlGroup('Color Range');
  hueRangeGroup.parent(controlsDiv);
  let hueRangeSlider = createSlider(0, 180, hueRange, 5);
  hueRangeSlider.parent(hueRangeGroup);
  hueRangeSlider.input(() => { hueRange = hueRangeSlider.value(); });

  // Shape Type Control
  let shapeTypeGroup = createControlGroup('Shape Type');
  shapeTypeGroup.parent(controlsDiv);
  let shapeSelect = createSelect();
  shapeSelect.option('Square', 'square');
  shapeSelect.option('Circle', 'circle');
  shapeSelect.option('Triangle', 'triangle');
  shapeSelect.selected(shapeType);
  shapeSelect.parent(shapeTypeGroup);
  shapeSelect.changed(() => { shapeType = shapeSelect.value(); });

  // Drawing Style Control with radio buttons
  let styleGroup = createControlGroup('Drawing Style');
  styleGroup.parent(controlsDiv);

  let radioGroup = createDiv();
  radioGroup.class('radio-group');
  radioGroup.parent(styleGroup);

  // Helper function to create a radio button with label
  function createRadioOption(value, labelText) {
    let label = createElement('label');
    let radio = createElement('input');
    radio.attribute('type', 'radio');
    radio.attribute('name', 'drawStyle');
    radio.attribute('value', value);
    if (drawStyle === value) radio.attribute('checked', true);

    label.child(radio);
    label.html(labelText, true); // Append text after the radio button
    return label;
  }

  // Create and add all radio options
  radioGroup.child(createRadioOption('filled', 'Filled'));
  radioGroup.child(createRadioOption('outline', 'Outline'));
  radioGroup.child(createRadioOption('both', 'Both'));

  // Add change handler for radio buttons
  radioGroup.elt.addEventListener('change', (e) => {
    if (e.target.type === 'radio') {
      drawStyle = e.target.value;
    }
  });
}

function draw() {
  // Use a dark background with a hint of color
  background(220, 10, 10);

  // Update animation variables if animating
  if (isAnimating) {
    updateDistanceAnimation();
    // Update rotation
    angularOffset = (angularOffset + rotationSpeed) % 360;
    // Update square rotation
    squareRotationOffset = (squareRotationOffset + rotationSpeed * 2) % 360;
    // Update hue offset for color cycling
    hueOffset = (hueOffset + hueSpeed) % 360;
  }

  calculatePoints();
  drawShapes();

  // Display current values
  fill(0, 0, 100);
  noStroke();
  textSize(14);
  text(`Distance: ${distanceIncrement.toFixed(3)} | Shapes: ${numPoints} | Type: ${shapeType}`, 10, height - 10);
  text(`Click canvas to toggle animation`, 10, height - 30);
}

function updateDistanceAnimation() {
  // Better proportional speed algorithm
  // Use a logarithmic or quadratic scale to ensure more uniform perceived speed
  let normalizedPosition = (distanceIncrement - minDistance) / (maxDistance - minDistance); // 0 to 1

  // Make animation slower when distance is small, faster when distance is large
  // Using a quadratic equation to create more uniform perceived change
  let speedFactor = 0.4 + 0.6 * normalizedPosition * normalizedPosition;
  let adjustedSpeed = animationSpeed * speedFactor * 2.5;

  // Update distance increment based on animation direction
  distanceIncrement += adjustedSpeed * animationDirection;

  // Reverse direction when reaching min or max
  if (distanceIncrement >= maxDistance) {
    distanceIncrement = maxDistance;
    animationDirection = -1;
  } else if (distanceIncrement <= minDistance) {
    distanceIncrement = minDistance;
    animationDirection = 1;
  }
}

function calculatePoints() {
  points = [];

  for (let i = 0; i < numPoints; i++) {
    // Calculate the distance from center (increases with each point)
    let distance = i * distanceIncrement;

    // Calculate the angle in radians (converting from degrees)
    let angle = radians(angularOffset + i * goldenAngle);

    // Calculate x and y position
    let x = centerX + cos(angle) * distance;
    let y = centerY + sin(angle) * distance;

    // Calculate color values
    let distFromCenter = dist(x, y, centerX, centerY);
    let hue = (hueOffset + map(distFromCenter, 0, width / 2, 0, hueRange)) % 360;
    let saturation = 90;
    let brightness = 100;
    let fillAlpha = 10;
    let strokeAlpha = 30;

    // Create the appropriate shape object based on shapeType
    let shape;
    let rotation = radians(squareRotationOffset + i * (360 / numPoints) * 0.5);

    switch (shapeType) {
      case 'square':
        shape = new Square(x, y, shapeSize, hue, saturation, brightness, fillAlpha, strokeAlpha, rotation);
        break;
      case 'circle':
        shape = new Circle(x, y, shapeSize, hue, saturation, brightness, fillAlpha, strokeAlpha);
        break;
      case 'triangle':
        shape = new Triangle(x, y, shapeSize, hue, saturation, brightness, fillAlpha, strokeAlpha);
        break;
    }

    points.push(shape);
  }
}

function drawShapes() {
  for (let shape of points) {
    shape.draw(drawStyle);
  }
}

// Function to toggle animation state
function toggleAnimation() {
  isAnimating = !isAnimating;
  if (isAnimating) {
    loop();
  } else {
    noLoop();
  }
}
