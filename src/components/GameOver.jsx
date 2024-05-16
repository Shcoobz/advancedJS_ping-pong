function GameOver({ winner, onRestart }) {
  return (
    <div className='game-over-container'>
      <h1>{winner} Wins!</h1>
      <button onClick={onRestart}>Play Again</button>
    </div>
  );
}

export default GameOver;
