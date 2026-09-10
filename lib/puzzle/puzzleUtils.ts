import { BoardState, MoveDirection, PuzzleMove } from './puzzleTypes';

export const GOAL_STATE: BoardState = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export function isPuzzleSolved(state: BoardState): boolean {
  for (let i = 0; i < 9; i++) {
    if (state[i] !== GOAL_STATE[i]) return false;
  }
  return true;
}

export function getEmptyIndex(state: BoardState): number {
  return state.indexOf(0);
}

export function indexToRowCol(index: number): { row: number; col: number } {
  return {
    row: Math.floor(index / 3),
    col: index % 3,
  };
}

export function rowColToIndex(row: number, col: number): number {
  return row * 3 + col;
}

/**
 * Counts the number of inversions in a 3x3 puzzle board (ignoring the 0/empty tile).
 * A pair (state[i], state[j]) is an inversion if i < j and state[i] > state[j] (both != 0).
 */
export function countInversions(state: BoardState): number {
  let inversions = 0;
  const filtered = state.filter((tile) => tile !== 0);
  for (let i = 0; i < filtered.length - 1; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      if (filtered[i] > filtered[j]) {
        inversions++;
      }
    }
  }
  return inversions;
}

/**
 * For standard 3x3 8-puzzle:
 * Since width is odd (3), the puzzle is solvable if and only if the number of inversions is even.
 */
export function isPuzzleSolvable(state: BoardState): boolean {
  return countInversions(state) % 2 === 0;
}

/**
 * Returns all legal moves currently available from the given state.
 * The direction indicates which way the numbered tile moves into the empty space.
 */
export function getLegalMoves(state: BoardState): PuzzleMove[] {
  const emptyIdx = getEmptyIndex(state);
  const { row: emptyRow, col: emptyCol } = indexToRowCol(emptyIdx);
  const moves: PuzzleMove[] = [];

  // Tile ABOVE empty space moving DOWN
  if (emptyRow > 0) {
    const fromIdx = rowColToIndex(emptyRow - 1, emptyCol);
    moves.push({
      tile: state[fromIdx],
      fromIndex: fromIdx,
      toIndex: emptyIdx,
      direction: 'DOWN',
    });
  }

  // Tile BELOW empty space moving UP
  if (emptyRow < 2) {
    const fromIdx = rowColToIndex(emptyRow + 1, emptyCol);
    moves.push({
      tile: state[fromIdx],
      fromIndex: fromIdx,
      toIndex: emptyIdx,
      direction: 'UP',
    });
  }

  // Tile LEFT of empty space moving RIGHT
  if (emptyCol > 0) {
    const fromIdx = rowColToIndex(emptyRow, emptyCol - 1);
    moves.push({
      tile: state[fromIdx],
      fromIndex: fromIdx,
      toIndex: emptyIdx,
      direction: 'RIGHT',
    });
  }

  // Tile RIGHT of empty space moving LEFT
  if (emptyCol < 2) {
    const fromIdx = rowColToIndex(emptyRow, emptyCol + 1);
    moves.push({
      tile: state[fromIdx],
      fromIndex: fromIdx,
      toIndex: emptyIdx,
      direction: 'LEFT',
    });
  }

  return moves;
}

/**
 * Checks if a specific tile index is adjacent to the empty slot and can be moved.
 */
export function canMoveTile(state: BoardState, tileIndex: number): boolean {
  if (tileIndex < 0 || tileIndex > 8 || state[tileIndex] === 0) return false;
  const emptyIdx = getEmptyIndex(state);
  const { row: r1, col: c1 } = indexToRowCol(tileIndex);
  const { row: r2, col: c2 } = indexToRowCol(emptyIdx);
  return (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);
}

/**
 * Moves a tile from fromIndex into the empty space if legal. Returns new BoardState or null.
 */
export function applyMove(state: BoardState, fromIndex: number): BoardState | null {
  if (!canMoveTile(state, fromIndex)) return null;
  const emptyIdx = getEmptyIndex(state);
  const newState = [...state];
  newState[emptyIdx] = state[fromIndex];
  newState[fromIndex] = 0;
  return newState;
}

/**
 * Applies a directional swipe move.
 * If user gestures RIGHT, the tile to the left of the empty slot moves right into the empty slot.
 */
export function applyDirectionMove(state: BoardState, direction: MoveDirection): BoardState | null {
  const legalMoves = getLegalMoves(state);
  const matched = legalMoves.find((m) => m.direction === direction);
  if (!matched) return null;
  return applyMove(state, matched.fromIndex);
}

/**
 * Shuffles the puzzle into a guaranteed solvable state.
 * Supports different difficulty levels by number of legal steps from goal state,
 * or by random solvable permutation.
 */
export function generateSolvableShuffle(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): BoardState {
  if (difficulty === 'hard') {
    let candidate: BoardState;
    do {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 0];
      // Fisher-Yates shuffle
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }
      candidate = numbers;
    } while (!isPuzzleSolvable(candidate) || isPuzzleSolved(candidate));
    return candidate;
  }

  // For easy and medium, perform random legal moves to ensure a fun, solvable puzzle
  const steps = difficulty === 'easy' ? 12 : 28;
  let current: BoardState = [...GOAL_STATE];
  let lastMovedTile = -1;

  for (let s = 0; s < steps; s++) {
    const legal = getLegalMoves(current).filter((m) => m.tile !== lastMovedTile);
    const chosen = legal.length > 0 ? legal[Math.floor(Math.random() * legal.length)] : getLegalMoves(current)[0];
    current = applyMove(current, chosen.fromIndex)!;
    lastMovedTile = chosen.tile;
  }

  // If accidentally ended in solved state, make one more move
  if (isPuzzleSolved(current)) {
    const legal = getLegalMoves(current);
    current = applyMove(current, legal[0].fromIndex)!;
  }

  return current;
}
