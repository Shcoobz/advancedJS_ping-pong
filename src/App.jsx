import { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import GameOverScreen from './components/GameOverScreen';

/**
 * The main component that orchestrates the game's logic and UI.
 */
function App() {
  /**
   * State variable indicating whether the game is over.
   * @const {boolean} isGameOver - Indicates if the game has ended.
   */
  const [isGameOver, setIsGameOver] = useState(false);

  /**
   * State variable storing the winner of the game.
   * @const {string|null} winner - Stores the winner's identifier, null if no winner yet.
   */
  const [winner, setWinner] = useState(null);

  /**
   * Handles the end of the game by setting the game over state and the winner.
   * @param {string} winner - The identifier of the game's winner.
   */
  function handleGameOver(winner) {
    setIsGameOver(true);
    setWinner(winner);
  }

  /**
   * Resets the game to its initial state, allowing for a new game to start.
   */
  function handlePlayAgain() {
    setIsGameOver(false);
    setWinner(null);
  }

  return (
    <div>
      {isGameOver ? (
        <GameOverScreen winner={winner} onPlayAgain={handlePlayAgain} />
      ) : (
        <GameCanvas onGameOver={handleGameOver} />
      )}
    </div>
  );
}

export default App;
