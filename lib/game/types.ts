// Core Game Types for HAND SHOOTER

export type GameStatus = 'IDLE' | 'PLAYING' | 'GAMEOVER';

export type DroneType = 'scout' | 'heavy' | 'zigzag' | 'health';

export interface Drone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  currentSpeed: number; // Gradual speed ramp
  spawnTimestamp: number;
  hoverDuration: number; // Time in ms drone hovers/moves slowly initially
  type: DroneType;
  health: number;
  maxHealth: number;
  color: string;
  baseX: number;
  zigzagPhase: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  text?: string; // Optional floating damage or "+1 LIFE" text
}

export interface Crosshair {
  x: number;
  y: number;
  isTargeting: boolean; // Over enemy drone
  isShooting: boolean;
  fireAnimation: number; // 0..1 scale pulse on shoot
}

export interface GameMetrics {
  score: number;
  lives: number;
  maxLives: number;
  level: number;
  dronesDestroyed: number;
  shotsFired: number;
  shotsHit: number;
  accuracy: number;
  status: GameStatus;
}
