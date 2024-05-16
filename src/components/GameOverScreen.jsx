function GameOverScreen({ winner, onPlayAgain }) {
  return (
    <div className='game-over-container'>
      <h1>{winner} Wins!</h1>
      <button onClick={onPlayAgain}>Play Again</button>
    </div>
  );
}

export default GameOverScreen;
