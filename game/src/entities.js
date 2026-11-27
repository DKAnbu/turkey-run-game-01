// Entities module: Player (Gobble the Turkey), Pursuers, Hazards, and Collectibles
// Revision 2: Added detailed obstacle rendering, animated feather wobble, and clear visual differentiation
import { GROUND_Y, PLAYER_CONFIG, COLOR_PALETTE } from './config.js';
import { sounds } from './audio.js';

export class TurkeyPlayer {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = PLAYER_CONFIG.startX;
    this.y = GROUND_Y - PLAYER_CONFIG.height;
    this.vx = 0;
    this.vy = 0;
    this.width = PLAYER_CONFIG.width;
    this.height = PLAYER_CONFIG.height;
    this.isGrounded = true;
    this.isSliding = false;
    this.fluttersLeft = PLAYER_CONFIG.maxFlutters;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.lives = PLAYER_CONFIG.maxLives;
    this.invulnerableTimer = 0;
    this.disguisedTimer = 0;
    this.animFrame = 0;
    this.runCycle = 0;
    this.gobbleEffectTimer = 0;
  }

  update(input, stageSpeed) {
    this.animFrame++;

    // Handle Timers
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;
    if (this.disguisedTimer > 0) this.disguisedTimer--;
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.gobbleEffectTimer > 0) this.gobbleEffectTimer--;

    // Gobble taunt
    if (input.gobblePressed()) {
      sounds.gobble();
      this.gobbleEffectTimer = 40;
    }

    // Sliding / Ducking
    if (input.duckDown() && this.isGrounded) {
      this.isSliding = true;
      this.height = PLAYER_CONFIG.slideHeight;
      this.y = GROUND_Y - this.height;
    } else {
      if (this.isSliding) {
        this.isSliding = false;
        this.height = PLAYER_CONFIG.height;
        this.y = GROUND_Y - this.height;
      }
    }

    // Jumping & Fluttering
    if (input.jumpPressed()) {
      if (this.isGrounded) {
        this.vy = PLAYER_CONFIG.jumpPower;
        this.isGrounded = false;
        this.fluttersLeft = PLAYER_CONFIG.maxFlutters;
        sounds.jump();
      } else if (this.fluttersLeft > 0) {
        this.vy = PLAYER_CONFIG.flutterPower;
        this.fluttersLeft--;
        sounds.flutter();
      }
    }

    // Dashing
    if (input.dashPressed() && this.dashCooldown === 0) {
      this.dashTimer = PLAYER_CONFIG.dashDuration;
      this.dashCooldown = PLAYER_CONFIG.dashCooldown;
      sounds.dash();
    }

    if (this.dashTimer > 0) {
      this.dashTimer--;
    }

    // Physics
    this.vy += PLAYER_CONFIG.gravity;
    this.y += this.vy;

    if (this.y >= GROUND_Y - this.height) {
      this.y = GROUND_Y - this.height;
      this.vy = 0;
      this.isGrounded = true;
      this.fluttersLeft = PLAYER_CONFIG.maxFlutters;
    } else {
      this.isGrounded = false;
    }

    // Run cycle animation
    if (this.isGrounded) {
      this.runCycle += 0.25 * (this.dashTimer > 0 ? 1.8 : 1.0);
    }
  }

  takeDamage() {
    if (this.invulnerableTimer > 0 || this.disguisedTimer > 0) return false;
    this.lives--;
    this.invulnerableTimer = PLAYER_CONFIG.invulnerableDuration;
    sounds.hit();
    return true;
  }

  draw(ctx) {
    ctx.save();
    // Blinking effect during invulnerability
    if (this.invulnerableTimer > 0 && Math.floor(this.animFrame / 4) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // Disguise bush overlay
    if (this.disguisedTimer > 0) {
      ctx.fillStyle = COLOR_PALETTE.bushGreen;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1b5e20';
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 8, 14, 0, Math.PI * 2);
      ctx.arc(cx + 12, cy - 4, 16, 0, Math.PI * 2);
      ctx.fill();
      // Little eyes peeking out
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx + 6, cy - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(cx + 8, cy - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Dash speed aura
    if (this.dashTimer > 0) {
      ctx.fillStyle = 'rgba(255, 167, 38, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx - 24, cy, 24, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 235, 59, 0.35)';
      ctx.beginPath();
      ctx.ellipse(cx - 36, cy, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Turkey Body
    const bob = this.isGrounded ? Math.sin(this.runCycle) * 3 : 0;
    const bodyY = cy + bob;

    // Turkey Fan Tail (fanned out behind with animated flutter)
    const tailColors = [COLOR_PALETTE.turkeyTail, COLOR_PALETTE.leafGold, COLOR_PALETTE.pumpkinOrange];
    const tailWobble = Math.sin(this.runCycle * 0.8) * 0.08;
    for (let i = -3; i <= 3; i++) {
      const angle = -Math.PI / 2 + (i * 0.22) + tailWobble;
      const color = tailColors[(Math.abs(i)) % tailColors.length];
      ctx.fillStyle = color;
      ctx.beginPath();
      const tx = cx - 14 + Math.cos(angle) * 23;
      const ty = bodyY + Math.sin(angle) * 23;
      ctx.ellipse(tx, ty, 6, 15, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Turkey plump body
    ctx.fillStyle = COLOR_PALETTE.turkeyBrown;
    ctx.beginPath();
    ctx.ellipse(cx - 2, bodyY + 4, 19, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing with feathers
    ctx.fillStyle = COLOR_PALETTE.turkeyFeather;
    ctx.beginPath();
    const wingAngle = this.isGrounded ? Math.sin(this.runCycle) * 0.25 : -0.55;
    ctx.ellipse(cx - 4, bodyY + 4, 12, 8, wingAngle, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Head and neck
    ctx.fillStyle = '#e57373'; // Reddish-pinkish turkey neck
    ctx.beginPath();
    ctx.ellipse(cx + 12, bodyY - 8, 7.5, 11, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Red Snood (wattle hanging down)
    ctx.fillStyle = COLOR_PALETTE.turkeySnood;
    ctx.beginPath();
    ctx.ellipse(cx + 18, bodyY - 2, 3.5, 9, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = COLOR_PALETTE.turkeyBeak;
    ctx.beginPath();
    ctx.moveTo(cx + 16, bodyY - 11);
    ctx.lineTo(cx + 26, bodyY - 7);
    ctx.lineTo(cx + 16, bodyY - 3);
    ctx.closePath();
    ctx.fill();

    // Expressive Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + 13, bodyY - 9, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx + 14.8, bodyY - 9, 1.9, 0, Math.PI * 2);
    ctx.fill();

    // Running legs
    ctx.strokeStyle = COLOR_PALETTE.turkeyBeak;
    ctx.lineWidth = 3;
    const leg1Angle = Math.sin(this.runCycle);
    const leg2Angle = Math.sin(this.runCycle + Math.PI);

    // Leg 1
    ctx.beginPath();
    ctx.moveTo(cx - 5, bodyY + 14);
    ctx.lineTo(cx - 5 + Math.sin(leg1Angle) * 11, this.y + this.height);
    ctx.stroke();

    // Leg 2
    ctx.beginPath();
    ctx.moveTo(cx + 4, bodyY + 14);
    ctx.lineTo(cx + 4 + Math.sin(leg2Angle) * 11, this.y + this.height);
    ctx.stroke();

    // Gobble text bubble if activated
    if (this.gobbleEffectTimer > 0) {
      ctx.font = 'bold 15px "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffe082';
      ctx.strokeStyle = '#d84315';
      ctx.lineWidth = 3;
      ctx.strokeText('GOBBLE GOBBLE!!', cx - 22, bodyY - 28);
      ctx.fillText('GOBBLE GOBBLE!!', cx - 22, bodyY - 28);
    }

    ctx.restore();
  }
}

export class PursuerEnemy {
  constructor(stageId) {
    this.stageId = stageId;
    this.x = -80; // Starts behind player
    this.targetX = 60; // How close he catches up
    this.y = GROUND_Y - 70;
    this.width = 54;
    this.height = 70;
    this.distanceRel = 300; // Relative distance in meters/units
    this.animFrame = 0;
    this.shoutTimer = 0;
  }

  update(playerDash, playerDisguised) {
    this.animFrame++;

    // If player dashes, pursuer falls back; if player runs slow or stops, pursuer gains ground
    if (playerDash) {
      this.distanceRel = Math.min(450, this.distanceRel + 2.2);
    } else if (playerDisguised) {
      this.distanceRel = Math.min(400, this.distanceRel + 1.2);
    } else {
      this.distanceRel = Math.max(70, this.distanceRel - 0.45);
    }

    // Map distanceRel to screen X (distance 70 -> x=80 danger! distance 450 -> x=-80)
    const normalized = (450 - this.distanceRel) / (450 - 70);
    this.x = -60 + normalized * 130;

    if (this.shoutTimer > 0) this.shoutTimer--;
    if (Math.random() < 0.005 && this.shoutTimer === 0) {
      this.shoutTimer = 90;
    }
  }

  draw(ctx) {
    ctx.save();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const legPhase = Math.sin(this.animFrame * 0.22);

    if (this.stageId === 1) {
      // Farmer John with pitchfork
      ctx.fillStyle = '#b71c1c'; // Red shirt
      ctx.fillRect(cx - 12, cy - 10, 24, 26);
      ctx.fillStyle = '#1565c0'; // Denim overalls
      ctx.fillRect(cx - 10, cy, 20, 24);

      // Head and straw hat
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 10, 0, Math.PI * 2);
      ctx.fill();

      // Straw Hat
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 25, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 9, cy - 35, 18, 12);

      // Running legs
      ctx.strokeStyle = '#0d47a1';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 24);
      ctx.lineTo(cx - 5 + legPhase * 10, cy + 38);
      ctx.moveTo(cx + 5, cy + 24);
      ctx.lineTo(cx + 5 - legPhase * 10, cy + 38);
      ctx.stroke();

      // Pitchfork
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy + 18);
      ctx.lineTo(cx + 28, cy - 22);
      ctx.stroke();

      ctx.strokeStyle = '#b0bec5';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx + 22, cy - 22);
      ctx.lineTo(cx + 34, cy - 22);
      ctx.moveTo(cx + 24, cy - 22);
      ctx.lineTo(cx + 24, cy - 32);
      ctx.moveTo(cx + 28, cy - 22);
      ctx.lineTo(cx + 28, cy - 34);
      ctx.moveTo(cx + 32, cy - 22);
      ctx.lineTo(cx + 32, cy - 32);
      ctx.stroke();
    } else if (this.stageId === 2) {
      // Hungry Hound Dog
      ctx.fillStyle = '#8d6e63';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 25, 15, 0, 0, Math.PI * 2); // Dog body
      ctx.fill();

      // Dog Head
      ctx.beginPath();
      ctx.ellipse(cx + 19, cy, 13, 11, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Floppy Ear
      ctx.fillStyle = '#5d4037';
      ctx.beginPath();
      ctx.ellipse(cx + 15, cy - 2, 5, 12, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Red Collar
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(cx + 11, cy + 2, 4, 8);

      // Running paws
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy + 20);
      ctx.lineTo(cx - 14 + legPhase * 8, cy + 34);
      ctx.moveTo(cx + 12, cy + 20);
      ctx.lineTo(cx + 12 - legPhase * 8, cy + 34);
      ctx.stroke();

      // Snout & Tongue
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(cx + 29, cy + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff80ab';
      ctx.fillRect(cx + 26, cy + 6, 8, 3.5);
    } else {
      // Stage 3: Chef Pierre with massive carving knife!
      ctx.fillStyle = '#ffffff'; // White chef coat
      ctx.fillRect(cx - 14, cy - 12, 28, 30);
      ctx.fillStyle = '#37474f'; // Dark pants
      ctx.fillRect(cx - 10, cy + 18, 20, 16);

      // Head
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 10, 0, Math.PI * 2);
      ctx.fill();

      // Big mustache
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.ellipse(cx + 4, cy - 18, 9, 3.5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Chef Toque (Tall Hat)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(cx - 10, cy - 32, 20, 10);
      ctx.arc(cx, cy - 36, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cfd8dc';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 10, cy - 32, 20, 10);

      // Running legs
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 30);
      ctx.lineTo(cx - 6 + legPhase * 9, cy + 42);
      ctx.moveTo(cx + 6, cy + 30);
      ctx.lineTo(cx + 6 - legPhase * 9, cy + 42);
      ctx.stroke();

      // Glistening Carving Knife
      ctx.strokeStyle = '#cfd8dc';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(cx + 12, cy - 4);
      ctx.lineTo(cx + 34, cy - 18);
      ctx.stroke();
      ctx.fillStyle = '#eceff1';
      ctx.beginPath();
      ctx.moveTo(cx + 34, cy - 18);
      ctx.lineTo(cx + 42, cy - 25);
      ctx.lineTo(cx + 32, cy - 13);
      ctx.closePath();
      ctx.fill();
    }

    // Shout speech bubble
    if (this.shoutTimer > 0) {
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#b71c1c';
      ctx.lineWidth = 2.5;
      const text = this.stageId === 1 ? 'COME BACK, TURKEY!' : this.stageId === 2 ? 'WOOF! WOOF!' : 'MON DIEU, MY ROAST!';
      ctx.strokeText(text, cx - 10, cy - 42);
      ctx.fillText(text, cx - 10, cy - 42);
    }

    ctx.restore();
  }
}

export class WorldHazard {
  constructor(x, type, stageId) {
    this.x = x;
    this.type = type; // 'pumpkin', 'haybale', 'cleaver_high', 'oven_fire', 'rake'
    this.stageId = stageId;
    this.markedForRemoval = false;
    this.angle = 0;

    switch (type) {
      case 'pumpkin':
        this.width = 38;
        this.height = 32;
        this.y = GROUND_Y - this.height;
        break;
      case 'haybale':
        this.width = 48;
        this.height = 44;
        this.y = GROUND_Y - this.height;
        break;
      case 'cleaver_high':
        this.width = 44;
        this.height = 26;
        this.y = GROUND_Y - 78; // Requires sliding under!
        break;
      case 'oven_fire':
        this.width = 42;
        this.height = 50;
        this.y = GROUND_Y - this.height;
        break;
      case 'rake':
      default:
        this.width = 34;
        this.height = 26;
        this.y = GROUND_Y - this.height;
        break;
    }
  }

  update(speed) {
    this.x -= speed;
    this.angle += 0.08;
    if (this.x + this.width < -100) {
      this.markedForRemoval = true;
    }
  }

  checkCollision(player) {
    return (
      this.x < player.x + player.width - 6 &&
      this.x + this.width > player.x + 6 &&
      this.y < player.y + player.height - 4 &&
      this.y + this.height > player.y + 4
    );
  }

  draw(ctx) {
    ctx.save();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    if (this.type === 'pumpkin') {
      ctx.fillStyle = COLOR_PALETTE.pumpkinOrange;
      ctx.beginPath();
      ctx.ellipse(cx, cy, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e64a19';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Ribs
      ctx.beginPath();
      ctx.ellipse(cx, cy, this.width / 4, this.height / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Green stem
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(cx - 3, cy - this.height / 2 - 5, 6, 7);
    } else if (this.type === 'haybale') {
      ctx.fillStyle = '#d4b146';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = '#9e8027';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      // Hay ties
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + 14, this.y);
      ctx.lineTo(this.x + 14, this.y + this.height);
      ctx.moveTo(this.x + 34, this.y);
      ctx.lineTo(this.x + 34, this.y + this.height);
      ctx.stroke();
    } else if (this.type === 'cleaver_high') {
      // Spinning flying cleaver overhead!
      ctx.translate(cx, cy);
      ctx.rotate(this.angle * 2.2);
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(-18, -10, 36, 20);
      ctx.strokeStyle = '#eceff1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-18, -10, 36, 20);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(-26, -4, 8, 8);
    } else if (this.type === 'oven_fire') {
      // Roaring oven grate with flames
      ctx.fillStyle = '#212121';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = '#424242';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = '#ff3d00';
      ctx.beginPath();
      ctx.moveTo(this.x + 4, this.y + this.height);
      ctx.lineTo(cx, this.y + 4 + Math.sin(this.angle * 4) * 6);
      ctx.lineTo(this.x + this.width - 4, this.y + this.height);
      ctx.fill();
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(cx, this.y + 26, 8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Garden Rake on the ground
      ctx.strokeStyle = '#78909c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.x + 4, this.y + this.height - 2);
      ctx.lineTo(this.x + this.width - 4, this.y + this.height - 2);
      for (let i = 0; i < 5; i++) {
        const tx = this.x + 6 + i * 5;
        ctx.moveTo(tx, this.y + this.height - 2);
        ctx.lineTo(tx, this.y + 6);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}

export class CollectibleItem {
  constructor(x, y, kind) {
    this.x = x;
    this.y = y;
    this.kind = kind; // 'corn', 'speed_seed', 'disguise_bush'
    this.width = 24;
    this.height = 24;
    this.animTime = Math.random() * 10;
    this.collected = false;
  }

  update(speed) {
    this.x -= speed;
    this.animTime += 0.08;
    if (this.x + this.width < -50) {
      this.collected = true;
    }
  }

  checkCollision(player) {
    return (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    );
  }

  draw(ctx) {
    ctx.save();
    const bob = Math.sin(this.animTime) * 4;
    const cy = this.y + bob;

    if (this.kind === 'corn') {
      // Golden Corn Cob
      ctx.fillStyle = COLOR_PALETTE.cornYellow;
      ctx.beginPath();
      ctx.ellipse(this.x + 12, cy + 12, 6, 11, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbc02d';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Green husk
      ctx.fillStyle = '#7cb342';
      ctx.beginPath();
      ctx.ellipse(this.x + 9, cy + 17, 3.5, 7, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.kind === 'speed_seed') {
      // Fiery Speed Chili Pepper
      ctx.fillStyle = '#d50000';
      ctx.beginPath();
      ctx.ellipse(this.x + 12, cy + 12, 5.5, 12, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(this.x + 11, cy + 2, 3, 5);
    } else {
      // Camouflage Disguise Bush
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.arc(this.x + 12, cy + 12, 10, 0, Math.PI * 2);
      ctx.arc(this.x + 7, cy + 8, 6, 0, Math.PI * 2);
      ctx.arc(this.x + 17, cy + 14, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
