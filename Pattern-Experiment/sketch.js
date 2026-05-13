const redPalette = [
  [12,  2,   2  ],
  [60,  8,   8  ],
  [130, 20,  20 ],
  [200, 50,  40 ],
  [240, 120, 90 ],
  [255, 200, 160],
];

let rings, numBlobs, numSpirals, numFoci,
    bgR, bgG, bgB, centerX, centerY,
    useGrid, useWaves, useWeb,
    ringScale, spiralTwistRange, blobScale, sparkCount,
    numArcs, useArcs, useCracks, numCracks;

function setup() {
  let canv = createCanvas(windowWidth, windowHeight);
  canv.mousePressed(drawSketch);
  drawSketch();
}

function randomiseParams() {
  bgR = floor(random(0, 18));
  bgG = floor(random(0, 4));
  bgB = floor(random(0, 4));

  centerX = random(width * 0.2, width * 0.8);
  centerY = random(height * 0.2, height * 0.8);

  rings        = floor(random(0, 28));
  numBlobs     = 0;
  numSpirals   = floor(random(0, 10));
  numFoci      = floor(random(1, 6));
  sparkCount   = floor(random(0, 400));
  numArcs      = floor(random(0, 20));
  numCracks    = floor(random(0, 12));

  ringScale        = random(0.2, 0.9);
  spiralTwistRange = [random(0.3, 2), random(2, 8)];
  blobScale        = random(0.05, 0.55);

  useGrid    = random() < 0.25;
  useWaves   = random() < 0.4;
  useWeb     = random() < 0.35;
  useArcs    = random() < 0.45;
  useCracks  = random() < 0.3;
}

function drawSketch() {
  randomiseParams();
  background(bgR, bgG, bgB);

  if (useWaves) drawWaves();
  if (useGrid)  drawGrid();

  for (let i = 0; i < numBlobs; i++) {
    let bx = random() < 0.3 ? centerX + random(-80, 80) : random(width  * 0.05, width  * 0.95);
    let by = random() < 0.3 ? centerY + random(-80, 80) : random(height * 0.05, height * 0.95);
    drawBlob(bx, by,
      random(height * 0.02, height * blobScale),
      floor(random(2, 9)),
      floor(random(redPalette.length)),
      random(0.03, 0.22));
  }

  for (let i = 0; i < rings; i++) {
    let t    = i / rings;
    let r    = t * min(width, height) * ringScale + random(-20, 20);
    let offX = random() < 0.4 ? random(-width  * 0.3, width  * 0.3) : random(-6, 6);
    let offY = random() < 0.4 ? random(-height * 0.3, height * 0.3) : random(-6, 6);
    drawRing(
      centerX + offX,
      centerY + offY,
      r,
      random(0.3, 14),
      floor(random(redPalette.length)),
      random(0.05, 0.7)
    );
  }

  let foci = [];
  for (let i = 0; i < numFoci; i++) {
    foci.push([random(width * 0.05, width * 0.95), random(height * 0.05, height * 0.95)]);
  }
  if (random() < 0.5) foci.push([centerX, centerY]);
  for (let f of foci) {
    drawRadialLines(
      f[0], f[1],
      floor(random(4, 80)),
      random(0, 30),
      random(height * 0.04, height * 0.7),
      floor(random(redPalette.length)),
      random(0.04, 0.35)
    );
  }

  for (let i = 0; i < numSpirals; i++) {
    let sx = random() < 0.25 ? centerX + random(-60, 60) : random(width  * 0.05, width  * 0.95);
    let sy = random() < 0.25 ? centerY + random(-60, 60) : random(height * 0.05, height * 0.95);
    drawSpiral(sx, sy,
      floor(random(1, 8)),
      random(height * 0.02, height * 0.45),
      random(spiralTwistRange[0], spiralTwistRange[1]),
      floor(random(redPalette.length)),
      random(0.08, 0.55));
  }

  if (useArcs) {
    for (let i = 0; i < numArcs; i++) {
      drawArc(
        random(width  * 0.05, width  * 0.95),
        random(height * 0.05, height * 0.95),
        random(20, min(width, height) * 0.6),
        floor(random(redPalette.length)),
        random(0.1, 0.6)
      );
    }
  }

  if (useCracks) {
    for (let i = 0; i < numCracks; i++) {
      drawCrack(
        random(width),
        random(height),
        random(TWO_PI),
        floor(random(3, 8)),
        floor(random(redPalette.length)),
        random(0.15, 0.55)
      );
    }
  }

  if (useWeb) drawWeb(centerX, centerY);

  drawSparks();
  drawBloom();
}

function drawWaves() {
  let waveCount = floor(random(4, 20));
  let amp   = random(height * 0.02, height * 0.25);
  let freq  = random(0.003, 0.025);
  let phase = random(TWO_PI);
  noFill();
  for (let w = 0; w < waveCount; w++) {
    let [rv, g, b] = redPalette[floor(random(redPalette.length))];
    stroke(rv, g, b, random(15, 80));
    strokeWeight(random(0.3, 3));
    let yBase = random(height);
    beginShape();
    for (let x = 0; x <= width; x += 4) {
      curveVertex(x, yBase + sin(x * freq + phase + w * 0.6) * amp);
    }
    endShape();
  }
}

function drawGrid() {
  let step = floor(random(20, 120));
  let [rv, g, b] = redPalette[floor(random(redPalette.length))];
  stroke(rv, g, b, random(10, 50));
  strokeWeight(random(0.2, 1));
  for (let x = 0; x < width;  x += step) line(x, 0, x, height);
  for (let y = 0; y < height; y += step) line(0, y, width, y);
}

function drawArc(cx, cy, r, palIdx, alpha) {
  let [rv, g, b] = redPalette[palIdx % redPalette.length];
  stroke(rv, g, b, alpha * 255);
  strokeWeight(random(0.5, 6));
  noFill();
  let startA = random(TWO_PI);
  arc(cx, cy, r * 2, r * 2 * random(0.4, 2.5), startA, startA + random(0.3, TWO_PI));
}

function drawCrack(x, y, angle, depth, palIdx, alpha) {
  if (depth <= 0) return;
  let len = random(20, height * 0.15);
  let nx  = x + cos(angle) * len;
  let ny  = y + sin(angle) * len;
  let [rv, g, b] = redPalette[palIdx % redPalette.length];
  stroke(rv, g, b, alpha * 255);
  strokeWeight(map(depth, 0, 8, 0.3, 2.5));
  noFill();
  line(x, y, nx, ny);
  let branches = floor(random(1, 4));
  for (let i = 0; i < branches; i++) {
    drawCrack(nx, ny, angle + random(-1.1, 1.1), depth - 1, palIdx, alpha * 0.75);
  }
}

function drawWeb(cx, cy) {
  let spokes = floor(random(5, 20));
  let layers = floor(random(3, 10));
  let maxR   = min(width, height) * random(0.15, 0.5);
  let [rv, g, b] = redPalette[floor(random(redPalette.length))];
  stroke(rv, g, b, random(0.08, 0.3) * 255);
  noFill();

  let pts = [];
  for (let s = 0; s < spokes; s++) {
    let a  = (s / spokes) * TWO_PI + random(0.2);
    let rr = maxR + random(-20, 20);
    pts.push([cx + cos(a) * rr, cy + sin(a) * rr]);
    strokeWeight(random(0.3, 1.2));
    line(cx, cy, pts[s][0], pts[s][1]);
  }

  for (let l = 1; l <= layers; l++) {
    let t = l / layers;
    beginShape();
    for (let s = 0; s < spokes; s++) {
      curveVertex(
        cx + (pts[s][0] - cx) * t + random(-6, 6),
        cy + (pts[s][1] - cy) * t + random(-6, 6)
      );
    }
    curveVertex(cx + (pts[0][0] - cx) * t, cy + (pts[0][1] - cy) * t);
    endShape(CLOSE);
  }
}

function drawSparks() {
  noStroke();
  for (let i = 0; i < sparkCount; i++) {
    let palIdx = random() < 0.25 ? 5 : floor(random(2, redPalette.length));
    let [rv, g, b] = redPalette[palIdx];
    fill(rv, g, b, random(60, 240));
    ellipse(random(width), random(height), random(0.5, 5));
  }
}

function drawBloom() {
  let bx   = random() < 0.5 ? centerX : random(width  * 0.1, width  * 0.9);
  let by   = random() < 0.5 ? centerY : random(height * 0.1, height * 0.9);
  let maxR = random(height * 0.05, height * 0.4);
  noStroke();
  for (let i = 30; i > 0; i--) {
    let t = i / 30;
    fill(random(200, 255), random(30, 100), random(20, 60), map(t, 0, 1, random(40, 90), 0));
    ellipse(bx, by, t * maxR * 2);
  }
}

function drawBlob(cx, cy, r, wobble, colIdx, alpha) {
  let [rv, g, b] = redPalette[colIdx % redPalette.length];
  fill(rv, g, b, alpha * 255);
  noStroke();
  beginShape();
  let pts = 80;
  for (let i = 0; i <= pts; i++) {
    let a  = (i / pts) * TWO_PI;
    let rr = r + sin(a * wobble + random(PI)) * r * 0.45;
    curveVertex(cx + cos(a) * rr, cy + sin(a) * rr);
  }
  endShape(CLOSE);
}

function drawRing(cx, cy, r, thickness, colIdx, alpha) {
  let [rv, g, b] = redPalette[colIdx % redPalette.length];
  stroke(rv, g, b, alpha * 255);
  strokeWeight(thickness);
  noFill();
  if (random() < 0.3) {
    let startA = random(TWO_PI);
    arc(cx, cy, r * 2, r * 2, startA, startA + random(0.5, TWO_PI));
  } else {
    ellipse(cx, cy, r * 2, r * 2 * random(0.5, 2));
  }
}

function drawRadialLines(cx, cy, count, minR, maxR, colIdx, alpha) {
  let [rv, g, b] = redPalette[colIdx % redPalette.length];
  stroke(rv, g, b, alpha * 255);
  noFill();
  for (let i = 0; i < count; i++) {
    let a  = (i / count) * TWO_PI + random(0.4);
    let r1 = minR + random(10);
    let r2 = random(minR + 5, maxR);
    strokeWeight(random(0.2, 2.5));
    line(
      cx + cos(a) * r1, cy + sin(a) * r1,
      cx + cos(a) * r2, cy + sin(a) * r2
    );
  }
}

function drawSpiral(cx, cy, arms, maxR, twist, palIdx, alpha) {
  let [rv, g, b] = redPalette[palIdx % redPalette.length];
  stroke(rv, g, b, alpha * 255);
  noFill();
  let steps = 220;
  for (let arm = 0; arm < arms; arm++) {
    let angleOffset = (arm / arms) * TWO_PI + random(0.5);
    strokeWeight(random(0.3, 3));
    beginShape();
    for (let s = 0; s <= steps; s++) {
      let t     = s / steps;
      let r     = t * maxR;
      let angle = angleOffset + t * twist * TWO_PI;
      curveVertex(cx + cos(angle) * r, cy + sin(angle) * r);
    }
    endShape();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawSketch();
}