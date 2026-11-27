// World environment, multi-stage parallax backgrounds, and level spawner
// Revision 2: Added rich foreground obstacles, stage props, and ambient autumn atmosphere
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, STAGES, COLOR_PALETTE } from './config.js';
import { WorldHazard, CollectibleItem, PursuerEnemy } from './entities.js';

export class GameWorld {
  constructor() {
    this.currentStageIndex = 0;
    this.stage = STAGES[0];
    this.distanceCovered = 0;
    this.scrollOffset = 0;
    this.hazards = [];
    this.collectibles = [];
    this.particles = [];
    this.pursuer = new PursuerEnemy(1);
    this.spawnTimer = 0;
    this.clouds = [
      { x: 100, y: 70, speed: 0.35, size: 48 },
      { x: 450, y: 110, speed: 0.45, size: 64 },
      { x: 800, y: 60, speed: 0.28, size: 42 }
    ];
  }

  loadStage(index) {
    this.currentStageIndex = index;
    this.stage = STAGES[index];
    this.distanceCovered = 0;
    this.hazards = [];
    this.collectibles = [];
    this.pursuer = new PursuerEnemy(this.stage.id);
  }

  update(stageSpeed, player) {
    this.distanceCovered += stageSpeed;
    this.scrollOffset += stageSpeed;

    // Update pursuer
    this.pursuer.update(player.dashTimer > 0, player.disguisedTimer > 0);

    // Update clouds
    this.clouds.forEach(c => {
      c.x -= c.speed + stageSpeed * 0.12;
      if (c.x < -100) c.x = CANVAS_WIDTH + 60;
    });

    // Update hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.update(stageSpeed);
      if (h.markedForRemoval) {
        this.hazards.splice(i, 1);
      }
    }

    // Update collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      c.update(stageSpeed);
      if (c.collected) {
        this.collectibles.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx - stageSpeed;
      p.y += p.vy;
      p.life--;
      p.alpha = p.life / p.maxLife;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Dynamic Level Spawning
    this.spawnTimer += stageSpeed;
    if (this.spawnTimer > 170 && this.distanceCovered < this.stage.length - 280) {
      this.spawnTimer = 0;
      this.spawnRandomHazardsAndItems(CANVAS_WIDTH + 60);
    }
  }

  spawnRandomHazardsAndItems(spawnX = CANVAS_WIDTH + 60) {
    const stageId = this.stage.id;
    const r = Math.random();

    // Spawn Hazard
    let hazardType = 'rake';
    if (stageId === 1) {
      hazardType = r < 0.5 ? 'pumpkin' : (r < 0.8 ? 'haybale' : 'rake');
    } else if (stageId === 2) {
      hazardType = r < 0.4 ? 'haybale' : (r < 0.75 ? 'pumpkin' : 'rake');
    } else {
      hazardType = r < 0.45 ? 'cleaver_high' : (r < 0.8 ? 'oven_fire' : 'haybale');
    }

    this.hazards.push(new WorldHazard(spawnX, hazardType, stageId));

    // Spawn Collectibles
    const itemRoll = Math.random();
    if (itemRoll < 0.65) {
      // Corn group
      const count = 2 + Math.floor(Math.random() * 3);
      for (let k = 0; k < count; k++) {
        const itemY = GROUND_Y - 42 - (Math.random() > 0.5 ? 55 : 12);
        this.collectibles.push(new CollectibleItem(spawnX + 90 + k * 45, itemY, 'corn'));
      }
    } else if (itemRoll < 0.85) {
      // Chili pepper speed boost
      this.collectibles.push(new CollectibleItem(spawnX + 90, GROUND_Y - 38, 'speed_seed'));
    } else {
      // Camouflage bush
      this.collectibles.push(new CollectibleItem(spawnX + 90, GROUND_Y - 38, 'disguise_bush'));
    }
  }

  addFeatherParticles(x, y, count = 6) {
    const colors = [COLOR_PALETTE.turkeyBrown, COLOR_PALETTE.turkeyTail, COLOR_PALETTE.leafGold];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: -Math.random() * 4 - 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 30 + Math.floor(Math.random() * 20),
        maxLife: 50,
        size: 4 + Math.random() * 3
      });
    }
  }

  drawBackground(ctx) {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, this.stage.bgColorTop);
    skyGrad.addColorStop(1, this.stage.bgColorBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    // Clouds / Steam
    ctx.fillStyle = this.stage.id === 3 ? 'rgba(255, 120, 80, 0.22)' : 'rgba(255, 245, 230, 0.28)';
    this.clouds.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.arc(c.x + c.size * 0.7, c.y - c.size * 0.2, c.size * 0.8, 0, Math.PI * 2);
      ctx.arc(c.x - c.size * 0.6, c.y + c.size * 0.1, c.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });

    // Parallax Distant Layer
    if (this.stage.id === 1) {
      // Red Barn and Silos in background
      ctx.fillStyle = '#6d261e';
      const barnX = (600 - this.scrollOffset * 0.25) % 1200;
      ctx.fillRect(barnX - 100, GROUND_Y - 145, 160, 145);
      // Barn roof triangle
      ctx.beginPath();
      ctx.moveTo(barnX - 110, GROUND_Y - 145);
      ctx.lineTo(barnX - 20, GROUND_Y - 205);
      ctx.lineTo(barnX + 70, GROUND_Y - 145);
      ctx.closePath();
      ctx.fill();
      // Silo
      ctx.fillStyle = '#546e7a';
      ctx.fillRect(barnX + 80, GROUND_Y - 175, 45, 175);
      ctx.beginPath();
      ctx.arc(barnX + 102.5, GROUND_Y - 175, 22.5, Math.PI, 0);
      ctx.fill();

      // Wooden fence posts in midground
      ctx.fillStyle = '#4e342e';
      for (let fx = 0; fx < CANVAS_WIDTH + 60; fx += 55) {
        const fenceX = (fx - (this.scrollOffset * 0.5) % 55);
        ctx.fillRect(fenceX, GROUND_Y - 35, 7, 35);
        ctx.fillRect(fenceX - 24, GROUND_Y - 28, 55, 5);
        ctx.fillRect(fenceX - 24, GROUND_Y - 14, 55, 5);
      }
    } else if (this.stage.id === 2) {
      // Tall Corn Stalks in distance
      ctx.fillStyle = '#33691e';
      for (let x = 0; x < CANVAS_WIDTH + 60; x += 35) {
        const stalkX = (x - (this.scrollOffset * 0.35) % 35);
        ctx.fillRect(stalkX, GROUND_Y - 95, 9, 95);
        ctx.beginPath();
        ctx.ellipse(stalkX + 14, GROUND_Y - 75, 15, 6, -0.3, 0, Math.PI * 2);
        ctx.ellipse(stalkX - 8, GROUND_Y - 55, 15, 6, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Scarecrow silhouette in background
      const scarecrowX = (750 - this.scrollOffset * 0.2) % 960;
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(scarecrowX, GROUND_Y - 110, 8, 110);
      ctx.fillRect(scarecrowX - 25, GROUND_Y - 95, 58, 6);
      ctx.beginPath();
      ctx.arc(scarecrowX + 4, GROUND_Y - 115, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Kitchen Shelves, giant pots, and hanging cookware
      ctx.fillStyle = '#263238';
      ctx.fillRect(0, GROUND_Y - 180, CANVAS_WIDTH, 14);
      ctx.fillRect(0, GROUND_Y - 90, CANVAS_WIDTH, 14);
      // Hanging pots
      for (let x = 80; x < CANVAS_WIDTH + 180; x += 180) {
        const potX = (x - (this.scrollOffset * 0.25) % 180);
        ctx.fillStyle = '#37474f';
        ctx.beginPath();
        ctx.arc(potX, GROUND_Y - 130, 24, 0, Math.PI);
        ctx.fill();
        ctx.fillRect(potX - 3, GROUND_Y - 170, 6, 40);
      }
    }

    // Ground Rendering
    ctx.fillStyle = this.stage.groundColor;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Ground top border & texture stripes
    ctx.fillStyle = this.stage.groundAccent;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 6);

    for (let x = 0; x < CANVAS_WIDTH + 60; x += 40) {
      const stripeX = (x - (this.scrollOffset % 40));
      ctx.fillRect(stripeX, GROUND_Y + 12, 20, 4);
      ctx.fillRect(stripeX + 10, GROUND_Y + 28, 14, 3);
      ctx.fillRect(stripeX - 5, GROUND_Y + 48, 16, 4);
    }
  }

  drawEntities(ctx, player) {
    // Draw Pursuer Enemy
    this.pursuer.draw(ctx);

    // Draw Hazards
    this.hazards.forEach(h => h.draw(ctx));

    // Draw Collectibles
    this.collectibles.forEach(c => c.draw(ctx));

    // Draw Player Turkey
    player.draw(ctx);

    // Draw Particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
