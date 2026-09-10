import { Bullet, Drone } from './types';

const FORGIVING_PADDING = 8; // Extra padding so shots near the drone register as clean hits

/**
 * Axis-Aligned Bounding Box (AABB) to Circle collision detection.
 * Checks if a circular bullet intersects with a rectangular enemy drone.
 */
export function checkBulletDroneCollision(bullet: Bullet, drone: Drone): boolean {
  const halfW = drone.width / 2 + FORGIVING_PADDING;
  const halfH = drone.height / 2 + FORGIVING_PADDING;

  // Find the closest point on the expanded drone rectangle to the center of the bullet
  const closestX = Math.max(drone.x - halfW, Math.min(bullet.x, drone.x + halfW));
  const closestY = Math.max(drone.y - halfH, Math.min(bullet.y, drone.y + halfH));

  // Calculate distance between bullet center and closest point
  const distanceX = bullet.x - closestX;
  const distanceY = bullet.y - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  return distanceSquared <= (bullet.radius + 2) * (bullet.radius + 2);
}

/**
 * Checks if a specific point (e.g. crosshair tip) is hovering over a drone.
 */
export function isPointInDrone(px: number, py: number, drone: Drone): boolean {
  const halfW = drone.width / 2 + FORGIVING_PADDING;
  const halfH = drone.height / 2 + FORGIVING_PADDING;

  const left = drone.x - halfW;
  const right = drone.x + halfW;
  const top = drone.y - halfH;
  const bottom = drone.y + halfH;

  return px >= left && px <= right && py >= top && py <= bottom;
}

/**
 * Checks if the bottom of a drone has reached or crossed the danger line.
 */
export function hasDroneCrossedDanger(drone: Drone, dangerY: number): boolean {
  return drone.y + drone.height / 2 >= dangerY;
}
