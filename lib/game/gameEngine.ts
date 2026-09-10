import { Bullet, Crosshair, Drone, DroneType, GameMetrics, GameStatus, Particle } from './types';
import { checkBulletDroneCollision, hasDroneCrossedDanger, isPointInDrone } from './collision';
import { gameAudio } from '../audio/gameAudio';

export interface GameEngineCallbacks {
  onMetricsUpdate: (metrics: GameMetrics) => void;
  onGameOver: (metrics: GameMetrics) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameEngineCallbacks;

  // Game Entities
  private drones: Drone[] = [];
  private bullets: Bullet[] = [];
  private particles: Particle[] = [];
  private crosshair: Crosshair = {
    x: 320,
    y: 200,
    isTargeting: false,
    isShooting: false,
    fireAnimation: 0,
  };
  private targetCrosshair = { x: 320, y: 200 };

  // Game Metrics State - Increased max and starting lives to 5
  private score: number = 0;
  private lives: number = 5;
  private maxLives: number = 5;
  private level: number = 1;
  private dronesDestroyed: number = 0;
  private shotsFired: number = 0;
  private shotsHit: number = 0;
  private status: GameStatus = 'IDLE';

  // Loop & Timing
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private lastSpawnTime: number = 0;
  private lastMetricsSync: number = 0;

  // Screen shake effect on life lost
  private screenShake: number = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameEngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D canvas context.');
    }
    this.ctx = context;
    this.callbacks = callbacks;
  }

  public start() {
    this.score = 0;
    this.lives = 5; // Starting with 5 lives
    this.maxLives = 5;
    this.level = 1;
    this.dronesDestroyed = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.status = 'PLAYING';

    this.drones = [];
    this.bullets = [];
    this.particles = [];
    this.crosshair.x = this.canvas.width / 2;
    this.crosshair.y = this.canvas.height / 3;
    this.targetCrosshair.x = this.crosshair.x;
    this.targetCrosshair.y = this.crosshair.y;

    this.lastFrameTime = performance.now();
    this.lastSpawnTime = performance.now();
    this.syncMetrics();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.loop(performance.now());
  }

  public stop() {
    this.status = 'IDLE';
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public setCrosshairNormalized(nx: number, ny: number) {
    this.targetCrosshair.x = Math.max(15, Math.min(this.canvas.width - 15, nx * this.canvas.width));
    this.targetCrosshair.y = Math.max(15, Math.min(this.canvas.height - 15, ny * this.canvas.height));
  }

  public setCrosshairPixels(px: number, py: number) {
    this.targetCrosshair.x = Math.max(15, Math.min(this.canvas.width - 15, px));
    this.targetCrosshair.y = Math.max(15, Math.min(this.canvas.height - 15, py));
  }

  /**
   * Fires a high-speed plasma bullet from the bottom cannon toward the current crosshair position
   */
  public shoot(): boolean {
    if (this.status !== 'PLAYING') return false;

    const cannonX = this.canvas.width / 2;
    const cannonY = this.canvas.height - 35;

    const dx = this.crosshair.x - cannonX;
    const dy = this.crosshair.y - cannonY;
    const distance = Math.hypot(dx, dy) || 1;

    // Fast bullet speed (26 px/frame) for instant hit responsiveness
    const bulletSpeed = 26;
    const vx = (dx / distance) * bulletSpeed;
    const vy = (dy / distance) * bulletSpeed;

    this.bullets.push({
      id: Math.random().toString(36).substring(2, 9),
      x: cannonX,
      y: cannonY,
      vx,
      vy,
      radius: 6.5, // Generous bullet hitbox
      color: '#38bdf8',
    });

    this.shotsFired++;
    this.crosshair.isShooting = true;
    this.crosshair.fireAnimation = 1.0;

    // Cannon muzzle particle burst
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: cannonX + (Math.random() * 8 - 4),
        y: cannonY - 6,
        vx: (Math.random() - 0.5) * 5,
        vy: -Math.random() * 5,
        life: 1,
        maxLife: 15 + Math.random() * 8,
        color: '#38bdf8',
        size: 3,
      });
    }

    gameAudio.playLaserShot();
    this.syncMetrics();
    return true;
  }

  private loop = (timestamp: number) => {
    if (this.status !== 'PLAYING') {
      this.render();
      return;
    }

    const dt = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = timestamp;

    this.update(dt, timestamp);
    this.render();

    // Throttled React state sync (~10 times per second)
    if (timestamp - this.lastMetricsSync > 100) {
      this.syncMetrics();
      this.lastMetricsSync = timestamp;
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number, timestamp: number) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const dangerY = height - 85;

    // 0. Buttery 60 FPS Crosshair Interpolation (Smooths camera frame rate)
    const lerpFactor = Math.min(1.0, dt * 28);
    this.crosshair.x += (this.targetCrosshair.x - this.crosshair.x) * lerpFactor;
    this.crosshair.y += (this.targetCrosshair.y - this.crosshair.y) * lerpFactor;

    // 1. Spawning Drones
    const spawnInterval = Math.max(900, 2600 - (this.level - 1) * 350);
    if (timestamp - this.lastSpawnTime > spawnInterval) {
      this.spawnDrone(timestamp);
      this.lastSpawnTime = timestamp;
    }

    // 2. Crosshair Targeting Check
    this.crosshair.isTargeting = this.drones.some((d) =>
      isPointInDrone(this.crosshair.x, this.crosshair.y, d)
    );

    // Crosshair fire animation decay
    if (this.crosshair.fireAnimation > 0) {
      this.crosshair.fireAnimation = Math.max(0, this.crosshair.fireAnimation - dt * 4.5);
      if (this.crosshair.fireAnimation === 0) {
        this.crosshair.isShooting = false;
      }
    }

    // 3. Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      // Bullet trail particles
      if (Math.random() > 0.3) {
        this.particles.push({
          x: b.x,
          y: b.y,
          vx: -b.vx * 0.08 + (Math.random() - 0.5),
          vy: -b.vy * 0.08 + (Math.random() - 0.5),
          life: 1,
          maxLife: 10,
          color: '#38bdf8',
          size: 2.5,
        });
      }

      // Check offscreen
      if (b.x < -20 || b.x > width + 20 || b.y < -20 || b.y > height + 20) {
        this.bullets.splice(i, 1);
      }
    }

    // 4. Update Drones (Initial slow hover phase + gradual speed progression)
    for (let i = this.drones.length - 1; i >= 0; i--) {
      const d = this.drones[i];
      const ageMs = timestamp - d.spawnTimestamp;

      // Initial Hover Phase: drone hovers/moves very gently for the first 1.8 seconds
      if (ageMs < d.hoverDuration) {
        d.currentSpeed = 0.16;
      } else {
        // Smooth ramp to target speed over 2.5 seconds
        const rampProgress = Math.min(1.0, (ageMs - d.hoverDuration) / 2500);
        d.currentSpeed = 0.16 + rampProgress * (d.speed - 0.16);
      }

      if (d.type === 'zigzag') {
        d.zigzagPhase += dt * 2.4;
        d.x = d.baseX + Math.sin(d.zigzagPhase) * 55;
      }

      d.y += d.currentSpeed * (60 * dt);

      // Check Danger Zone Breach
      if (hasDroneCrossedDanger(d, dangerY)) {
        this.drones.splice(i, 1);
        this.lives--;
        this.screenShake = 12;
        gameAudio.playDangerBreach();
        this.createExplosion(d.x, d.y, '#ef4444', 20);

        if (this.lives <= 0) {
          this.lives = 0;
          this.triggerGameOver();
          return;
        }
        continue;
      }
    }

    // 5. Bullet to Drone Collision Detection
    for (let bIdx = this.bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = this.bullets[bIdx];
      let bulletHit = false;

      for (let dIdx = this.drones.length - 1; dIdx >= 0; dIdx--) {
        const d = this.drones[dIdx];

        if (checkBulletDroneCollision(b, d)) {
          d.health--;
          bulletHit = true;

          if (d.health <= 0) {
            this.drones.splice(dIdx, 1);
            this.dronesDestroyed++;
            this.shotsHit++;

            if (d.type === 'health') {
              // Health Drone Destroyed: Restore +1 Life!
              if (this.lives < this.maxLives) {
                this.lives++;
              }
              this.score += 150;
              gameAudio.playHeal();
              this.createExplosion(d.x, d.y, '#10b981', 28);
              this.createFloatingText(d.x, d.y, '+1 LIFE ❤️', '#10b981');
            } else {
              // Standard Drone Destroyed
              this.score += 100;
              gameAudio.playExplosion();
              this.createExplosion(d.x, d.y, d.color, 24);
            }

            // Level Progression Check
            const nextLevel = Math.floor(this.score / 500) + 1;
            if (nextLevel > this.level) {
              this.level = nextLevel;
            }
          } else {
            // Damaged hit effect
            this.shotsHit++;
            this.createExplosion(b.x, b.y, '#f59e0b', 10);
          }

          break;
        }
      }

      if (bulletHit) {
        this.bullets.splice(bIdx, 1);
      }
    }

    // 6. Update Particles & Floating Text
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // 7. Screen Shake Decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }
  }

  private spawnDrone(timestamp: number) {
    const width = this.canvas.width;

    // Health Drone Spawn Logic:
    // If player has lost life, 30% chance of health drone; otherwise 12%
    const needLife = this.lives < this.maxLives;
    const isHealthDrone = needLife ? Math.random() < 0.30 : Math.random() < 0.12;

    let chosenType: DroneType;
    if (isHealthDrone) {
      chosenType = 'health';
    } else {
      const types: DroneType[] = ['scout', 'scout', 'zigzag', 'heavy'];
      chosenType = types[Math.floor(Math.random() * types.length)];
    }

    let droneWidth = 46;
    let droneHeight = 34;
    let targetSpeed = 0.65 + Math.random() * 0.25 + (this.level - 1) * 0.32;
    let health = 1;
    let color = '#ec4899'; // Scout Pink

    if (chosenType === 'health') {
      droneWidth = 48;
      droneHeight = 36;
      targetSpeed = 0.52; // Gentle, steady speed so player can easily shoot for life!
      health = 1;
      color = '#10b981'; // Health Drone Emerald Green
    } else if (chosenType === 'heavy') {
      droneWidth = 58;
      droneHeight = 42;
      targetSpeed = 0.50 + Math.random() * 0.2 + (this.level - 1) * 0.22;
      health = 2;
      color = '#f59e0b'; // Heavy Amber
    } else if (chosenType === 'zigzag') {
      droneWidth = 44;
      droneHeight = 32;
      targetSpeed = 0.60 + (this.level - 1) * 0.28;
      color = '#8b5cf6'; // Zigzag Violet
    }

    const margin = 60;
    const spawnX = margin + Math.random() * (width - margin * 2);

    this.drones.push({
      id: Math.random().toString(36).substring(2, 9),
      x: spawnX,
      y: 15,
      width: droneWidth,
      height: droneHeight,
      speed: targetSpeed,
      currentSpeed: 0.15,
      spawnTimestamp: timestamp,
      hoverDuration: 1800, // 1.8 seconds initial slow hover
      type: chosenType,
      health,
      maxHealth: health,
      color,
      baseX: spawnX,
      zigzagPhase: Math.random() * Math.PI * 2,
    });
  }

  private createExplosion(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 20 + Math.random() * 15,
        color: Math.random() > 0.3 ? color : '#ffffff',
        size: 2.5 + Math.random() * 3,
      });
    }
  }

  private createFloatingText(x: number, y: number, text: string, color: string) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -1.2,
      life: 0,
      maxLife: 45,
      color,
      size: 14,
      text,
    });
  }

  private triggerGameOver() {
    this.status = 'GAMEOVER';
    gameAudio.playGameOver();
    const metrics = this.getMetrics();
    this.callbacks.onGameOver(metrics);
    this.callbacks.onMetricsUpdate(metrics);
  }

  private syncMetrics() {
    this.callbacks.onMetricsUpdate(this.getMetrics());
  }

  public getMetrics(): GameMetrics {
    const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
    return {
      score: this.score,
      lives: this.lives,
      maxLives: this.maxLives,
      level: this.level,
      dronesDestroyed: this.dronesDestroyed,
      shotsFired: this.shotsFired,
      shotsHit: this.shotsHit,
      accuracy,
      status: this.status,
    };
  }

  // Canvas Rendering Pipeline
  public render() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const dangerY = height - 85;

    ctx.save();

    // Screen Shake effect
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Clear Screen & Cyber Grid Background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Perspective Background Grid Lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Danger Zone
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, dangerY);
    ctx.lineTo(width, dangerY);
    ctx.stroke();

    // Danger Zone Glowing Gradient Area
    const dangerGrad = ctx.createLinearGradient(0, dangerY, 0, height);
    dangerGrad.addColorStop(0, 'rgba(239, 68, 68, 0.22)');
    dangerGrad.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
    ctx.fillStyle = dangerGrad;
    ctx.fillRect(0, dangerY, width, height - dangerY);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('⚠ DANGER DEFENSE LINE - DEFEND BASE', 15, dangerY + 16);
    ctx.restore();

    // Draw Drones
    for (const d of this.drones) {
      this.drawDrone(d);
    }

    // Draw Bullets with Glowing Plasma Trail
    for (const b of this.bullets) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 14;
      ctx.fill();

      // Bullet bright white core
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    }

    // Draw Particles & Floating Text
    for (const p of this.particles) {
      ctx.save();
      const alpha = 1 - p.life / p.maxLife;
      ctx.globalAlpha = alpha;

      if (p.text) {
        // Floating notification text (e.g. "+1 LIFE ❤️")
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        // Standard particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw Player Cannon at Bottom Center
    this.drawPlayerCannon();

    // Draw Crosshair
    this.drawCrosshair();

    ctx.restore();
  }

  private drawDrone(drone: Drone) {
    const ctx = this.ctx;
    const { x, y, width, height, color, type, health, maxHealth } = drone;

    ctx.save();
    ctx.translate(x, y);

    // Drone Body Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;

    if (type === 'health') {
      // Health Recovery Drone: Glowing Green Medical Cross
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;

      // Pulse ring around health drone
      ctx.beginPath();
      ctx.arc(0, 0, width / 1.7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.stroke();

      // Body pod
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(0, 0, width / 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.stroke();

      // Medical Green Plus (+) in center
      ctx.fillStyle = '#ecfdf5';
      const crossSize = 8;
      const crossThick = 4;
      ctx.fillRect(-crossSize, -crossThick / 2, crossSize * 2, crossThick);
      ctx.fillRect(-crossThick / 2, -crossSize, crossThick, crossSize * 2);

      // Label on top: "+1 LIFE"
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+1 LIFE ❤️', 0, -height / 2 - 8);
    } else {
      // Standard / Heavy / Zigzag Drone
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-width / 2, -height / 4);
      ctx.lineTo(width / 2, -height / 4);
      ctx.moveTo(-width / 3, height / 3);
      ctx.lineTo(width / 3, height / 3);
      ctx.stroke();

      // Rotor pods
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      // Left rotor
      ctx.beginPath();
      ctx.arc(-width / 2, -height / 4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right rotor
      ctx.beginPath();
      ctx.arc(width / 2, -height / 4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Central Cockpit / Core
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(0, 0, width / 3, height / 2.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing Eye / Scanner
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Life bar on top of drone showing its health
      const barW = width * 0.85;
      const barH = 3.5;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(-barW / 2, -height / 2 - 9, barW, barH);
      ctx.fillStyle = color;
      ctx.fillRect(-barW / 2, -height / 2 - 9, barW * (health / maxHealth), barH);
    }

    ctx.restore();
  }

  private drawPlayerCannon() {
    const ctx = this.ctx;
    const cannonX = this.canvas.width / 2;
    const cannonY = this.canvas.height - 25;

    // Calculate angle towards crosshair
    const angle = Math.atan2(this.crosshair.y - cannonY, this.crosshair.x - cannonX);

    ctx.save();
    ctx.translate(cannonX, cannonY);

    // Cannon Turret Base Mount
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 15, 28, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Rotating Cannon Barrel
    ctx.rotate(angle);

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 10;

    // Barrel rectangle
    ctx.fillRect(0, -7, 34, 14);
    ctx.strokeRect(0, -7, 34, 14);

    // Muzzle tip
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(32, -9, 7, 18);

    ctx.restore();
  }

  private drawCrosshair() {
    const ctx = this.ctx;
    const { x, y, isTargeting, fireAnimation } = this.crosshair;

    ctx.save();
    ctx.translate(x, y);

    const baseRadius = 18 + fireAnimation * 10;
    const reticleColor = isTargeting ? '#f43f5e' : '#06b6d4';

    ctx.strokeStyle = reticleColor;
    ctx.shadowColor = reticleColor;
    ctx.shadowBlur = isTargeting ? 16 : 10;
    ctx.lineWidth = 2;

    // Outer Circle Ring with gaps
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();

    // Crosshair Lines
    const lineLen = 10 + fireAnimation * 5;
    ctx.beginPath();
    ctx.moveTo(-lineLen - baseRadius, 0);
    ctx.lineTo(-baseRadius + 2, 0);
    ctx.moveTo(baseRadius - 2, 0);
    ctx.lineTo(lineLen + baseRadius, 0);
    ctx.moveTo(0, -lineLen - baseRadius);
    ctx.lineTo(0, -baseRadius + 2);
    ctx.moveTo(0, baseRadius - 2);
    ctx.lineTo(0, lineLen + baseRadius);
    ctx.stroke();

    // Center Aim Dot
    ctx.fillStyle = fireAnimation > 0 ? '#ffffff' : reticleColor;
    ctx.beginPath();
    ctx.arc(0, 0, 3.5 + fireAnimation * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Firing shockwave ring
    if (fireAnimation > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius + 14 * (1 - fireAnimation), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${fireAnimation * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Lock-on Corner Brackets when targeting enemy
    if (isTargeting) {
      const bSize = baseRadius + 9;
      const bLen = 7;
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;

      // Top Left
      ctx.beginPath();
      ctx.moveTo(-bSize, -bSize + bLen);
      ctx.lineTo(-bSize, -bSize);
      ctx.lineTo(-bSize + bLen, -bSize);
      ctx.stroke();

      // Top Right
      ctx.beginPath();
      ctx.moveTo(bSize - bLen, -bSize);
      ctx.lineTo(bSize, -bSize);
      ctx.lineTo(bSize, -bSize + bLen);
      ctx.stroke();

      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(-bSize, bSize - bLen);
      ctx.lineTo(-bSize, bSize);
      ctx.lineTo(-bSize + bLen, bSize);
      ctx.stroke();

      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(bSize - bLen, bSize);
      ctx.lineTo(bSize, bSize);
      ctx.lineTo(bSize, bSize - bLen);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TARGET LOCKED', 0, -baseRadius - 13);
    }

    ctx.restore();
  }
}
