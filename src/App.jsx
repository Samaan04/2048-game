import React, { useEffect, useCallback, useState } from 'react';

const createEmptyBoard = (size) => 
  Array.from({ length: size }, () => Array(size).fill(0));

const getEmptyCells = (board) => {
  const emptyCells = [];
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board.length; col++) {
      if (board[row][col] === 0) emptyCells.push([row, col]);
    }
  }
  return emptyCells;
};

const addRandomTile = (board) => {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return board;
  
  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  
  return board.map((r, rIdx) => 
    r.map((cell, cIdx) => 
      rIdx === row && cIdx === col ? value : cell
    )
  );
};

const initializeBoard = (size) => {
  let board = createEmptyBoard(size);
  board = addRandomTile(board);
  board = addRandomTile(board);
  return board;
};

const moveLeft = (board) => {
  let moved = false;
  let scoreGained = 0;
  
  const newBoard = board.map(row => {
    // Remove zeros and merge adjacent equal tiles
    const nonZero = row.filter(cell => cell !== 0);
    const merged = [];
    let i = 0;
    
    while (i < nonZero.length) {
      if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
        // Merge tiles
        const mergedValue = nonZero[i] * 2;
        merged.push(mergedValue);
        scoreGained += mergedValue;
        moved = true;
        i += 2; // Skip next tile since it's merged
      } else {
        // No merge, just move
        merged.push(nonZero[i]);
        if (nonZero[i] !== row[merged.length - 1]) moved = true;
        i += 1;
      }
    }
    
    // Fill remaining spaces with zeros
    while (merged.length < board.length) {
      merged.push(0);
    }
    
    return merged;
  });
  
  return { board: newBoard, moved, scoreGained };
};

const moveRight = (board) => {
  const reversed = board.map(row => [...row].reverse());
  const { board: movedBoard, moved, scoreGained } = moveLeft(reversed);
  return {
    board: movedBoard.map(row => [...row].reverse()),
    moved,
    scoreGained
  };
};

const moveUp = (board) => {
  // Transpose board to work with columns as rows
  const transposed = board[0].map((_, colIndex) => 
    board.map(row => row[colIndex])
  );
  const { board: movedBoard, moved, scoreGained } = moveLeft(transposed);
  // Transpose back
  const result = movedBoard[0].map((_, colIndex) => 
    movedBoard.map(row => row[colIndex])
  );
  return { board: result, moved, scoreGained };
};

const moveDown = (board) => {
  // Transpose board to work with columns as rows
  const transposed = board[0].map((_, colIndex) => 
    board.map(row => row[colIndex])
  );
  const { board: movedBoard, moved, scoreGained } = moveRight(transposed);
  // Transpose back
  const result = movedBoard[0].map((_, colIndex) => 
    movedBoard.map(row => row[colIndex])
  );
  return { board: result, moved, scoreGained };
};

const checkWin = (board) => 
  board.some(row => row.some(cell => cell === 2048));

const canMove = (board) => {
  const size = board.length;
  
  // Check for empty cells
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 0) {
        return true;
      }
    }
  }
  
  // Check for possible merges horizontally
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size - 1; col++) {
      if (board[row][col] === board[row][col + 1]) {
        return true;
      }
    }
  }
  
  // Check for possible merges vertically
  for (let col = 0; col < size; col++) {
    for (let row = 0; row < size - 1; row++) {
      if (board[row][col] === board[row + 1][col]) {
        return true;
      }
    }
  }
  
  return false;
};

const App = () => {
  const [boardSize, setBoardSize] = useState(4);
  const [board, setBoard] = useState(() => initializeBoard(4));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => 
    parseInt(localStorage.getItem('2048-best-score') || '0')
  );
  const [gameStatus, setGameStatus] = useState('playing');

  // Initialize game
  const initializeGame = useCallback((size = boardSize) => {
    const newBoard = initializeBoard(size);
    setBoard(newBoard);
    setScore(0);
    setGameStatus('playing');
  }, [boardSize]);

  // Handle moves
  const makeMove = useCallback((direction) => {
    if (gameStatus !== 'playing') return;

    let result;
    switch (direction) {
      case 'left':
        result = moveLeft(board);
        break;
      case 'right':
        result = moveRight(board);
        break;
      case 'up':
        result = moveUp(board);
        break;
      case 'down':
        result = moveDown(board);
        break;
      default:
        return;
    }

    // If no tiles moved, return early
    if (!result.moved) {
      console.log('No move possible in direction:', direction);
      return;
    }

    // Add new random tile
    const newBoard = addRandomTile(result.board);
    setBoard(newBoard);
    
    // Update score
    setScore(prevScore => {
      const newScore = prevScore + result.scoreGained;
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048-best-score', newScore.toString());
      }
      return newScore;
    });

    // Check win condition
    if (checkWin(newBoard)) {
      setGameStatus('won');
      return;
    }

    // Check lose condition
    if (!canMove(newBoard)) {
      setGameStatus('lost');
    }
  }, [board, gameStatus, bestScore]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      console.log('Key pressed:', event.key); // Debug log
      
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          makeMove('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          makeMove('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          makeMove('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          makeMove('right');
          break;
        default:
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [makeMove]);

  // Handle board size change
  const handleSizeChange = (event) => {
    const newSize = Math.max(2, Math.min(8, parseInt(event.target.value) || 4));
    setBoardSize(newSize);
    initializeGame(newSize);
  };

  // Add button handlers for mobile/touch devices
  const handleSwipe = (direction) => {
    makeMove(direction);
  };

  // Simple styles
  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '500px',
      margin: '0 auto',
      textAlign: 'center'
    },
    header: {
      marginBottom: '20px'
    },
    scores: {
      display: 'flex',
      justifyContent: 'space-around',
      marginBottom: '20px'
    },
    scoreBox: {
      backgroundColor: '#8f7a66',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '5px',
      minWidth: '80px'
    },
    controls: {
      marginBottom: '20px'
    },
    button: {
      backgroundColor: '#8f7a66',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '5px',
      cursor: 'pointer',
      margin: '0 5px',
      fontSize: '16px'
    },
    input: {
      padding: '5px',
      border: '1px solid #ccc',
      borderRadius: '3px',
      margin: '0 10px',
      width: '50px',
      textAlign: 'center'
    },
    board: {
      backgroundColor: '#bbada0',
      padding: '15px',
      borderRadius: '6px',
      display: 'inline-block',
      marginBottom: '20px'
    },
    grid: {
      display: 'grid',
      gap: '10px',
      marginBottom: '20px'
    },
    tile: {
      width: '70px',
      height: '70px',
      borderRadius: '3px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '24px'
    },
    message: {
      padding: '15px',
      borderRadius: '5px',
      marginBottom: '15px',
      fontSize: '18px',
      fontWeight: 'bold'
    },
    win: {
      backgroundColor: '#edc22e',
      color: 'white'
    },
    lose: {
      backgroundColor: '#f78e48',
      color: 'white'
    }
  };

  const getTileColor = (value) => {
    const colors = {
      0: 'rgba(238, 228, 218, 0.35)',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
  };

  const getTileStyle = (value) => ({
    ...styles.tile,
    backgroundColor: getTileColor(value),
    color: value > 4 ? 'white' : '#776e65'
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>2048 Game</h1>
        <p>Use arrow keys or WASD to move tiles</p>
      </div>

      <div style={styles.scores}>
        <div style={styles.scoreBox}>
          <div>SCORE</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{score}</div>
        </div>
        <div style={styles.scoreBox}>
          <div>BEST</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{bestScore}</div>
        </div>
      </div>

      <div style={styles.controls}>
        <button 
          style={styles.button}
          onClick={() => initializeGame()}
        >
          New Game
        </button>
        <label>
          Size: 
          <input
            type="number"
            min="2"
            max="8"
            value={boardSize}
            onChange={handleSizeChange}
            style={styles.input}
          />
        </label>
      </div>

      {/* Direction buttons for testing */}
      <div style={{ marginBottom: '15px' }}>
        <button style={styles.button} onClick={() => makeMove('up')}>↑ Up</button>
        <button style={styles.button} onClick={() => makeMove('down')}>↓ Down</button>
        <button style={styles.button} onClick={() => makeMove('left')}>← Left</button>
        <button style={styles.button} onClick={() => makeMove('right')}>→ Right</button>
      </div>

      {gameStatus === 'won' && (
        <div style={{...styles.message, ...styles.win}}>
          🎉 Congratulations! You reached 2048! 🎉
        </div>
      )}
      
      {gameStatus === 'lost' && (
        <div style={{...styles.message, ...styles.lose}}>
          💀 Game Over! No more moves available.
        </div>
      )}

      <div style={styles.board}>
        <div style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${board.length}, 1fr)`
        }}>
          {board.map((row, rowIndex) => 
            row.map((cell, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`}
                style={getTileStyle(cell)}
              >
                {cell !== 0 ? cell : ''}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ color: '#666', fontSize: '14px' }}>
        <p><strong>How to play:</strong> Use arrow keys or WASD to move tiles.</p>
        <p>When two tiles with the same number touch, they merge into one!</p>
        <p>Reach the <strong>2048 tile or higher</strong> to win!</p>
      </div>
    </div>
  );
};

export default App;
