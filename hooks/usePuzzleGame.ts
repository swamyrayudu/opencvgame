'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { BoardState, MoveDirection, PuzzleMove, PuzzleSolution } from '../lib/puzzle/puzzleTypes';
import {
  GOAL_STATE,
  isPuzzleSolved,
  applyMove,
  getLegalMoves,
  generateSolvableShuffle,
} from '../lib/puzzle/puzzleUtils';
import { solvePuzzle } from '../lib/puzzle/puzzleSolver';
import { soundEffects } from '../lib/audio/soundEffects';

export function usePuzzleGame() {
  const [board, setBoard] = useState<BoardState>(() => generateSolvableShuffle('easy'));
  const [movesCount, setMovesCount] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [solution, setSolution] = useState<PuzzleSolution | null>(null);
  const [nextRecommendedMove, setNextRecommendedMove] = useState<PuzzleMove | null>(null);
  const [lastMoveWasCorrect, setLastMoveWasCorrect] = useState<boolean>(false);
  const [isAutoSolving, setIsAutoSolving] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const autoSolveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const correctFeedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && !isSolved) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, isSolved]);

  // 2. Clear auto-solve on unmount
  useEffect(() => {
    return () => {
      if (autoSolveTimerRef.current) clearTimeout(autoSolveTimerRef.current);
      if (correctFeedbackTimerRef.current) clearTimeout(correctFeedbackTimerRef.current);
    };
  }, []);

  // 3. Find solution using A*
  const findSolution = useCallback((currentBoard?: BoardState): PuzzleSolution | null => {
    const targetBoard = currentBoard || board;
    if (isPuzzleSolved(targetBoard)) {
      setSolution(null);
      setNextRecommendedMove(null);
      return null;
    }

    const sol = solvePuzzle(targetBoard);
    if (sol.solved && sol.moves.length > 0) {
      setSolution(sol);
      setNextRecommendedMove(sol.moves[0]);
      return sol;
    } else {
      setSolution(null);
      setNextRecommendedMove(null);
      return null;
    }
  }, [board]);

  // 4. Move by tile index
  const makeMove = useCallback(
    (tileIndex: number): boolean => {
      if (isSolved || isAutoSolving) return false;

      // Start timer on first move if not running
      if (!timerRunning) {
        setTimerRunning(true);
      }

      const nextBoard = applyMove(board, tileIndex);
      if (!nextBoard) return false;

      // Check if move matches recommended move
      const wasRecommended = nextRecommendedMove && nextRecommendedMove.fromIndex === tileIndex;
      if (wasRecommended) {
        soundEffects.playCorrectMove();
        setLastMoveWasCorrect(true);
        if (correctFeedbackTimerRef.current) clearTimeout(correctFeedbackTimerRef.current);
        correctFeedbackTimerRef.current = setTimeout(() => {
          setLastMoveWasCorrect(false);
        }, 1200);
      } else {
        soundEffects.playSlide();
      }

      setBoard(nextBoard);
      setMovesCount((prev) => prev + 1);

      // Check if solved
      if (isPuzzleSolved(nextBoard)) {
        setIsSolved(true);
        setTimerRunning(false);
        setSolution(null);
        setNextRecommendedMove(null);
        soundEffects.playVictory();
        return true;
      }

      // If solution guidance was active, update next move
      if (solution && solution.moves.length > 0) {
        // Recalculate optimal next move from the new state
        const updatedSol = solvePuzzle(nextBoard);
        if (updatedSol.solved && updatedSol.moves.length > 0) {
          setSolution(updatedSol);
          setNextRecommendedMove(updatedSol.moves[0]);
        } else {
          setSolution(null);
          setNextRecommendedMove(null);
        }
      }

      return true;
    },
    [board, isSolved, isAutoSolving, timerRunning, nextRecommendedMove, solution]
  );

  // 5. Move by directional gesture
  const makeDirectionMove = useCallback(
    (direction: MoveDirection, preferredTileIndex: number | null = null): boolean => {
      if (isSolved || isAutoSolving) return false;

      const legalMoves = getLegalMoves(board);

      // If a specific tile was selected/hovered and has a legal move matching direction
      if (preferredTileIndex !== null && preferredTileIndex >= 0) {
        const matchingTileMove = legalMoves.find(
          (m) => m.fromIndex === preferredTileIndex && m.direction === direction
        );
        if (matchingTileMove) {
          return makeMove(matchingTileMove.fromIndex);
        }
      }

      // Otherwise find any legal move matching direction
      const matchingDirMove = legalMoves.find((m) => m.direction === direction);
      if (matchingDirMove) {
        return makeMove(matchingDirMove.fromIndex);
      }

      return false;
    },
    [board, isSolved, isAutoSolving, makeMove]
  );

  // 6. Auto Solve runner
  const stopAutoSolve = useCallback(() => {
    setIsAutoSolving(false);
    if (autoSolveTimerRef.current) {
      clearTimeout(autoSolveTimerRef.current);
      autoSolveTimerRef.current = null;
    }
  }, []);

  const startAutoSolve = useCallback(() => {
    if (isSolved) return;

    let currentSol = solution;
    if (!currentSol || currentSol.moves.length === 0) {
      currentSol = findSolution(board);
    }

    if (!currentSol || currentSol.moves.length === 0) return;

    setIsAutoSolving(true);
    setTimerRunning(true);

    let stepIndex = 0;
    const movesToExecute = [...currentSol.moves];
    let currentBoard = [...board];

    const executeNextStep = () => {
      if (stepIndex >= movesToExecute.length) {
        setIsAutoSolving(false);
        setIsSolved(true);
        setTimerRunning(false);
        soundEffects.playVictory();
        return;
      }

      const move = movesToExecute[stepIndex];
      const nextBoard = applyMove(currentBoard, move.fromIndex);

      if (nextBoard) {
        currentBoard = nextBoard;
        setBoard(nextBoard);
        setMovesCount((prev) => prev + 1);
        soundEffects.playSlide();

        stepIndex++;
        if (stepIndex < movesToExecute.length) {
          setNextRecommendedMove(movesToExecute[stepIndex]);
          autoSolveTimerRef.current = setTimeout(executeNextStep, 350);
        } else {
          setIsAutoSolving(false);
          setIsSolved(true);
          setTimerRunning(false);
          setSolution(null);
          setNextRecommendedMove(null);
          soundEffects.playVictory();
        }
      } else {
        setIsAutoSolving(false);
      }
    };

    autoSolveTimerRef.current = setTimeout(executeNextStep, 350);
  }, [isSolved, solution, findSolution, board]);

  // 7. Shuffle
  const shuffle = useCallback(
    (diff: 'easy' | 'medium' | 'hard' = difficulty) => {
      stopAutoSolve();
      soundEffects.playShuffle();
      const newBoard = generateSolvableShuffle(diff);
      setBoard(newBoard);
      setMovesCount(0);
      setTimerSeconds(0);
      setTimerRunning(true);
      setIsSolved(false);
      setSolution(null);
      setNextRecommendedMove(null);
      setLastMoveWasCorrect(false);
      setDifficulty(diff);
    },
    [difficulty, stopAutoSolve]
  );

  // 8. Reset to solved state
  const reset = useCallback(() => {
    stopAutoSolve();
    setBoard([...GOAL_STATE]);
    setMovesCount(0);
    setTimerSeconds(0);
    setTimerRunning(false);
    setIsSolved(true);
    setSolution(null);
    setNextRecommendedMove(null);
    setLastMoveWasCorrect(false);
  }, [stopAutoSolve]);

  return {
    board,
    movesCount,
    timerSeconds,
    isSolved,
    solution,
    nextRecommendedMove,
    lastMoveWasCorrect,
    isAutoSolving,
    difficulty,
    makeMove,
    makeDirectionMove,
    findSolution,
    startAutoSolve,
    stopAutoSolve,
    shuffle,
    reset,
    setDifficulty,
  };
}
