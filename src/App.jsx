import { useState, useEffect } from 'react'
import './App.css'
import { gameEngine } from './gameEngine'
import { solutionManager } from './solutionManager'

function PieceDisplay({ piece, onClick, isSelected, isAvailable, onDragStart, onRotate, onFlip, rotation = 0, flip = false }) {
  const maxRow = Math.max(...piece.coordinates.map(coord => coord[0]))
  const maxCol = Math.max(...piece.coordinates.map(coord => coord[1]))
  const gridSize = Math.max(maxRow + 1, maxCol + 1)
  
  const renderPieceGrid = () => {
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null))
    
    // Apply rotation to coordinates
                    const rotatedCoordinates = gameEngine.getRotatedCoordinates(
                  Object.keys(gameEngine.getAllPieces()).find(key => gameEngine.getPiece(key).name === piece.name),
                  rotation,
                  flip
                )
    
    rotatedCoordinates.forEach(([row, col]) => {
      if (row < gridSize && col < gridSize) {
        grid[row][col] = true
      }
    })
    
    return (
      <div className="piece-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="piece-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`piece-cell ${cell ? 'filled' : ''}`}
                style={{ 
                  backgroundColor: cell ? piece.color : 'transparent',
                  opacity: isAvailable ? 1 : 0.5
                }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const handleDragStart = (e) => {
    if (!isAvailable) {
      e.preventDefault()
      return
    }
    
    e.dataTransfer.setData('text/plain', piece.name)
    e.dataTransfer.effectAllowed = 'copy'
    
    if (onDragStart) {
      onDragStart(piece)
    }
  }

  const handleRotate = (e) => {
    e.stopPropagation()
    if (onRotate) {
      onRotate(piece)
    }
  }

  const handleFlip = (e) => {
    e.stopPropagation()
    if (onFlip) {
      onFlip(piece)
    }
  }

  return (
    <div 
      className={`piece-display ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
      onClick={() => isAvailable && onClick(piece)}
      draggable={isAvailable}
      onDragStart={handleDragStart}
    >
      {renderPieceGrid()}
                        {isAvailable && (
                    <>
                      <button
                        className="rotate-button"
                        onClick={handleRotate}
                        title="Rotate piece"
                      >
                        🔄
                      </button>
                      <button
                        className="flip-button"
                        onClick={handleFlip}
                        title="Flip piece"
                      >
                        ↔️
                      </button>
                    </>
                  )}
    </div>
  )
}

function App() {
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [draggedPiece, setDraggedPiece] = useState(null)
  const [currentHint, setCurrentHint] = useState(null)
  const [showHints, setShowHints] = useState(false)
  const [gameState, setGameState] = useState({
    grid: gameEngine.getGrid(),
    availablePieces: gameEngine.getAvailablePieces(),
    placedPieces: gameEngine.getPlacedPieces(),
    isSolved: gameEngine.isPuzzleSolved(),
    stats: gameEngine.getSolutionStats()
  })

  // Update game state when engine changes
  const updateGameState = () => {
    setGameState({
      grid: gameEngine.getGrid(),
      availablePieces: gameEngine.getAvailablePieces(),
      placedPieces: gameEngine.getPlacedPieces(),
      isSolved: gameEngine.isPuzzleSolved(),
      stats: gameEngine.getSolutionStats()
    })
  }

  const handleCellClick = (row, col) => {
    if (selectedPiece) {
      const pieceKey = Object.keys(gameEngine.getAllPieces()).find(
        key => gameEngine.getPiece(key).name === selectedPiece.name
      )
      
      if (pieceKey && gameEngine.placePiece(pieceKey, row, col)) {
        setSelectedPiece(null)
        updateGameState()
      }
    }
  }

  const handleDragStart = (piece) => {
    setDraggedPiece(piece)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    
    // Add visual feedback for drag-over
    const target = e.currentTarget
    if (draggedPiece && !target.classList.contains('drag-over')) {
      target.classList.add('drag-over')
    }
  }

  const handleDragLeave = (e) => {
    // Remove visual feedback when leaving drop zone
    const target = e.currentTarget
    target.classList.remove('drag-over')
  }

  const handleDrop = (row, col) => {
    if (draggedPiece) {
      const pieceKey = Object.keys(gameEngine.getAllPieces()).find(
        key => gameEngine.getPiece(key).name === draggedPiece.name
      )
      
      if (pieceKey && gameEngine.placePiece(pieceKey, row, col)) {
        setSelectedPiece(null)
        setDraggedPiece(null)
        updateGameState()
        
        // Add drop animation
        const target = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
        if (target) {
          target.classList.add('drop-zone')
          setTimeout(() => {
            target.classList.remove('drop-zone')
          }, 600)
        }
      }
    }
    
    // Clean up drag-over state
    document.querySelectorAll('.grid-cell.drag-over').forEach(cell => {
      cell.classList.remove('drag-over')
    })
  }

  const handlePieceSelect = (piece) => {
    setSelectedPiece(piece)
  }

  const handlePieceRotate = (piece) => {
    const pieceKey = Object.keys(gameEngine.getAllPieces()).find(
      key => gameEngine.getPiece(key).name === piece.name
    )
    
    if (pieceKey) {
      gameEngine.rotatePiece(pieceKey)
      updateGameState()
    }
  }

  const handlePieceFlip = (piece) => {
    const pieceKey = Object.keys(gameEngine.getAllPieces()).find(
      key => gameEngine.getPiece(key).name === piece.name
    )
    
    if (pieceKey) {
      gameEngine.flipPiece(pieceKey)
      updateGameState()
    }
  }

  const handleReset = () => {
    gameEngine.resetGame()
    setSelectedPiece(null)
    setDraggedPiece(null)
    setCurrentHint(null)
    updateGameState()
  }

  const handleSolve = () => {
    if (solutionManager.hasSolutions()) {
      const success = solutionManager.applySolution(gameEngine)
      if (success) {
        updateGameState()
        alert('🎉 Solution applied! All pieces placed perfectly!')
      } else {
        alert('❌ Failed to apply solution')
      }
    } else {
      alert('❌ No solutions available. Run the solution generator first!')
    }
  }

  const handleGetHint = () => {
    if (!solutionManager.hasSolutions()) {
      alert('❌ No solutions available. Run the solution generator first!')
      return
    }

    const hint = solutionManager.getNextHint()
    if (hint) {
      setCurrentHint(hint)
      setShowHints(true)
    } else {
      alert('🎉 No more hints! You\'ve completed all steps!')
    }
  }

  const handleApplyHint = () => {
    if (currentHint) {
      const success = solutionManager.applyStep(gameEngine, currentHint.stepNumber)
      if (success) {
        updateGameState()
        setCurrentHint(null)
        alert(`✅ Applied hint: ${currentHint.description}`)
      } else {
        alert('❌ Failed to apply hint')
      }
    }
  }

  const handleResetHints = () => {
    solutionManager.resetHints()
    setCurrentHint(null)
    setShowHints(false)
  }

  const handleExportSolution = () => {
    const placedPieces = gameEngine.getPlacedPieces()
    const solution = []
    
    placedPieces.forEach(placedPiece => {
      solution.push({
        pieceKey: placedPiece.pieceKey,
        position: [placedPiece.row, placedPiece.col],
        rotation: placedPiece.rotation,
        flip: gameEngine.getPieceFlip(placedPiece.pieceKey)
      })
    })
    
    const solutionData = {
      solution: solution
    }
    
    // Create a downloadable JSON file
    const dataStr = JSON.stringify(solutionData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'kanoodle-solution.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('🎉 Solution exported! Check your downloads folder for "kanoodle-solution.json"')
  }

  const renderGrid = () => {
    return (
      <div className="grid-container">
        {gameState.grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => {
              const pieceInfo = gameEngine.getPieceInfoAt(rowIndex, colIndex)
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="grid-cell"
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(rowIndex, colIndex)}
                  onDragLeave={handleDragLeave}
                  data-row={rowIndex}
                  data-col={colIndex}
                  style={{
                    backgroundColor: pieceInfo ? pieceInfo.piece.color : '#fff',
                    cursor: selectedPiece || draggedPiece ? 'pointer' : 'default'
                  }}
                >
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const renderPieces = () => {
    return (
      <div className="pieces-container">
        <div className="pieces-grid">
          {Object.entries(gameEngine.getAllPieces()).map(([key, piece]) => (
            <PieceDisplay
              key={key}
              piece={piece}
              onClick={handlePieceSelect}
              onDragStart={handleDragStart}
              onRotate={handlePieceRotate}
              onFlip={handlePieceFlip}
              isSelected={selectedPiece?.name === piece.name}
              isAvailable={gameState.availablePieces[key]}
              rotation={gameEngine.getPieceRotation(key)}
              flip={gameEngine.getPieceFlip(key)}
            />
          ))}
        </div>
      </div>
    )
  }

  const renderHintPanel = () => {
    if (!showHints) return null

    return (
      <div className="hint-panel">
        <h3>💡 Hint System</h3>
        {currentHint ? (
          <div className="current-hint">
            <p><strong>Step {currentHint.stepNumber}:</strong> {currentHint.description}</p>
            
            {/* Visual preview of the piece */}
            <div className="hint-preview">
              <h4>Preview:</h4>
              <div className="hint-piece-display">
                {(() => {
                  const pieceKey = currentHint.piece.name
                  const piece = gameEngine.getPiece(pieceKey)
                  if (!piece) return null
                  
                  return (
                    <PieceDisplay
                      piece={piece}
                      rotation={currentHint.piece.rotation}
                      flip={currentHint.piece.flip}
                      isAvailable={true}
                      isSelected={false}
                    />
                  )
                })()}
              </div>
            </div>
            
            <div className="hint-actions">
              <button className="hint-button" onClick={handleApplyHint}>
                ✅ Apply This Hint
              </button>
              <button className="hint-button" onClick={handleGetHint}>
                🔄 Next Hint
              </button>
            </div>
          </div>
        ) : (
          <p>Click "Get Hint" to start receiving step-by-step guidance!</p>
        )}
        <button className="hint-button" onClick={handleResetHints}>
          🔄 Reset Hints
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🧩 Kanoodle Puzzle Solver 🧩</h1>
        <p className="app-subtitle">Let's solve this puzzle together! 🎉</p>
        {gameState.isSolved && (
          <div className="solved-banner">
            🎉 Puzzle Solved! All pieces fit perfectly! 🎉
          </div>
        )}
      </header>
      
      <main className="app-main">
        <div className="game-container">
          <div className="grid-section">
            <h2 className="section-title">🎯 Puzzle Grid (5x11)</h2>
            <div className="grid-info">
              <p>Placed: {gameState.stats.placedPieces}/12 pieces</p>
              <p>Filled: {gameState.stats.gridFilled}/55 cells</p>
              {solutionManager.hasSolutions() && (
                <p>Solutions: {solutionManager.getTotalSolutions()} available</p>
              )}
            </div>
            {renderGrid()}
          </div>
          
          <div className="pieces-section">
            <h2 className="section-title">🧩 Puzzle Pieces</h2>
            <div className="rotation-hint">
              💡 Click 🔄 to rotate or ↔️ to flip pieces
            </div>
            {renderPieces()}
          </div>
        </div>
        
        <div className="controls-section">
          <h2 className="section-title">🎮 Controls</h2>
          <div className="controls">
            <button className="control-button" onClick={handleReset}>
              🔄 Reset Grid
            </button>
            <button className="control-button" onClick={handleSolve}>
              🎯 Show Solution
            </button>
            <button className="control-button" onClick={handleGetHint}>
              💡 Get Hint
            </button>
            <button className="control-button" onClick={() => setShowHints(!showHints)}>
              {showHints ? '🙈 Hide Hints' : '👁️ Show Hints'}
            </button>
            {gameState.isSolved && (
              <button className="control-button export-button" onClick={handleExportSolution}>
                📤 Export Solution
              </button>
            )}
            {(selectedPiece || draggedPiece) && (
              <div className="selected-piece-info">
                {draggedPiece ? `Dragging: ${draggedPiece.name}` : `Selected: ${selectedPiece.name}`}
              </div>
            )}
          </div>
          {renderHintPanel()}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Made with ❤️ for puzzle lovers everywhere!</p>
      </footer>
    </div>
  )
}

export default App
