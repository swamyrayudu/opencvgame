// Automated test suite for 8-puzzle solvability, legal moves, and A* solver

import { GOAL_STATE, isPuzzleSolved, isPuzzleSolvable, countInversions, getLegalMoves, applyMove, generateSolvableShuffle } from '../lib/puzzle/puzzleUtils.js';
import { solvePuzzle, calculateHeuristic } from '../lib/puzzle/puzzleSolver.js';

console.log('--- STARTING HANDSOLVE AUTOMATED TEST SUITE ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
  }
}

// 1. Goal state tests
assert(isPuzzleSolved(GOAL_STATE), 'Goal state is detected as solved');
assert(isPuzzleSolvable(GOAL_STATE), 'Goal state is solvable');
assert(countInversions(GOAL_STATE) === 0, 'Goal state has 0 inversions');

// 2. Solvability tests
const unsolvableState = [2, 1, 3, 4, 5, 6, 7, 8, 0]; // 1 inversion: (2, 1)
assert(!isPuzzleSolvable(unsolvableState), 'Odd inversions correctly marked unsolvable');

const solvableState = [1, 2, 3, 4, 5, 6, 0, 7, 8];
assert(isPuzzleSolvable(solvableState), 'Even inversions correctly marked solvable');

// 3. Legal moves test
// In GOAL_STATE [1, 2, 3, 4, 5, 6, 7, 8, 0], empty is at index 8 (r=2, c=2)
// Tiles that can move: index 5 (tile 6, moving DOWN) and index 7 (tile 8, moving RIGHT)
const legalMoves = getLegalMoves(GOAL_STATE);
assert(legalMoves.length === 2, 'Goal state has exactly 2 legal moves');
assert(legalMoves.some(m => m.tile === 8 && m.direction === 'RIGHT'), 'Tile 8 can move RIGHT into empty space');
assert(legalMoves.some(m => m.tile === 6 && m.direction === 'DOWN'), 'Tile 6 can move DOWN into empty space');

// 4. Test move execution
const afterMove8 = applyMove(GOAL_STATE, 7);
assert(afterMove8 !== null, 'Move 8 executes successfully');
assert(afterMove8[7] === 0 && afterMove8[8] === 8, 'Tile 8 moved to index 8, index 7 is empty');

// 5. Test A* search on a known configuration (2 moves away)
// Goal: [1, 2, 3, 4, 5, 6, 7, 8, 0]
// Move tile 8 right -> [1, 2, 3, 4, 5, 6, 7, 0, 8]
// Move tile 7 right -> [1, 2, 3, 4, 5, 6, 0, 7, 8]
const testBoard2 = [1, 2, 3, 4, 5, 6, 0, 7, 8];
const sol2 = solvePuzzle(testBoard2);
assert(sol2.solved === true, 'A* solves 2-step board');
assert(sol2.stepsCount === 2, `A* found optimal 2 steps (got ${sol2.stepsCount})`);

// 6. Test A* search on an 8-move shuffled board
const easyBoard = generateSolvableShuffle('easy');
assert(isPuzzleSolvable(easyBoard), 'Easy shuffle is strictly solvable');
const solEasy = solvePuzzle(easyBoard);
assert(solEasy.solved === true, `A* solved easy board in ${solEasy.solveTimeMs}ms`);

// Validate every move in the solution path is legally valid
let replayBoard = [...easyBoard];
let allMovesValid = true;
for (const step of solEasy.moves) {
  const next = applyMove(replayBoard, step.fromIndex);
  if (!next) {
    allMovesValid = false;
    break;
  }
  replayBoard = next;
}
assert(allMovesValid, 'All steps in A* solution are 100% legal moves');
assert(isPuzzleSolved(replayBoard), 'Executing A* solution reaches solved goal state');

// 7. Test medium shuffle
const medBoard = generateSolvableShuffle('medium');
assert(isPuzzleSolvable(medBoard), 'Medium shuffle is strictly solvable');
const solMed = solvePuzzle(medBoard);
assert(solMed.solved === true, `A* solved medium board (${solMed.stepsCount} steps in ${solMed.solveTimeMs}ms)`);

console.log(`\nTEST RESULTS: ${passedTests} / ${totalTests} passed.`);
if (passedTests === totalTests) {
  console.log('ALL TESTS PASSED SUCCESSFULLY! ✓');
  process.exit(0);
} else {
  console.error('SOME TESTS FAILED! ✗');
  process.exit(1);
}
