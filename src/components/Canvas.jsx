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

function Canvas() {
  const canvasRef = useRef(null);
  const [ballX, setBallX] = useState(BALL_START_X);
  const [ballY, setBallY] = useState(BALL_START_Y);
  const [paddleBottomX, setPaddleBottomX] = useState((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
  const [paddleTopX, setPaddleTopX] = useState((CANVAS_WIDTH - PADDLE_WIDTH) / 2);
  const [speedY, setSpeedY] = useState(INITIAL_SPEED_Y);
  const [speedX, setSpeedX] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function render() {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = 'white';
      ctx.fillRect(paddleBottomX, CANVAS_HEIGHT - 20, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(paddleTopX, 10, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.beginPath();
      ctx.setLineDash(CENTER_LINE_DASH);
      ctx.moveTo(0, CANVAS_HEIGHT / 2);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
      ctx.strokeStyle = 'grey';
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = '32px Courier New';
      ctx.fillText(playerScore, 20, CANVAS_HEIGHT / 2 + 50);
      ctx.fillText(computerScore, 20, CANVAS_HEIGHT / 2 - 30);
    }

    function increaseBallSpeedOnHit(isTopPaddle = false) {
      if (isTopPaddle) {
        setSpeedY((prevSpeedY) => {
          let newSpeedY = prevSpeedY + 1;
          return newSpeedY > MAX_SPEED_Y ? MAX_SPEED_Y : newSpeedY;
        });
      } else {
        setSpeedY((prevSpeedY) => {
          let newSpeedY = prevSpeedY - 1;
          return newSpeedY < MIN_SPEED_Y ? MIN_SPEED_Y : newSpeedY;
        });
      }
    }

    function checkGameOver() {
      if (playerScore >= WINNING_SCORE || computerScore >= WINNING_SCORE) {
        setIsGameOver(true);
      }
    }

    function updateGame() {
      if (isGameOver) return;

      setBallX((prevBallX) => {
        let newX = prevBallX + speedX;
        if (newX < 0 || newX > CANVAS_WIDTH) {
          setSpeedX((prevSpeedX) => -prevSpeedX);
        }
        return newX;
      });

      setBallY((prevBallY) => {
        let newY = prevBallY + speedY;
        if (newY < 0 || newY > CANVAS_HEIGHT) {
          setSpeedY((prevSpeedY) => -prevSpeedY);
        }
        return newY;
      });

      // Paddle collisions
      if (ballY > CANVAS_HEIGHT - PADDLE_DIFF - PADDLE_HEIGHT) {
        if (ballX > paddleBottomX && ballX < paddleBottomX + PADDLE_WIDTH) {
          setSpeedY((prevSpeedY) => -prevSpeedY);
          increaseBallSpeedOnHit(false);
          setSpeedX(
            (ballX - (paddleBottomX + PADDLE_WIDTH / 2)) * COMPUTER_SPEED_INCREMENT
          );
        } else if (ballY >= CANVAS_HEIGHT) {
          setComputerScore((score) => score + 1);
          resetBall();
          checkGameOver();
        }
      }

      if (ballY < PADDLE_DIFF) {
        if (ballX > paddleTopX && ballX < paddleTopX + PADDLE_WIDTH) {
          setSpeedY((prevSpeedY) => -prevSpeedY);
          increaseBallSpeedOnHit(true);
        } else if (ballY <= 0) {
          setPlayerScore((score) => score + 1);
          resetBall();
          checkGameOver();
        }
      }

      // Update computer paddle position
      const maxPaddleShift = 3 + Math.floor(computerScore / PADDLE_MOVEMENT_INCREMENT);
      setPaddleTopX((px) => {
        const targetPosition = ballX - PADDLE_DIFF;
        const currentCenter = px + PADDLE_WIDTH / 2;
        let moveAmount =
          Math.sign(targetPosition - currentCenter) *
          Math.min(Math.abs(targetPosition - currentCenter), maxPaddleShift);
        return Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, px + moveAmount));
      });

      render();
    }

    const interval = setInterval(updateGame, 16);
    render();

    return () => clearInterval(interval);
  }, [
    ballX,
    ballY,
    paddleBottomX,
    paddleTopX,
    speedX,
    speedY,
    playerScore,
    computerScore,
    isGameOver,
  ]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      setPaddleBottomX(
        Math.max(
          0,
          Math.min(
            CANVAS_WIDTH - PADDLE_WIDTH,
            event.clientX - rect.left - PADDLE_WIDTH / 2
          )
        )
      );
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  function resetBall() {
    setBallX(BALL_START_X);
    setBallY(BALL_START_Y);
    setSpeedY(INITIAL_SPEED_Y);
    setSpeedX(0);
  }

  useEffect(() => {
    if (!isGameOver) {
      resetBall();
      setPlayerScore(0);
      setComputerScore(0);
      setSpeedY(INITIAL_SPEED_Y);
      setSpeedX(0);
    }
  }, [isGameOver]);

  return (
    <div>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      {isGameOver && (
        <div>
          <div>
            Game Over! {playerScore >= WINNING_SCORE ? 'Player Wins!' : 'Computer Wins!'}
          </div>
          <button onClick={() => setIsGameOver(false)}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default Canvas;
