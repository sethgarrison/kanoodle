import React, { createContext, useContext, useState } from 'react'
import { gameEngine } from '../gameEngine'
import { solutionManager } from '../solutionManager'

const GameContext = createContext()

export const useGameContext = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider')
  }
  return context
}

export const GameProvider = ({ children }) => {
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [draggedPiece, setDraggedPiece] = useState(null)
  const [currentHint, setCurrentHint] = useState(null)
  const [hintPreview, setHintPreview] = useState(null)
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
    } else {
      // Check if there's a piece at this location to remove
      const pieceInfo = gameEngine.getPieceInfoAt(row, col)
      if (pieceInfo) {
        // Remove the piece from the grid
        const pieceKey = Object.keys(gameEngine.getAllPieces()).find(
          key => gameEngine.getPiece(key).name === pieceInfo.piece.name
        )
        
        if (pieceKey && gameEngine.removePiece(pieceKey)) {
          setSelectedPiece(null)
          setDraggedPiece(null)
          updateGameState()
        }
      }
    }
  }

  const handleDragStart = (piece) => {
    setDraggedPiece(piece)
  }

  const getDropZonePreview = (row, col, piece) => {
    if (!piece) return []
    
    const pieceKey = Object.keys(gameEngine.getAllPieces()).find(
      key => gameEngine.getPiece(key).name === piece.name
    )
    
    if (!pieceKey) return []
    
    const rotation = gameEngine.getPieceRotation(pieceKey)
    const flip = gameEngine.getPieceFlip(pieceKey)
    const rotatedCoordinates = gameEngine.getRotatedCoordinates(pieceKey, rotation, flip)
    
    return rotatedCoordinates.map(([pieceRow, pieceCol]) => {
      const gridRow = row + pieceRow
      const gridCol = col + pieceCol
      return [gridRow, gridCol]
    }).filter(([gridRow, gridCol]) => 
      gridRow >= 0 && gridRow < 5 && gridCol >= 0 && gridCol < 11
    )
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
    solutionManager.resetHints() // Reset hint progress
    setSelectedPiece(null)
    setDraggedPiece(null)
    setCurrentHint(null)
    setHintPreview(null)
    updateGameState()
  }

  const handleSolve = () => {
    if (solutionManager.hasSolutions()) {
      const success = solutionManager.applySolution(gameEngine)
      if (success) {
        updateGameState()
      }
    }
  }

  const handleGetHint = () => {
    console.log('Getting hint...')
    console.log('Has solutions:', solutionManager.hasSolutions())
    console.log('Current solution:', solutionManager.getCurrentSolution())
    
    if (!solutionManager.hasSolutions()) {
      return
    }

    // Deselect any currently selected piece when getting a hint
    setSelectedPiece(null)
    setDraggedPiece(null)

    const hint = solutionManager.getNextHint()
    console.log('Got hint:', hint)
    
    if (hint) {
      setCurrentHint(hint)
      
      // Create hint preview
      const pieceData = solutionManager.getCurrentSolution()[hint.stepNumber - 1]
      console.log('Piece data for hint:', pieceData)
      
      if (pieceData) {
        setHintPreview({
          pieceKey: pieceData.pieceKey,
          position: pieceData.position,
          rotation: pieceData.rotation,
          flip: pieceData.flip
        })
      }
    }
  }

  const handleApplyHint = () => {
    if (currentHint) {
      const success = solutionManager.applyStep(gameEngine, currentHint.stepNumber)
      if (success) {
        solutionManager.advanceHint() // Only advance when hint is actually applied
        updateGameState()
        setCurrentHint(null)
        setHintPreview(null)
      }
    }
  }

  const handleResetHints = () => {
    solutionManager.resetHints()
    setCurrentHint(null)
    setHintPreview(null)
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
  }

  const value = {
    // State
    selectedPiece,
    draggedPiece,
    currentHint,
    hintPreview,
    gameState,
    
    // Handlers
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
    handleResetHints,
    handleExportSolution,
    getDropZonePreview,
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
} 