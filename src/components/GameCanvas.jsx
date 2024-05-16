import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * The width of the canvas where the game is rendered.
 * @const {number} CANVAS_WIDTH - Width of the game canvas, set to 500 pixels.
 */
const CANVAS_WIDTH = 500;

/**
 * The height of the canvas where the game is rendered.
 * @const {number} CANVAS_HEIGHT - Height of the game canvas, set to 700 pixels.
 */
const CANVAS_HEIGHT = 700;

/**
 * Height of the paddles used in the game.
 * @const {number} PADDLE_HEIGHT - Height of each paddle, set to 10 pixels.
 */
const PADDLE_HEIGHT = 10;

/**
 * Width of the paddles used in the game.
 * @const {number} PADDLE_WIDTH - Width of each paddle, set to 50 pixels.
 */
const PADDLE_WIDTH = 50;

/**
 * The difference or margin from the edge used to determine paddle position.
 * @const {number} PADDLE_DIFF - Margin used for paddle positioning calculations, set to 25 pixels.
 */
const PADDLE_DIFF = 25;

/**
 * Radius of the ball used in the game.
 * @const {number} BALL_RADIUS - Radius of the ball, set to 5 pixels.
 */
const BALL_RADIUS = 5;

/**
 * The initial x-coordinate of the ball at the start of the game.
 * @const {number} BALL_START_X - Initial x-coordinate for the ball, calculated to start at the center of the canvas width.
 */
const BALL_START_X = CANVAS_WIDTH / 2;

/**
 * The initial y-coordinate of the ball at the start of the game.
 * @const {number} BALL_START_Y - Initial y-coordinate for the ball, calculated to start at the center of the canvas height.
 */
const BALL_START_Y = CANVAS_HEIGHT / 2;

/**
 * The initial vertical speed of the ball.
 * @const {number} INITIAL_SPEED_Y - Initial vertical speed of the ball, set to -3 to move upwards.
 */
const INITIAL_SPEED_Y = -3;

/**
 * The maximum vertical speed the ball can achieve.
 * @const {number} MAX_SPEED_Y - Maximum vertical speed of the ball, set to 5.
 */
const MAX_SPEED_Y = 5;

/**
 * The minimum vertical speed the ball can achieve.
 * @const {number} MIN_SPEED_Y - Minimum vertical speed of the ball, set to -5.
 */
const MIN_SPEED_Y = -5;

/**
 * The increment used for adjusting the computer paddle's movement.
 * @const {number} COMPUTER_SPEED_INCREMENT - Multiplier for calculating computer paddle's movement speed, set to 0.3.
 */
const COMPUTER_SPEED_INCREMENT = 0.3;

/**
 * The score required to win the game.
 * @const {number} WINNING_SCORE - Winning score for the game, set to 7.
 */
const WINNING_SCORE = 7;

/**
 * The scoring increment that affects computer paddle movement speed.
 * @const {number} PADDLE_MOVEMENT_INCREMENT - Increment for adjusting paddle speed, set to 2 points.
 */
const PADDLE_MOVEMENT_INCREMENT = 2;

/**
 * Style for the center line dash on the canvas.
 * @const {Array<number>} CENTER_LINE_DASH - Array describing the dash pattern for the center line, set to [4].
 */
const CENTER_LINE_DASH = [4];

/**
 * Functional component for rendering the game canvas and handling game logic.
 * @param {Object} props - Properties passed to the component.
 * @param {Function} onGameOver - Callback function when the game is over to communicate the winner.
 */
function GameCanvas({ onGameOver }) {
  /**
   * Reference to the canvas DOM element.
   * @const {Object} canvasRef - React ref that holds the canvas element.
   */
  const canvasRef = useRef(null);

  /**
   * Reference to the canvas' 2D rendering context.
   * @const {Object} contextRef - React ref that holds the canvas' context for drawing.
   */
  const contextRef = useRef(null);

  /**
   * Variable declarations for game state and mechanics.
   */
  let paddleBottomX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
  let paddleTopX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
  let ballX = BALL_START_X;
  let ballY = BALL_START_Y;
  let speedY;
  let speedX;
  let trajectoryX;
  let computerSpeed;
  let playerScore = 0;
  let computerScore = 0;
  let playerMoved = false;
  let paddleContact = false;
  let isGameOver = false;

  const isMobile = window.matchMedia('(max-width: 600px)');

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    contextRef.current = context;

    adjustSettingsForMobile();
    ballReset();
    renderCanvas();
    setupEventListeners();
    animate();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  /**
   * Adjusts game settings for mobile devices by checking the screen width.
   * If the device is mobile, adjusts the speed and computer AI speed accordingly.
   */
  function adjustSettingsForMobile() {
    if (isMobile.matches) {
      speedY = -2;
      speedX = speedY;
      computerSpeed = 4;
    } else {
      speedY = -1;
      speedX = speedY;
      computerSpeed = 3;
    }
  }

  /**
   * Renders the game background on the canvas.
   * Sets the fill color to black and covers the entire canvas area.
   */
  function renderBackground() {
    contextRef.current.fillStyle = 'black';
    contextRef.current.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Renders the player's paddle on the canvas at a specified position.
   * Uses the current x-coordinate of the player's paddle to position it.
   */
  function renderPlayerPaddle() {
    contextRef.current.fillRect(
      paddleBottomX,
      CANVAS_HEIGHT - 20,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );
  }

  /**
   * Renders the computer's paddle on the canvas.
   * Uses the current x-coordinate of the computer's paddle to position it.
   */
  function renderComputerPaddle() {
    contextRef.current.fillRect(paddleTopX, 10, PADDLE_WIDTH, PADDLE_HEIGHT);
  }

  /**
   * Renders both player and computer paddles by calling their respective render functions.
   * Sets the fill color to white before rendering the paddles.
   */
  function renderPaddles() {
    contextRef.current.fillStyle = 'white';
    renderPlayerPaddle();
    renderComputerPaddle();
  }

  /**
   * Renders the dashed center line on the canvas.
   * Sets up the line dash pattern and strokes the line across the center of the canvas.
   */
  function renderCenterLine() {
    contextRef.current.beginPath();
    contextRef.current.setLineDash(CENTER_LINE_DASH);
    contextRef.current.moveTo(0, CANVAS_HEIGHT / 2);
    contextRef.current.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    contextRef.current.strokeStyle = 'grey';
    contextRef.current.stroke();
  }

  /**
   * Renders the ball on the canvas using its current coordinates.
   * The ball is drawn as a white filled circle.
   */
  function renderBall() {
    contextRef.current.beginPath();
    contextRef.current.arc(ballX, ballY, BALL_RADIUS, 2 * Math.PI, false);
    contextRef.current.fillStyle = 'white';
    contextRef.current.fill();
  }

  /**
   * Renders the score for both the player and computer on the canvas.
   * Displays the score in a fixed position using a monospaced font.
   */
  function renderScore() {
    contextRef.current.font = '32px Courier New';
    contextRef.current.fillText(playerScore, 20, CANVAS_HEIGHT / 2 + 50);
    contextRef.current.fillText(computerScore, 20, CANVAS_HEIGHT / 2 - 30);
  }

  /**
   * Calls all render functions to update the canvas. This includes the background,
   * paddles, center line, ball, and score.
   */
  function renderCanvas() {
    renderBackground();
    renderPaddles();
    renderCenterLine();
    renderBall();
    renderScore();
  }

  /**
   * Resets the ball to the center of the canvas with the initial vertical speed.
   * Horizontal speed is reset to zero.
   */
  function ballReset() {
    ballX = BALL_START_X;
    ballY = BALL_START_Y;
    speedY = INITIAL_SPEED_Y;
    speedX = 0;
  }

  /**
   * Updates the position of the ball based on its current speed.
   * Adjusts horizontal position if there has been paddle contact.
   */
  function ballMove() {
    ballY += -speedY;

    if (playerMoved && paddleContact) {
      ballX += speedX;
    }
  }

  /**
   * Checks and handles collisions with the canvas walls.
   * If the ball hits a wall, its horizontal speed is reversed.
   */
  function checkWallCollisions() {
    if (ballX < 0 && speedX < 0) {
      speedX = -speedX;
    }

    if (ballX > CANVAS_WIDTH && speedX > 0) {
      speedX = -speedX;
    }
  }

  /**
   * Increases the ball's speed after hitting a paddle.
   * @param {boolean} isTopPaddle - Whether the top (computer's) paddle was hit.
   */
  function increaseBallSpeedOnHit(isTopPaddle = false) {
    if (playerMoved) {
      if (isTopPaddle) {
        speedY += 1;
        if (speedY > MAX_SPEED_Y) {
          speedY = MAX_SPEED_Y;
        }
      } else {
        speedY -= 1;
        if (speedY < MIN_SPEED_Y) {
          speedY = MIN_SPEED_Y;
          computerSpeed = 6;
        }
      }
    }
  }

  /**
   * Checks for collisions with the player's paddle.
   * If a collision occurs, the ball's direction and speed are adjusted.
   */
  function checkPlayerPaddleCollision() {
    if (ballY > CANVAS_HEIGHT - PADDLE_DIFF) {
      if (ballX > paddleBottomX && ballX < paddleBottomX + PADDLE_WIDTH) {
        paddleContact = true;
        increaseBallSpeedOnHit();
        speedY = -speedY;
        trajectoryX = ballX - (paddleBottomX + PADDLE_DIFF);
        speedX = trajectoryX * COMPUTER_SPEED_INCREMENT;
      } else if (ballY > CANVAS_HEIGHT) {
        ballReset();
        computerScore++;
      }
    }
  }

  /**
   * Checks for collisions with the computer's paddle.
   * If a collision occurs, the ball's direction is adjusted.
   */
  function checkComputerPaddleCollision() {
    if (ballY < PADDLE_DIFF) {
      if (ballX > paddleTopX && ballX < paddleTopX + PADDLE_WIDTH) {
        increaseBallSpeedOnHit(true);
        speedY = -speedY;
      } else if (ballY < 0) {
        ballReset();
        playerScore++;
      }
    }
  }

  /**
   * Aggregates paddle collision checks for both the player and the computer.
   */
  function checkPaddleCollisions() {
    checkPlayerPaddleCollision();
    checkComputerPaddleCollision();
  }

  /**
   * Updates the game state based on the ball's boundaries.
   * Handles wall and paddle collisions.
   */
  function ballBoundaries() {
    checkWallCollisions();
    checkPaddleCollisions();
  }

  /**
   * Implements logic for the computer's paddle movement.
   * The computer paddle aims to align with the ball, adjusted for speed and scoring.
   */
  function computerAI() {
    let maxPaddleShift =
      computerSpeed + Math.floor(computerScore / PADDLE_MOVEMENT_INCREMENT);

    if (playerMoved) {
      const targetPosition = ballX - PADDLE_DIFF;
      const currentCenter = paddleTopX + PADDLE_WIDTH / 2;

      let moveAmount =
        Math.sign(targetPosition - currentCenter) *
        Math.min(Math.abs(targetPosition - currentCenter), maxPaddleShift);

      paddleTopX += moveAmount;
      paddleTopX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddleTopX));
    }
  }

  /**
   * Checks if the game should end based on the score.
   * Triggers the onGameOver callback with the winner's name if the game ends.
   */
  function gameOver() {
    if (playerScore === WINNING_SCORE || computerScore === WINNING_SCORE) {
      isGameOver = true;
      const winner = playerScore === WINNING_SCORE ? 'Player' : 'Computer';
      onGameOver(winner);
    }
  }

  /**
   * Main animation loop for the game.
   * Continuously updates the game state and re-renders the canvas.
   */
  function animate() {
    renderCanvas();
    ballMove();
    ballBoundaries();
    computerAI();
    gameOver();

    if (!isGameOver) {
      window.requestAnimationFrame(animate);
    }
  }

  /**
   * Sets up event listeners for mouse movement to control the player's paddle.
   */
  function setupEventListeners() {
    canvasRef.current.removeEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.style.cursor = 'none';
  }

  /**
   * Handles mouse movement events to update the player's paddle position.
   * @param {MouseEvent} e - The mouse event triggered on mouse move.
   */
  function handleMouseMove(e) {
    playerMoved = true;
    paddleBottomX =
      e.clientX - canvasRef.current.getBoundingClientRect().left - PADDLE_DIFF;
    paddleBottomX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddleBottomX));
  }

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
}

GameCanvas.propTypes = {
  onGameOver: PropTypes.func.isRequired,
};

export default GameCanvas;
