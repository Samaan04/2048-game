# 2048 Game – React Functional Programming Assignment

This project is a **React-based implementation of the classic 2048 puzzle game**, built using **functional programming principles**.  

---

## Objective

The goal of the game is simple — **combine tiles with the same number to reach 2048**.  
Every move merges tiles, adds new ones randomly, and challenges you to keep the board from filling up.

---

## Game Overview

- The game starts with a default **4×4 board** containing two random tiles (2 or 4).
- Use your **arrow keys** or **WASD keys** to move all tiles in a direction.
- When two tiles with the same number collide, they merge into one with their sum.
- After each move, a new tile (2 or 4) appears at a random empty position.
- The game ends when:
  - You reach **2048** (You win), or  
  - There are **no possible moves left** (Game Over).

---

## Features

- Smooth and functional 2048 game logic  
- Configurable board size (default 4×4)  
- Real-time score and best-score tracking  
- Win and game-over detection  
- Restart button for a new game  
- Responsive UI with arrow and WASD key support  
- Built entirely using React functional components and hooks

---

## Functional Programming Highlights

The project focuses on **pure, reusable, and predictable code**, aligning with functional programming principles:

- **Pure Functions**: All game logic (`moveLeft`, `moveRight`, `moveUp`, `moveDown`) are pure functions with no side effects.
- **Immutable State Updates**: The board state is recreated immutably after each move.
- **Declarative UI**: React automatically re-renders when state changes.
- **Hooks Used**:
  - `useState` for managing board, score, and game status  
  - `useEffect` for keyboard event listeners  
  - `useCallback` for memoized logic and state management

---

## Built With

- **React** (Functional Components + Hooks)
- **Vite** (Build tool)
- Modern JavaScript (ES6+)

### Compatibility
- Requires React 16.8+ (for Hooks support)
- Built with latest React 18, but compatible with React 16.8+

### Installation

### Prerequisites
- Node.js 
- npm or yarn

### Steps to Run Locally

1. **Clone the repository**
   ```bash
   git clone [your-repo-link]
   cd 2048-game
   npm install
   npm run dev


2.**Open your browser and visit**
http://localhost:5173/
