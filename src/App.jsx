import { useState, useEffect } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
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
    handleDragEnd,
    handleDragOver,
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
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
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
                  hintPreview={hintPreview}
                  onCellClick={handleCellClick}
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
                <a
                  className="control-link"
                  onClick={handleGetHint}
                >
                  Get Hint
                </a>
                <a
                  className="control-link"
                  onClick={handleReset}
                  tabIndex={0}
                >
                  Reset
                </a>
              </div>
            </div>

            <PiecesSection
              pieces={pieces}
              availablePieces={gameState.availablePieces}
              selectedPiece={selectedPiece}
              hintPreview={hintPreview}
              onPieceSelect={handlePieceSelect}
              onRotate={handlePieceRotate}
              onFlip={handlePieceFlip}
            />
          </div>
        </main>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedPiece ? (
            <div className="drag-overlay">
              <div className="piece-display">
                {/* Show actual piece shape in drag overlay */}
                <div 
                  className="piece-grid"
                  style={{
                    '--piece-color': draggedPiece.color,
                    '--piece-color-dark': getDarkerColor(draggedPiece.color),
                  }}
                >
                  {/* Render the actual piece shape */}
                  {draggedPiece.coordinates.map((coord, index) => (
                    <div 
                      key={index}
                      className="piece-cell filled"
                      style={{
                        gridRow: coord[0] + 1,
                        gridColumn: coord[1] + 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

// Helper function for darker color
function getDarkerColor(color) {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const darkR = Math.max(0, r * 0.7)
  const darkG = Math.max(0, g * 0.7)
  const darkB = Math.max(0, b * 0.7)
  return `rgb(${Math.round(darkR)}, ${Math.round(darkG)}, ${Math.round(darkB)})`
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

export default App
