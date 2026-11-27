// Main Game Loop, State Machine, and Orchestrator for Gobble's Great Escape
// Revision 2: Added deterministic scene staging for query params, guaranteed on-screen hazards & collectibles for capture
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGES } from './config.js';
import { sounds } from './audio.js';
import { InputManager } from './input.js';
import { TurkeyPlayer } from './entities.js';
import { GameWorld } from './world.js';
import { GameHUD } from './hud.js';

export const GAME_STATES = {
  TITLE: 'TITLE',
  PLAYING: 'PLAYING',
  STAGE_CLEAR: 'STAGE_CLEAR',
  GAMEOVER: 'GAMEOVER',
  VICTORY: 'VICTORY'
};

export class GameApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.input = new InputManager();
    this.player = new TurkeyPlayer();
    this.world = new GameWorld();
    this.hud = new GameHUD();

    this.state = GAME_STATES.TITLE;
    this.score = 0;
    this.cornCount = 0;
    this.animTick = 0;

    // Check URL parameters for direct screenshot staging (e.g. ?screen=play, ?stage=2)
    this.checkUrlParams();
    this.startLoop();
  }

  checkUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const screen = params.get('screen');
      const stageParam = params.get('stage');

      if (stageParam) {
        const sIndex = Math.max(0, Math.min(STAGES.length - 1, parseInt(stageParam, 10) - 1));
        this.world.loadStage(sIndex);
      }

      if (screen === 'play') {
        this.state = GAME_STATES.PLAYING;
        this.score = 320;
        this.cornCount = 12;
        this.world.distanceCovered = 450;
        // Seed visible hazards and items right in the viewport for stunning screenshots
        this.world.spawnRandomHazardsAndItems(420);
        this.world.spawnRandomHazardsAndItems(680);
      } else if (screen === 'stage_clear') {
        this.state = GAME_STATES.STAGE_CLEAR;
        this.score = 640;
      } else if (screen === 'gameover') {
        this.state = GAME_STATES.GAMEOVER;
        this.score = 410;
        this.cornCount = 14;
      } else if (screen === 'victory') {
        this.state = GAME_STATES.VICTORY;
        this.score = 1680;
        this.cornCount = 42;
      }
    } catch {
      // Running in environment without location query
    }
  }

  startNewGame() {
    sounds.init();
    this.score = 0;
    this.cornCount = 0;
    this.player.reset();
    this.world.loadStage(0);
    this.state = GAME_STATES.PLAYING;
    sounds.gobble();
  }

  update() {
    this.animTick++;

    switch (this.state) {
      case GAME_STATES.TITLE:
        if (this.input.actionPressed()) {
          this.startNewGame();
        }
        break;

      case GAME_STATES.PLAYING:
        this.updatePlaying();
        break;

      case GAME_STATES.STAGE_CLEAR:
        if (this.input.actionPressed()) {
          const nextIndex = this.world.currentStageIndex + 1;
          if (nextIndex < STAGES.length) {
            this.world.loadStage(nextIndex);
            this.player.isGrounded = true;
            this.player.fluttersLeft = 2;
            this.state = GAME_STATES.PLAYING;
          } else {
            this.state = GAME_STATES.VICTORY;
            sounds.victory();
          }
        }
        break;

      case GAME_STATES.GAMEOVER:
      case GAME_STATES.VICTORY:
        if (this.input.actionPressed()) {
          this.state = GAME_STATES.TITLE;
        }
        break;
    }

    this.input.update();
  }

  updatePlaying() {
    const baseSpeed = this.world.stage.enemySpeedBase;
    const stageSpeed = this.player.dashTimer > 0 ? baseSpeed + 4.2 : baseSpeed;

    // Player update
    this.player.update(this.input, stageSpeed);

    // World update
    this.world.update(stageSpeed, this.player);

    // Add continuous score based on distance
    this.score += Math.floor(stageSpeed * 0.4);

    // Check Hazard Collisions
    for (let i = 0; i < this.world.hazards.length; i++) {
      const hazard = this.world.hazards[i];
      if (hazard.checkCollision(this.player)) {
        if (this.player.takeDamage()) {
          this.world.addFeatherParticles(this.player.x + 20, this.player.y + 20, 10);
          if (this.player.lives <= 0) {
            this.state = GAME_STATES.GAMEOVER;
            sounds.caught();
            return;
          }
        }
      }
    }

    // Check Pursuer Catching Turkey
    if (this.world.pursuer.distanceRel <= 75 && this.player.invulnerableTimer === 0 && this.player.disguisedTimer === 0) {
      this.player.lives = 0;
      this.state = GAME_STATES.GAMEOVER;
      sounds.caught();
      return;
    }

    // Check Collectible Collisions
    for (let i = 0; i < this.world.collectibles.length; i++) {
      const item = this.world.collectibles[i];
      if (item.checkCollision(this.player)) {
        item.collected = true;
        if (item.kind === 'corn') {
          this.cornCount++;
          this.score += 50;
          sounds.collectCorn();
        } else if (item.kind === 'speed_seed') {
          this.player.dashTimer = 35; // instant speed boost
          this.score += 100;
          sounds.collectPowerup();
        } else if (item.kind === 'disguise_bush') {
          this.player.disguisedTimer = 180; // 3 seconds stealth disguise
          this.score += 150;
          sounds.collectPowerup();
        }
      }
    }

    // Check Stage Complete
    if (this.world.distanceCovered >= this.world.stage.length) {
      this.score += 500;
      sounds.victory();
      if (this.world.currentStageIndex + 1 < STAGES.length) {
        this.state = GAME_STATES.STAGE_CLEAR;
      } else {
        this.state = GAME_STATES.VICTORY;
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background & scenery
    this.world.drawBackground(this.ctx);

    // Draw active world entities (Player, Pursuer, Hazards, Items, FX)
    this.world.drawEntities(this.ctx, this.player);

    // Draw HUD or Overlays based on state
    if (this.state === GAME_STATES.PLAYING) {
      this.hud.drawHUD(this.ctx, this.player, this.world, this.score, this.cornCount);
    } else if (this.state === GAME_STATES.TITLE) {
      this.hud.drawTitleScreen(this.ctx, this.animTick);
    } else if (this.state === GAME_STATES.STAGE_CLEAR) {
      const curStage = this.world.stage.name;
      const nextStage = STAGES[this.world.currentStageIndex + 1].name;
      this.hud.drawStageClearScreen(this.ctx, curStage, nextStage, this.score);
    } else if (this.state === GAME_STATES.GAMEOVER) {
      this.hud.drawGameOverScreen(this.ctx, this.score, this.cornCount);
    } else if (this.state === GAME_STATES.VICTORY) {
      this.hud.drawVictoryScreen(this.ctx, this.score, this.cornCount);
    }
  }

  startLoop() {
    const loop = () => {
      this.update();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
