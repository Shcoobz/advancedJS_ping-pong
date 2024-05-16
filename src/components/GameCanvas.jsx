import { useEffect, useRef } from 'react';

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

function GameCanvas({ onGameOver }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    contextRef.current = context;

    const isMobile = window.matchMedia('(max-width: 600px)');
    adjustSettingsForMobile(isMobile);

    ballReset();
    renderCanvas();
    animate();

    const handleMouseMove = (e) => {
      playerMoved = true;
      paddleBottomX = e.clientX - canvas.offsetLeft - PADDLE_DIFF;
      paddleBottomX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddleBottomX));
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  function adjustSettingsForMobile(isMobile) {
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

  function renderBackground() {
    contextRef.current.fillStyle = 'black';
    contextRef.current.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  function renderPlayerPaddle() {
    contextRef.current.fillRect(
      paddleBottomX,
      CANVAS_HEIGHT - 20,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );
  }

  function renderComputerPaddle() {
    contextRef.current.fillRect(paddleTopX, 10, PADDLE_WIDTH, PADDLE_HEIGHT);
  }

  function renderPaddles() {
    contextRef.current.fillStyle = 'white';
    renderPlayerPaddle();
    renderComputerPaddle();
  }

  function renderCenterLine() {
    contextRef.current.beginPath();
    contextRef.current.setLineDash(CENTER_LINE_DASH);
    contextRef.current.moveTo(0, CANVAS_HEIGHT / 2);
    contextRef.current.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    contextRef.current.strokeStyle = 'grey';
    contextRef.current.stroke();
  }

  function renderBall() {
    contextRef.current.beginPath();
    contextRef.current.arc(ballX, ballY, BALL_RADIUS, 2 * Math.PI, false);
    contextRef.current.fillStyle = 'white';
    contextRef.current.fill();
  }

  function renderScore() {
    contextRef.current.font = '32px Courier New';
    contextRef.current.fillText(playerScore, 20, CANVAS_HEIGHT / 2 + 50);
    contextRef.current.fillText(computerScore, 20, CANVAS_HEIGHT / 2 - 30);
  }

  function renderCanvas() {
    renderBackground();
    renderPaddles();
    renderCenterLine();
    renderBall();
    renderScore();
  }

  function ballReset() {
    ballX = BALL_START_X;
    ballY = BALL_START_Y;
    speedY = INITIAL_SPEED_Y;
  }

  function ballMove() {
    ballY += -speedY;

    if (playerMoved && paddleContact) {
      ballX += speedX;
    }
  }

  function checkWallCollisions() {
    if (ballX < 0 && speedX < 0) {
      speedX = -speedX;
    }

    if (ballX > CANVAS_WIDTH && speedX > 0) {
      speedX = -speedX;
    }
  }

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

  function checkPaddleCollisions() {
    checkPlayerPaddleCollision();
    checkComputerPaddleCollision();
  }

  function ballBoundaries() {
    checkWallCollisions();
    checkPaddleCollisions();
  }

  function computerAI() {
    let maxPaddleShift = 3 + Math.floor(computerScore / PADDLE_MOVEMENT_INCREMENT);

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

  function gameOver() {
    if (playerScore === WINNING_SCORE || computerScore === WINNING_SCORE) {
      isGameOver = true;
      const winner = playerScore === WINNING_SCORE ? 'Player' : 'Computer';
      onGameOver(winner);
    }
  }

  function animate() {
    renderCanvas();
    ballMove();
    ballBoundaries();
    computerAI();
    gameOver();

    if (!isGameOver) {
      requestAnimationFrame(animate);
    }
  }

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />;
}

export default GameCanvas;
