// Unit test for Hand Shooter collision math and pinch edge detection

import { checkBulletDroneCollision, isPointInDrone, hasDroneCrossedDanger } from '../lib/game/collision.js';
import { HandAimDetector } from '../lib/vision/handAimDetector.js';

console.log('--- RUNNING HAND SHOOTER AUTOMATED TEST SUITE ---');

let passed = 0;
let total = 0;

function assert(condition, name) {
  total++;
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name}`);
  }
}

// 1. Collision Math Tests
const mockDrone = {
  id: 'd1',
  x: 200,
  y: 150,
  width: 44,
  height: 32,
  speed: 1.5,
  type: 'scout',
  health: 1,
  maxHealth: 1,
  color: '#ec4899',
  baseX: 200,
  zigzagPhase: 0,
};

// Direct hit bullet
const hittingBullet = {
  id: 'b1',
  x: 205,
  y: 152,
  vx: 0,
  vy: -10,
  radius: 4.5,
  color: '#38bdf8',
};
assert(checkBulletDroneCollision(hittingBullet, mockDrone), 'Bullet hitting drone detected');

// Miss bullet
const missingBullet = {
  id: 'b2',
  x: 350,
  y: 152,
  vx: 0,
  vy: -10,
  radius: 4.5,
  color: '#38bdf8',
};
assert(!checkBulletDroneCollision(missingBullet, mockDrone), 'Bullet missing drone detected');

// Point inside drone check (crosshair lock-on)
assert(isPointInDrone(200, 150, mockDrone), 'Crosshair inside drone triggers lock-on');
assert(!isPointInDrone(100, 100, mockDrone), 'Crosshair outside drone does not trigger lock-on');

// Danger zone threshold
assert(!hasDroneCrossedDanger(mockDrone, 400), 'Drone above danger line has not crossed');
mockDrone.y = 390;
assert(hasDroneCrossedDanger(mockDrone, 400), 'Drone touching/crossing danger line detected');

// 2. Pinch Edge-Trigger Test
const detector = new HandAimDetector();

// Mock 21 hand landmarks where thumb tip and index tip are far apart (OPEN hand)
const openHand = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
openHand[0] = { x: 0.5, y: 0.8, z: 0 }; // Wrist
openHand[9] = { x: 0.5, y: 0.5, z: 0 }; // Middle MCP (distance = 0.3)
openHand[4] = { x: 0.3, y: 0.4, z: 0 }; // Thumb Tip
openHand[8] = { x: 0.7, y: 0.4, z: 0 }; // Index Tip (distance = 0.4, ratio = 0.4 / 0.3 = 1.33)

const res1 = detector.process(openHand, 0.9, true, 1000);
assert(!res1.isPinching, 'Open hand is not pinching');
assert(!res1.justPinched, 'Open hand did not fire');

// Pinch hand: thumb tip and index tip close together
const pinchedHand = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
pinchedHand[0] = { x: 0.5, y: 0.8, z: 0 };
pinchedHand[9] = { x: 0.5, y: 0.5, z: 0 };
pinchedHand[4] = { x: 0.51, y: 0.4, z: 0 };
pinchedHand[8] = { x: 0.50, y: 0.4, z: 0 }; // distance = 0.01, ratio = 0.01 / 0.3 = 0.033 < 0.38

const res2 = detector.process(pinchedHand, 0.9, true, 1050);
assert(res2.isPinching, 'Pinch detected when fingers are close');
assert(res2.justPinched, 'Fires immediately on initial finger combination');

// Short frame within cooldown (e.g. 50ms): should wait for interval
const res3 = detector.process(pinchedHand, 0.9, true, 1100);
assert(res3.isPinching, 'Still pinching while holding fingers combined');
assert(!res3.justPinched, 'Does not fire within sub-interval frame');

// After rapid-fire interval (1050 + 160 = 1210ms): fires consecutive rapid shot!
const res4 = detector.process(pinchedHand, 0.9, true, 1210);
assert(res4.isPinching, 'Still pinching');
assert(res4.justPinched, 'Rapid fire shoots again when fingers remain combined');

// Release fingers:
const res5 = detector.process(openHand, 0.9, true, 1300);
assert(!res5.isPinching, 'Pinch released when fingers separate');
assert(!res5.justPinched, 'Stops shooting when fingers separate');

// Next tap: fires immediately again
const res6 = detector.process(pinchedHand, 0.9, true, 1500);
assert(res6.isPinching, 'Second pinch detected');
assert(res6.justPinched, 'Fires immediately on new tap');

console.log(`\nRESULTS: ${passed} / ${total} tests passed.`);
if (passed === total) {
  console.log('ALL HAND SHOOTER TESTS PASSED SUCCESSFULLY! ✓');
  process.exit(0);
} else {
  process.exit(1);
}
