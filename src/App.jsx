import { useState, useEffect } from 'react'
import './App.css'
import { gameEngine } from './gameEngine'
import NavBar from './components/NavBar'

import PiecesSection from './components/PiecesSection'
import KanoodleContainer from './components/KanoodleContainer'
import Grid from './components/Grid'
import Confetti from './components/Confetti'

import { GameProvider, useGameContext } from './contexts/GameContext'

function AppContent() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const {
    selectedPiece,
    draggedPiece,
    hintPreview,
    gameState,
    handleCellClick,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePieceSelect,
    handlePieceRotate,
    handlePieceFlip,
    handleReset,
    handleSolve,
    handleGetHint,
    handleApplyHint,
    handleExportSolution,
    getDropZonePreview,
  } = useGameContext()

  const pieces = Object.fromEntries(
    Object.entries(gameEngine.getAllPieces()).map(([key, piece]) => [
      key,
      {
        ...piece,
        rotation: gameEngine.getPieceRotation(key),
        flip: gameEngine.getPieceFlip(key)
      }
    ])
  )

  return (
    <div className="app">
      {gameState.isSolved && <Confetti />}
      <NavBar isSolved={gameState.isSolved} />

      <main className="app-main">
        <div className="game-container">
          <div className="grid-section">
            <KanoodleContainer stats={gameState.stats}>
              <Grid
                grid={gameState.grid}
                selectedPiece={selectedPiece}
                draggedPiece={draggedPiece}
                hintPreview={hintPreview}
                onCellClick={handleCellClick}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onApplyHint={handleApplyHint}
                getDropZonePreview={getDropZonePreview}
              />
            </KanoodleContainer>

            {/* Simple Controls */}
            {hintPreview && (
              <div className="grid-info">
                <p className="hint-status">💡 Click the grayed-out piece to place it!</p>
              </div>
            )}

            <div className="simple-controls">
              <button
                className="control-btn"
                onClick={handleGetHint}
              >
                Get Hint
              </button>

              <button
                className="control-btn"
                onClick={handleReset}
              >
                Reset Puzzle
              </button>
            </div>
          </div>

          <PiecesSection
            pieces={pieces}
            availablePieces={gameState.availablePieces}
            selectedPiece={selectedPiece}
            onPieceSelect={handlePieceSelect}
            onDragStart={handleDragStart}
            onRotate={handlePieceRotate}
            onFlip={handlePieceFlip}
          />
        </div>
      </main>

    </div>
  )
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

export default App
