let points = []; // Array to store point information
let numPoints = 3000; // Number of points to draw
let goldenAngle = 137.5; // The golden angle in degrees
let distanceIncrement = 0.1; // Start with minimum distance
let shapeSize = 5; // Size of each square
let centerX, centerY; // Center of the canvas
let angularOffset = 0; // Initial angular offset in degrees
let useSquares = true; // Draw squares instead of points
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

function setup() {
  let cnv = createCanvas(600, 600);
  centerX = width / 2;
  centerY = height / 2;

  // Set color mode to HSB for easier color manipulation
  colorMode(HSB, 360, 100, 100, 100);

  // Set initial background
  background(220, 10, 10);

  // Enable animation by default
  loop();

  // Add mouse click handler specifically for the canvas
  cnv.mousePressed(toggleAnimation);

  // Create slider controls
  createP('Number of Shapes:');
  let pointsSlider = createSlider(100, 5000, numPoints, 100);
  pointsSlider.input(() => {
    numPoints = pointsSlider.value();
  });

  createP('Shape Size:');
  let sizeSlider = createSlider(1, 60, shapeSize, 1);
  sizeSlider.input(() => {
    shapeSize = sizeSlider.value();
  });

  createP('Rotation Speed:');
  let rotationSlider = createSlider(0, 2, rotationSpeed, 0.1);
  rotationSlider.input(() => {
    rotationSpeed = rotationSlider.value();
  });

  createP('Hue Speed:');
  let hueSlider = createSlider(0, 5, hueSpeed, 0.1);
  hueSlider.input(() => {
    hueSpeed = hueSlider.value();
  });

  // Add hue range slider
  createP('Color Range:');
  let hueRangeSlider = createSlider(0, 180, hueRange, 5);
  hueRangeSlider.input(() => {
    hueRange = hueRangeSlider.value();
  });

  // Add a toggle for shapes
  createP('Shape Type:');
  let shapeToggle = createButton(useSquares ? 'Switch to Circles' : 'Switch to Squares');
  shapeToggle.mousePressed(() => {
    useSquares = !useSquares;
    shapeToggle.html(useSquares ? 'Switch to Circles' : 'Switch to Squares');
  });

  // Add a toggle for drawing style
  createP('Drawing Style:');
  let styleToggle = createButton('Switch Style');
  styleToggle.mousePressed(() => {
    if (drawStyle === 'filled') {
      drawStyle = 'outline';
      styleToggle.html('Switch to Both');
    } else if (drawStyle === 'outline') {
      drawStyle = 'both';
      styleToggle.html('Switch to Filled');
    } else {
      drawStyle = 'filled';
      styleToggle.html('Switch to Outline');
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
  let shapeType = useSquares ? "Squares" : "Circles";
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
    // Apply the angular offset to the starting position
    let angle = radians(angularOffset + i * goldenAngle);

    // Calculate x and y position
    let x = centerX + cos(angle) * distance;
    let y = centerY + sin(angle) * distance;

    // Store the point information
    points.push({
      x: x,
      y: y,
      index: i
    });
  }
}

function drawShapes() {
  for (let i = 0; i < points.length; i++) {
    let p = points[i];

    // Radial gradient - color based on distance from center
    let distFromCenter = dist(p.x, p.y, centerX, centerY);
    let hue = (hueOffset + map(distFromCenter, 0, width / 2, 0, hueRange)) % 360;
    let saturation = 90;
    let brightness = 100;
    let fillAlpha = 10;
    let strokeAlpha = 30; // Higher alpha for outline

    // Set fill and stroke based on drawing style
    if (drawStyle === 'filled' || drawStyle === 'both') {
      fill(hue, saturation, brightness, fillAlpha);
    } else {
      noFill();
    }

    if (drawStyle === 'outline' || drawStyle === 'both') {
      stroke(hue, saturation, brightness, strokeAlpha);
      strokeWeight(1);
    } else {
      noStroke();
    }

    if (useSquares) {
      // Draw rotating square
      push(); // Save the current drawing state
      translate(p.x, p.y);
      let individualRotation = radians(squareRotationOffset + i * (360 / numPoints) * 0.5);
      rotate(individualRotation);
      rectMode(CENTER);
      rect(0, 0, shapeSize, shapeSize);
      pop(); // Restore the drawing state
    } else {
      // Draw circle
      ellipse(p.x, p.y, shapeSize, shapeSize);
    }
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
