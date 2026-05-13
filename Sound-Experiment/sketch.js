let mic;
let fft;
let peaks;
let currentEffect = 1;
let noiseOffset = 0;
let stars = [];
const NUM_STARS = 200;

function setup() {
  createCanvas(400, 400);
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
  peaks = new Array(width).fill(0);
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push(newStar(true));
  }
}

function newStar(randomZ) {
  return {
    x: random(-width / 2, width / 2),
    y: random(-height / 2, height / 2),
    z: randomZ ? random(0, width) : width,
    pz: 0
  };
}

function mousePressed() {
  userStartAudio();
}

function keyPressed() {
  if (key === '1') currentEffect = 1;
  if (key === '2') currentEffect = 2;
  if (key === '3') currentEffect = 3;
  if (key === '4') currentEffect = 4;
}

function draw() {
  let wave = fft.waveform();
  let spectrum = fft.analyze();
  let vol = mic.getLevel();

  for (let i = 0; i < width; i++) {
    peaks[i] = wave[floor(map(i, 0, width, 0, wave.length))];
  }

  if (currentEffect === 1) drawNoiseBlob(vol, spectrum);
  if (currentEffect === 2) drawLiquidWave(wave, vol);
  if (currentEffect === 3) drawBreathingRings(spectrum, vol);
  if (currentEffect === 4) drawStarfield(wave, vol, spectrum);

  drawLabel();
}

function drawNoiseBlob(vol, spectrum) {
  background(10, 10, 30, 40);

  let cx = width / 2;
  let cy = height / 2;

  noiseOffset += 0.005;

  let blobColors = [
    [100, 50, 200],
    [50, 150, 220],
    [180, 80, 255]
  ];

  for (let b = 0; b < 3; b++) {
    let radius = 80 + b * 25 + vol * 80;
    let points = 80;

    fill(blobColors[b][0], blobColors[b][1], blobColors[b][2], 60);
    noStroke();

    beginShape();
    for (let i = 0; i < points; i++) {
      let a = map(i, 0, points, 0, TWO_PI);

      let n = noise(
        cos(a) * 0.8 + noiseOffset + b * 2,
        sin(a) * 0.8 + noiseOffset + b * 2
      );

      let r = radius + map(n, 0, 1, -40, 40);

      let specIdx = floor(map(i, 0, points, 0, spectrum.length * 0.3));
      r += map(spectrum[specIdx], 0, 255, 0, 30);

      curveVertex(cx + cos(a) * r, cy + sin(a) * r);
    }
    endShape(CLOSE);
  }

  fill(200, 150, 255, 180);
  noStroke();
  ellipse(cx, cy, 20 + vol * 60, 20 + vol * 60);
}

function drawLiquidWave(wave, vol) {
  background(0, 20, 40);

  let layers = [
    { yPos: 0.4, col: [0, 60, 120], speed: 0.3, amp: 0.6 },
    { yPos: 0.5, col: [0, 100, 160], speed: 0.5, amp: 0.8 },
    { yPos: 0.6, col: [0, 150, 200], speed: 0.7, amp: 1.0 },
    { yPos: 0.7, col: [100, 220, 255], speed: 1.0, amp: 1.2 }
  ];

  for (let l = 0; l < layers.length; l++) {
    let layer = layers[l];
    let baseY = height * layer.yPos;

    fill(layer.col[0], layer.col[1], layer.col[2], 180);
    noStroke();

    beginShape();
    vertex(0, height);

    for (let i = 0; i < wave.length; i++) {
      let x = map(i, 0, wave.length, 0, width);
      let slowWave = sin(i * 0.05 + frameCount * 0.02 * layer.speed) * 15;
      let audioWave = wave[i] * 60 * layer.amp * (vol * 5 + 0.3);
      let y = baseY + slowWave + audioWave;
      vertex(x, y);
    }

    vertex(width, height);
    endShape(CLOSE);
  }

  stroke(200, 240, 255, 40);
  strokeWeight(1);
  noFill();
  beginShape();
  for (let i = 0; i < wave.length; i++) {
    let x = map(i, 0, wave.length, 0, width);
    let slowWave = sin(i * 0.05 + frameCount * 0.02) * 15;
    let audioWave = wave[i] * 60 * (vol * 5 + 0.3);
    let y = height * 0.7 + slowWave + audioWave;
    vertex(x, y);
  }
  endShape();
}

function drawBreathingRings(spectrum, vol) {
  background(0, 15);

  let cx = width / 2;
  let cy = height / 2;
  let numRings = 12;

  for (let i = numRings; i >= 0; i--) {
    let specIdx = floor(map(i, 0, numRings, 0, spectrum.length * 0.5));
    let specVal = map(spectrum[specIdx], 0, 255, 0, 1);

    let baseRadius = i * 16;
    let breathe = sin(frameCount * 0.03 + i * 0.5) * 10;
    let audioRadius = specVal * 20;
    let r = baseRadius + breathe + audioRadius;

    let red = map(i, 0, numRings, 200, 20);
    let green = map(i, 0, numRings, 50, 150);
    let blue = map(i, 0, numRings, 220, 255);
    let alpha = map(i, 0, numRings, 200, 40);

    noFill();
    stroke(red, green, blue, alpha);
    strokeWeight(map(specVal, 0, 1, 1, 4));
    ellipse(cx, cy, r * 2, r * 2);
  }

  noStroke();
  fill(200, 100, 255, map(vol, 0, 1, 50, 200));
  ellipse(cx, cy, 20 + vol * 40, 20 + vol * 40);
}

function drawStarfield(wave, vol, spectrum) {
  background(0, 0, 10);

  let cx = width / 2;
  let cy = height / 2;
  let speed = map(vol, 0, 1, 2, 22);

  let bass = map(spectrum[2], 0, 255, 0, 1);
  let mid  = map(spectrum[10], 0, 255, 0, 1);

  noStroke();
  for (let r = 80; r > 0; r -= 10) {
    let alpha = map(r, 0, 80, 60, 0) * (bass * 0.7 + 0.3);
    fill(80 + bass * 80, 30 + mid * 60, 180 + bass * 70, alpha);
    ellipse(cx, cy, r * 2.5, r * 1.8);
  }

  translate(cx, cy);

  for (let i = 0; i < stars.length; i++) {
    let s = stars[i];
    s.pz = s.z;
    s.z -= speed;

    if (s.z <= 0) {
      stars[i] = newStar(false);
      continue;
    }

    let sx = map(s.x / s.z, 0, 1, 0, cx);
    let sy = map(s.y / s.z, 0, 1, 0, cy);
    let px = map(s.x / s.pz, 0, 1, 0, cx);
    let py = map(s.y / s.pz, 0, 1, 0, cy);

    let size = map(s.z, 0, width, 3, 0);
    let brightness = map(s.z, 0, width, 255, 80);

    let idx = floor(map(i, 0, NUM_STARS, 0, spectrum.length * 0.4));
    let specVal = map(spectrum[idx], 0, 255, 0, 1);
    let r = 180 + specVal * 75;
    let g = 180 + specVal * 50;
    let b = 255;

    stroke(r, g, b, brightness);
    strokeWeight(size);
    line(px, py, sx, sy);

    noStroke();
    fill(r, g, b, brightness);
    ellipse(sx, sy, size * 1.4, size * 1.4);
  }

  // Audio reactive shockwave ring on loud hits
  if (vol > 0.05) {
    noFill();
    let ringAlpha = map(vol, 0.05, 0.5, 20, 160);
    let ringSize = map(vol, 0.05, 0.5, 20, 160);
    stroke(160, 120, 255, ringAlpha);
    strokeWeight(1.5);
    ellipse(0, 0, ringSize * 2, ringSize * 2);
    stroke(100, 180, 255, ringAlpha * 0.5);
    ellipse(0, 0, ringSize * 2.8, ringSize * 2.8);
  }

  resetMatrix();
}

function drawLabel() {
  let labels = ['', 'Noise Blob', 'Liquid Wave', 'Breathing Rings', 'Starfield'];
  fill(255, 150);
  noStroke();
  textSize(12);
  textAlign(LEFT);
  text('Effect ' + currentEffect + ': ' + labels[currentEffect], 10, 20);
  text('Press 1-4 to switch', 10, 35);
}