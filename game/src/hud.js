// Heads-Up Display (HUD) and UI Overlay renderer for Gobble's Great Escape
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_PALETTE } from './config.js';

export class GameHUD {
  drawHUD(ctx, player, world, score, cornCount) {
    ctx.save();

    // Top Bar Background
    ctx.fillStyle = 'rgba(26, 15, 10, 0.75)';
    ctx.fillRect(16, 14, CANVAS_WIDTH - 32, 48);
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 14, CANVAS_WIDTH - 32, 48);

    // Stage Title
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffd54f';
    ctx.fillText(`${world.stage.name}`, 32, 38);

    // Stage Progress Bar
    const progressW = 160;
    const progressX = 32;
    const progressY = 46;
    const progressPct = Math.min(1.0, world.distanceCovered / world.stage.length);

    ctx.fillStyle = '#3e2723';
    ctx.fillRect(progressX, progressY, progressW, 8);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(progressX, progressY, progressW * progressPct, 8);
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 1;
    ctx.strokeRect(progressX, progressY, progressW, 8);

    // Lives (Turkey drumstick / heart icons)
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffcc80';
    ctx.fillText('LIVES:', 240, 38);
    for (let i = 0; i < 3; i++) {
      if (i < player.lives) {
        ctx.fillStyle = '#d32f2f'; // Red heart
        ctx.beginPath();
        const hx = 295 + i * 22;
        const hy = 32;
        ctx.arc(hx - 4, hy - 4, 5, Math.PI, 0);
        ctx.arc(hx + 4, hy - 4, 5, Math.PI, 0);
        ctx.lineTo(hx, hy + 6);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#5d4037'; // Empty heart
        ctx.beginPath();
        const hx = 295 + i * 22;
        const hy = 32;
        ctx.arc(hx - 4, hy - 4, 4, 0, Math.PI * 2);
        ctx.arc(hx + 4, hy - 4, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Corn Counter
    ctx.fillStyle = COLOR_PALETTE.cornYellow;
    ctx.beginPath();
    ctx.ellipse(395, 34, 5, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillStyle = '#fff8e1';
    ctx.fillText(`× ${cornCount}`, 410, 40);

    // Dash / Stamina Cooldown Meter
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffcc80';
    ctx.fillText('DASH:', 500, 38);
    const dashW = 80;
    const dashPct = player.dashCooldown === 0 ? 1.0 : (1.0 - player.dashCooldown / 90);
    ctx.fillStyle = '#263238';
    ctx.fillRect(545, 28, dashW, 14);
    ctx.fillStyle = player.dashCooldown === 0 ? '#4caf50' : '#ff9800';
    ctx.fillRect(545, 28, dashW * dashPct, 14);
    ctx.strokeStyle = '#546e7a';
    ctx.strokeRect(545, 28, dashW, 14);

    // Pursuer Distance Threat Meter
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ef5350';
    ctx.fillText('PURSUER:', 660, 38);
    const threatW = 100;
    const threatPct = Math.max(0, Math.min(1.0, (450 - world.pursuer.distanceRel) / 380));
    ctx.fillStyle = '#263238';
    ctx.fillRect(735, 28, threatW, 14);
    ctx.fillStyle = threatPct > 0.7 ? '#d50000' : threatPct > 0.4 ? '#ff9100' : '#ffea00';
    ctx.fillRect(735, 28, threatW * threatPct, 14);
    ctx.strokeStyle = '#546e7a';
    ctx.strokeRect(735, 28, threatW, 14);

    // Score
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffe082';
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${score}`, CANVAS_WIDTH - 36, 42);
    ctx.textAlign = 'left';

    ctx.restore();
  }

  drawTitleScreen(ctx, animTick) {
    ctx.save();
    // Darkened warm backdrop
    ctx.fillStyle = 'rgba(20, 10, 6, 0.88)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Autumn Leaves Border Accents
    ctx.strokeStyle = '#d84315';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 30, CANVAS_WIDTH - 80, CANVAS_HEIGHT - 60);

    // Main Game Title
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffb300';
    ctx.shadowColor = '#d84315';
    ctx.shadowBlur = 12;
    ctx.fillText("GOBBLE'S GREAT ESCAPE", CANVAS_WIDTH / 2, 130);

    ctx.font = 'italic 22px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffe082';
    ctx.shadowBlur = 4;
    ctx.fillText("The Thanksgiving Run for Freedom!", CANVAS_WIDTH / 2, 175);
    ctx.shadowBlur = 0;

    // Feature highlights / story
    ctx.fillStyle = '#d7ccc8';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText("Thanksgiving is here, and you are the main course!", CANVAS_WIDTH / 2, 230);
    ctx.fillText("Outrun Farmer John, escape through the Cornfield Labyrinth, and evade Chef Pierre!", CANVAS_WIDTH / 2, 255);

    // Controls Guide Box
    ctx.fillStyle = 'rgba(62, 39, 35, 0.75)';
    ctx.fillRect(CANVAS_WIDTH / 2 - 280, 280, 560, 130);
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 2;
    ctx.strokeRect(CANVAS_WIDTH / 2 - 280, 280, 560, 130);

    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffd54f';
    ctx.fillText("HOW TO PLAY / CONTROLS", CANVAS_WIDTH / 2, 306);

    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#fff8e1';
    ctx.fillText("• [SPACE / UP / W]: Jump (Tap twice in air to Flutter!)", CANVAS_WIDTH / 2, 332);
    ctx.fillText("• [DOWN / S]: Slide / Duck under flying cleavers & branches", CANVAS_WIDTH / 2, 354);
    ctx.fillText("• [SHIFT / J]: Dash Sprint (Surge ahead of pursuers)", CANVAS_WIDTH / 2, 376);
    ctx.fillText("• [G / E]: Gobble Taunt (Defiant gobble boost!)", CANVAS_WIDTH / 2, 398);

    // Pulsing Start Prompt
    const pulse = Math.sin(animTick * 0.08);
    const alpha = 0.75 + pulse * 0.25;
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.fillStyle = `rgba(255, 179, 0, ${alpha})`;
    ctx.fillText("PRESS [SPACE] OR CLICK ANYWHERE TO ESCAPE!", CANVAS_WIDTH / 2, 460);

    ctx.restore();
  }

  drawStageClearScreen(ctx, stageName, nextStageName, score) {
    ctx.save();
    ctx.fillStyle = 'rgba(26, 15, 10, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.font = 'bold 44px "Segoe UI", sans-serif';
    ctx.fillStyle = '#4caf50';
    ctx.fillText('STAGE CLEARED!', CANVAS_WIDTH / 2, 170);

    ctx.font = '22px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffe082';
    ctx.fillText(`You escaped ${stageName}!`, CANVAS_WIDTH / 2, 220);

    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillStyle = '#d7ccc8';
    ctx.fillText(`Next Destination: ${nextStageName}`, CANVAS_WIDTH / 2, 270);
    ctx.fillText(`Current Score: ${score}`, CANVAS_WIDTH / 2, 310);

    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffb300';
    ctx.fillText('PRESS [SPACE] OR CLICK TO CONTINUE RUNNING!', CANVAS_WIDTH / 2, 390);

    ctx.restore();
  }

  drawGameOverScreen(ctx, score, cornCount) {
    ctx.save();
    ctx.fillStyle = 'rgba(30, 8, 8, 0.9)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.font = 'bold 50px "Segoe UI", sans-serif';
    ctx.fillStyle = '#e53935';
    ctx.fillText('CAUGHT FOR DINNER!', CANVAS_WIDTH / 2, 170);

    ctx.font = '20px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffcdd2';
    ctx.fillText('Alas, Gobble was destined for the roasting platter...', CANVAS_WIDTH / 2, 220);

    ctx.font = '22px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffe082';
    ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, 280);
    ctx.fillText(`Golden Corn Collected: ${cornCount}`, CANVAS_WIDTH / 2, 316);

    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffb300';
    ctx.fillText('PRESS [SPACE] OR CLICK TO TRY AGAIN!', CANVAS_WIDTH / 2, 400);

    ctx.restore();
  }

  drawVictoryScreen(ctx, score, cornCount) {
    ctx.save();
    ctx.fillStyle = 'rgba(16, 32, 16, 0.9)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.font = 'bold 50px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('FREEDOM AT LAST!', CANVAS_WIDTH / 2, 160);

    ctx.font = '22px "Segoe UI", sans-serif';
    ctx.fillStyle = '#a5d6a7';
    ctx.fillText('Gobble escaped to the peaceful wild woods safe and free!', CANVAS_WIDTH / 2, 215);

    ctx.fillStyle = 'rgba(46, 125, 50, 0.4)';
    ctx.fillRect(CANVAS_WIDTH / 2 - 200, 250, 400, 100);
    ctx.strokeStyle = '#81c784';
    ctx.strokeRect(CANVAS_WIDTH / 2 - 200, 250, 400, 100);

    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.fillStyle = '#fff9c4';
    ctx.fillText(`TOTAL SCORE: ${score}`, CANVAS_WIDTH / 2, 290);
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffe082';
    ctx.fillText(`Golden Corn Gathered: ${cornCount}`, CANVAS_WIDTH / 2, 324);

    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('PRESS [SPACE] OR CLICK TO PLAY AGAIN!', CANVAS_WIDTH / 2, 420);

    ctx.restore();
  }
}
