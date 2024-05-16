import PropTypes from 'prop-types';

function GameOverScreen({ winner, onPlayAgain }) {
  return (
    <div className='game-over-container'>
      <h1>{winner} Wins!</h1>
      <button onClick={onPlayAgain}>Play Again</button>
    </div>
  );
}

GameOverScreen.propTypes = {
  winner: PropTypes.string.isRequired,
  onPlayAgain: PropTypes.func.isRequired,
};

export default GameOverScreen;
