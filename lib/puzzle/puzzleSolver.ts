import { BoardState, PuzzleMove, PuzzleSolution } from './puzzleTypes';
import { getLegalMoves, applyMove, isPuzzleSolved, isPuzzleSolvable, GOAL_STATE } from './puzzleUtils';

// Precomputed target positions for tiles 1..8
// Goal state is [1, 2, 3, 4, 5, 6, 7, 8, 0]
// Index 0 has tile 1 -> row 0, col 0
// Index 7 has tile 8 -> row 2, col 1
// Index 8 has tile 0 (empty) -> row 2, col 2
const GOAL_POSITIONS: Record<number, { row: number; col: number }> = {
  1: { row: 0, col: 0 },
  2: { row: 0, col: 1 },
  3: { row: 0, col: 2 },
  4: { row: 1, col: 0 },
  5: { row: 1, col: 1 },
  6: { row: 1, col: 2 },
  7: { row: 2, col: 0 },
  8: { row: 2, col: 1 },
};

/**
 * Calculates Manhattan distance heuristic plus linear conflicts for 3x3 sliding puzzle.
 * Manhattan distance is admissible and consistent.
 * Linear conflict adds +2 moves for each pair of tiles in their goal line in inverted order.
 */
export function calculateHeuristic(state: BoardState): number {
  let distance = 0;

  for (let i = 0; i < 9; i++) {
    const tile = state[i];
    if (tile === 0) continue;

    const currentRow = Math.floor(i / 3);
    const currentCol = i % 3;
    const goal = GOAL_POSITIONS[tile];

    distance += Math.abs(currentRow - goal.row) + Math.abs(currentCol - goal.col);
  }

  // Linear conflicts in rows
  for (let row = 0; row < 3; row++) {
    const rowTiles: { tile: number; col: number; goalCol: number }[] = [];
    for (let col = 0; col < 3; col++) {
      const tile = state[row * 3 + col];
      if (tile !== 0 && GOAL_POSITIONS[tile].row === row) {
        rowTiles.push({ tile, col, goalCol: GOAL_POSITIONS[tile].col });
      }
    }
    for (let i = 0; i < rowTiles.length; i++) {
      for (let j = i + 1; j < rowTiles.length; j++) {
        if (rowTiles[i].goalCol > rowTiles[j].goalCol) {
          distance += 2;
        }
      }
    }
  }

  // Linear conflicts in columns
  for (let col = 0; col < 3; col++) {
    const colTiles: { tile: number; row: number; goalRow: number }[] = [];
    for (let row = 0; row < 3; row++) {
      const tile = state[row * 3 + col];
      if (tile !== 0 && GOAL_POSITIONS[tile].col === col) {
        colTiles.push({ tile, row, goalRow: GOAL_POSITIONS[tile].row });
      }
    }
    for (let i = 0; i < colTiles.length; i++) {
      for (let j = i + 1; j < colTiles.length; j++) {
        if (colTiles[i].goalRow > colTiles[j].goalRow) {
          distance += 2;
        }
      }
    }
  }

  return distance;
}

interface Node {
  state: BoardState;
  g: number; // Cost from start
  h: number; // Heuristic to goal
  f: number; // g + h
  parent: Node | null;
  move: PuzzleMove | null;
}

class MinHeap<T extends { f: number; g: number }> {
  private heap: T[] = [];

  push(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  get size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIdx]) < 0) {
        [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
        index = parentIdx;
      } else {
        break;
      }
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChildIdx = 2 * index + 1;
      const rightChildIdx = 2 * index + 2;
      let smallest = index;

      if (leftChildIdx < length && this.compare(this.heap[leftChildIdx], this.heap[smallest]) < 0) {
        smallest = leftChildIdx;
      }
      if (rightChildIdx < length && this.compare(this.heap[rightChildIdx], this.heap[smallest]) < 0) {
        smallest = rightChildIdx;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }

  // Tie-breaker: if f is equal, prefer node with higher g (closer to goal)
  private compare(a: T, b: T): number {
    if (a.f !== b.f) return a.f - b.f;
    return b.g - a.g;
  }
}

/**
 * Solves the 3x3 sliding puzzle using A* search with Manhattan Distance and Linear Conflicts.
 * Returns the optimal sequence of moves.
 */
export function solvePuzzle(initialState: BoardState): PuzzleSolution {
  const startTime = performance.now();

  if (isPuzzleSolved(initialState)) {
    return {
      solved: true,
      moves: [],
      stepsCount: 0,
      path: [initialState],
      solveTimeMs: 0,
    };
  }

  if (!isPuzzleSolvable(initialState)) {
    return {
      solved: false,
      moves: [],
      stepsCount: 0,
      path: [],
      solveTimeMs: performance.now() - startTime,
    };
  }

  const openSet = new MinHeap<Node>();
  const closedSet = new Map<string, number>(); // state key -> best g cost found

  const initialH = calculateHeuristic(initialState);
  openSet.push({
    state: initialState,
    g: 0,
    h: initialH,
    f: initialH,
    parent: null,
    move: null,
  });

  const stateKey = (s: BoardState) => s.join('');
  closedSet.set(stateKey(initialState), 0);

  let targetNode: Node | null = null;
  const maxExplorations = 30000;
  let explored = 0;

  while (openSet.size > 0 && explored < maxExplorations) {
    const current = openSet.pop()!;
    explored++;

    if (isPuzzleSolved(current.state)) {
      targetNode = current;
      break;
    }

    const legalMoves = getLegalMoves(current.state);

    for (const move of legalMoves) {
      const nextState = applyMove(current.state, move.fromIndex);
      if (!nextState) continue;

      const nextKey = stateKey(nextState);
      const nextG = current.g + 1;

      const previousBestG = closedSet.get(nextKey);
      if (previousBestG !== undefined && previousBestG <= nextG) {
        continue;
      }

      closedSet.set(nextKey, nextG);

      const nextH = calculateHeuristic(nextState);
      openSet.push({
        state: nextState,
        g: nextG,
        h: nextH,
        f: nextG + nextH,
        parent: current,
        move,
      });
    }
  }

  const solveTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  if (!targetNode) {
    return {
      solved: false,
      moves: [],
      stepsCount: 0,
      path: [],
      solveTimeMs,
    };
  }

  // Reconstruct path
  const moves: PuzzleMove[] = [];
  const path: BoardState[] = [];
  let curr: Node | null = targetNode;

  while (curr) {
    path.unshift(curr.state);
    if (curr.move) {
      moves.unshift(curr.move);
    }
    curr = curr.parent;
  }

  return {
    solved: true,
    moves,
    stepsCount: moves.length,
    path,
    solveTimeMs,
  };
}
