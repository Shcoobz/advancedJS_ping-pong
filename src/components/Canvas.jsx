import { useEffect, useRef, useState } from 'react';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 700;
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 50;
const PADDLE_DIFF = 25;
const BALL_RADIUS = 5;
const BALL_START_X = CANVAS_WIDTH / 2;
const BALL_START_Y = CANVAS_HEIGHT / 2;
const INITIAL_SPEED_Y = -3;
const MAX_SPEED_Y = 5;
const MIN_SPEED_Y = -5;
const COMPUTER_SPEED_INCREMENT = 0.3;
const WINNING_SCORE = 7;
const PADDLE_MOVEMENT_INCREMENT = 2;
const CENTER_LINE_DASH = [4];

function Canvas({ setGameOver, setWinner }) {
  const canvasRef = useRef(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [paddleBottomX, setPaddleBottomX] = useState((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
  const [paddleTopX, setPaddleTopX] = useState((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
  const [ballX, setBallX] = useState(BALL_START_X);
  const [ballY, setBallY] = useState(BALL_START_Y);
  const [speedY, setSpeedY] = useState(INITIAL_SPEED_Y);
  const [speedX, setSpeedX] = useState(0);
  const [isGameOver, setIsGameOver] = useState(true);
  const [isNewGame, setIsNewGame] = useState(true);

  // Draw the background
  function renderBackground(context) {
    context.fillStyle = 'black';
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Draw the player's paddle
  function renderPlayerPaddle(context) {
    context.fillStyle = 'white';
    context.fillRect(
      paddleBottomX,
      CANVAS_HEIGHT - PADDLE_DIFF,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );
  }

  // Draw the computer's paddle
  function renderComputerPaddle(context) {
    context.fillStyle = 'white';
    context.fillRect(paddleTopX, PADDLE_DIFF, PADDLE_WIDTH, PADDLE_HEIGHT);
  }

  // Draw the center line
  function renderCenterLine(context) {
    context.beginPath();
    context.setLineDash(CENTER_LINE_DASH);
    context.moveTo(0, CANVAS_HEIGHT / 2);
    context.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    context.strokeStyle = 'grey';
    context.stroke();
  }

  // Draw the ball
  function renderBall(context) {
    context.beginPath();
    context.arc(ballX, ballY, BALL_RADIUS, 0, 2 * Math.PI, false);
    context.fillStyle = 'white';
    context.fill();
  }

  // Draw the score
  function renderScore(context) {
    context.fillStyle = 'white';
    context.font = '32px Courier New';
    context.fillText(playerScore, 20, CANVAS_HEIGHT / 2 + 50);
    context.fillText(computerScore, 20, CANVAS_HEIGHT / 2 - 30);
  }

  // Render everything
  function renderCanvas() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    renderBackground(context);
    renderPlayerPaddle(context);
    renderComputerPaddle(context);
    renderCenterLine(context);
    renderBall(context);
    renderScore(context);
  }

  // Move the ball
  function ballMove() {
    setBallY((prev) => prev - speedY);
    if (speedX !== 0) {
      setBallX((prev) => prev + speedX);
    }
  }

  // Check collision with walls
  function checkWallCollisions() {
    if (ballX <= 0 && speedX < 0) {
      setSpeedX(-speedX);
    }
    if (ballX >= CANVAS_WIDTH && speedX > 0) {
      setSpeedX(-speedX);
    }
  }

  // Reset ball to center
  function ballReset() {
    setBallX(BALL_START_X);
    setBallY(BALL_START_Y);
    setSpeedY(INITIAL_SPEED_Y);
    setSpeedX(0);
  }

  // Handle mouse move events
  function handleMouseMove(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    setPaddleBottomX(
      Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2))
    );
  }

  // Game over logic
  function handleGameOver() {
    if (playerScore >= WINNING_SCORE || computerScore >= WINNING_SCORE) {
      setIsGameOver(true);
      setGameOver(true);
      setWinner(playerScore >= WINNING_SCORE ? 'Player' : 'Computer');
    }
  }

  // Animation frame loop
  function animate() {
    if (!isGameOver) {
      renderCanvas();
      ballMove();
      checkWallCollisions();
      handleGameOver();
      requestAnimationFrame(animate);
    }
  }

  // Start the game
  function startGame() {
    setIsGameOver(false);
    setPlayerScore(0);
    setComputerScore(0);
    ballReset();
    animate();
  }

  // UseEffect for setup and teardown
  useEffect(() => {
    startGame();

    return () => {
      // Clean up logic here
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseMove={handleMouseMove}
    />
  );
}

export default Canvas;
