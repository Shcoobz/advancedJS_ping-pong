import { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import GameOverScreen from './components/GameOverScreen';

function App() {
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  function handleGameOver(winner) {
    setIsGameOver(true);
    setWinner(winner);
  }

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
