var FORCE_RADIUS = 140;
var NUM_COLS = 17;
var NUM_ROWS = 10;
var MODE = 1;
var SYMBOLS = ['☀','☾','☁','☄','⚡','❖','✿','☘','♠','♣','♥','♦','☯','⚙'];
var particles = [];
var t = 0;23
var trail = [];
var moonSwarm = [];
var NUM_MOONS = 22;

class Particle {
  constructor(sx, sy) {
    this.ox = sx; this.oy = sy;
    this.x = sx; this.y = sy;
    this.vx = 0; this.vy = 0;
    this.symbol = random(SYMBOLS);
    this.size = random(13, 21);
    this.hue = random(360);
    this.angle = 0;
    this.phase = random(TWO_PI);
    this.waveAmp = random(18, 40);
    this.waveFreq = random(0.008, 0.018);
    this.waveSpeed = random(0.6, 1.4);
  }
  reset() {
    this.x = this.ox; this.y = this.oy;
    this.vx = 0; this.vy = 0; this.angle = 0;
    this.symbol = random(SYMBOLS);
  }
  update() {
    this.phase += 0.012 * this.waveSpeed;

    var waveX = this.ox + sin(this.phase + this.ox * this.waveFreq) * this.waveAmp;
    var waveY = this.oy + cos(this.phase * 0.7 + this.oy * this.waveFreq) * this.waveAmp * 0.7;

    var dx = this.x - mouseX;
    var dy = this.y - mouseY;
    var dist = sqrt(dx * dx + dy * dy);

    if (dist < FORCE_RADIUS && dist > 0) {
      var force = pow((FORCE_RADIUS - dist) / FORCE_RADIUS, 1.8) * 11;
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;
    }

    this.vx += (waveX - this.x) * 0.04;
    this.vy += (waveY - this.y) * 0.04;
    this.vx *= 0.80;
    this.vy *= 0.80;
    this.x += this.vx;
    this.y += this.vy;

    this.angle = sin(this.phase) * 0.35 + atan2(this.vy, this.vx) * 0.25;
  }
  display() {
    var dx = this.x - mouseX;
    var dy = this.y - mouseY;
    var dist = sqrt(dx * dx + dy * dy);
    var prox = constrain(1 - dist / FORCE_RADIUS, 0, 1);

    push();
    translate(this.x, this.y);
    rotate(this.angle);
    textAlign(CENTER, CENTER);
    noStroke();
    var sz = this.size + prox * 10;
    textSize(sz);

    var moved = abs(this.x - this.ox) + abs(this.y - this.oy);
    var bright = int(55 + min(moved * 3.5, 140));
    var hshift = (this.ox * 0.5 + t * 18 + prox * 120) % 360;
    var sat = 30 + prox * 65;
    fill(hshift, sat, bright);
    text(this.symbol, 0, 0);
    pop();
  }
}

class Moon {
  constructor(i) {
    this.angle = (i / NUM_MOONS) * TWO_PI;
    this.radius = random(18, 55);
    this.speed = random(0.025, 0.06) * (random() > 0.5 ? 1 : -1);
    this.x = width/2; this.y = height/2;
    this.tx = width/2; this.ty = height/2;
    this.size = random(14, 24);
    this.hue = random(180, 280);
    this.lag = random(0.04, 0.14);
  }
  update() {
    this.angle += this.speed;
    this.tx = mouseX + cos(this.angle) * this.radius;
    this.ty = mouseY + sin(this.angle) * this.radius;
    this.x = lerp(this.x, this.tx, this.lag);
    this.y = lerp(this.y, this.ty, this.lag);
  }
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle + HALF_PI);
    textAlign(CENTER, CENTER);
    noStroke();
    textSize(this.size);
    fill(this.hue, 55, 92);
    text('☽', 0, 0);
    pop();
  }
}

function setup() {
  createCanvas(800, 600);
  colorMode(HSB, 360, 100, 100, 100);
  background(0, 0, 5);
  textFont('monospace');

  var spacingX = width  / (NUM_COLS + 1);
  var spacingY = height / (NUM_ROWS + 1);
  for (var row = 1; row <= NUM_ROWS; row++) {
    for (var col = 1; col <= NUM_COLS; col++) {
      particles.push(new Particle(col * spacingX, row * spacingY));
    }
  }
  for (var i = 0; i < NUM_MOONS; i++) {
    moonSwarm.push(new Moon(i));
  }
}

function draw() {
  background(0, 0, 5, MODE === 3 ? 55 : 85);
  t += 0.016;

  if (MODE === 1) {
    trail.push({x: mouseX, y: mouseY});
    if (trail.length > 38) trail.shift();
    for (var i = 0; i < trail.length; i++) {
      var age = i / trail.length;
      var orb = trail[i];
      var hue = (t * 120 + i * 11) % 360;
      var radius = 32 * age;
      noStroke();
      fill(hue, 90, 100, age * 18);
      circle(orb.x, orb.y, radius * 2.8);
      fill(hue, 70, 100, age * 28);
      circle(orb.x, orb.y, radius * 1.5);
      fill((hue + 30) % 360, 60, 100, age * 42);
      circle(orb.x, orb.y, radius * 0.7);
    }
    noFill();
    stroke(0, 0, 100, 8);
    strokeWeight(1);
    circle(mouseX, mouseY, FORCE_RADIUS * 2);

  } else if (MODE === 2) {
    for (var m = 0; m < moonSwarm.length; m++) {
      moonSwarm[m].update();
      moonSwarm[m].display();
    }
    noFill();
    stroke(220, 40, 100, 12);
    strokeWeight(1);
    circle(mouseX, mouseY, 22);

  } else {
    noFill();
    stroke(0, 0, 100, 7);
    strokeWeight(1);
    circle(mouseX, mouseY, FORCE_RADIUS * 2);
    for (var j = 0; j < particles.length; j++) {
      particles[j].update();
      particles[j].display();
    }
  }
}

function mousePressed() {
  background(0, 0, 5);
  trail = [];
  for (var i = 0; i < particles.length; i++) particles[i].reset();
}

function keyPressed() {
  if (key === '1') MODE = 1;
  if (key === '2') MODE = 2;
  if (key === '3') MODE = 3;
}