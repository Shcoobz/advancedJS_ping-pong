import PropTypes from 'prop-types';

/**
 * Renders the game over screen with the winning message and a play again button.
 * This component is displayed when the game ends and shows who the winner is, providing an option to restart the game.
 * @param {Object} props - The properties passed to the GameOverScreen component.
 * @param {string} winner - The identifier of the winner, required to display who won the game.
 * @param {Function} onPlayAgain - The function to call when the play again button is clicked, to reset the game state.
 */
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
