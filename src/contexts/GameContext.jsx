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
    // If a hint is active and the user clicks a cell in the hint preview, place the hint piece
    if (hintPreview) {
      const { pieceKey, position, rotation, flip } = hintPreview
      const [hintRow, hintCol] = position
      // Get all grid cells covered by the hint piece
      const hintCells = gameEngine.getRotatedCoordinates(pieceKey, rotation, flip)
        .map(([pieceRow, pieceCol]) => [hintRow + pieceRow, hintCol + pieceCol])
      // If the clicked cell is in the hint preview
      if (hintCells.some(([r, c]) => r === row && c === col)) {
        const success = gameEngine.placePieceExact(pieceKey, hintRow, hintCol, rotation, flip)
        if (success) {
          solutionManager.advanceHint()
          updateGameState()
          setCurrentHint(null)
          setHintPreview(null)
        }
        return
      }
    }
    // Normal logic
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

  // DnD Kit handlers
  const handleDragStart = (event) => {
    const { active } = event
    const pieceKey = active.id
    const piece = gameEngine.getPiece(pieceKey)
    
    if (piece && gameEngine.getAvailablePieces()[pieceKey]) {
      setDraggedPiece(piece)
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (over && over.id.startsWith('cell-')) {
      const [row, col] = over.id.replace('cell-', '').split('-').map(Number)
      const pieceKey = active.id
      
      if (gameEngine.placePiece(pieceKey, row, col)) {
        setSelectedPiece(null)
        setDraggedPiece(null)
        updateGameState()
      }
    }
    
    setDraggedPiece(null)
  }

  const handleDragOver = (event) => {
    const { over } = event
    if (over && over.id.startsWith('cell-')) {
      // Show drop zone preview
      const [row, col] = over.id.replace('cell-', '').split('-').map(Number)
      if (draggedPiece) {
        // Preview logic can be added here if needed
      }
    }
  }

  const handlePieceSelect = (piece) => {
    // Find the piece key that matches this piece
    const pieceKey = Object.keys(gameEngine.getAllPieces()).find(
      key => gameEngine.getPiece(key).name === piece.name
    )
    
    if (hintPreview && hintPreview.pieceKey === pieceKey) {
      // If this is the hint piece, we should place it automatically
      const success = gameEngine.placePieceExact(
        hintPreview.pieceKey,
        hintPreview.position[0],
        hintPreview.position[1],
        hintPreview.rotation,
        hintPreview.flip
      )
      
      if (success) {
        solutionManager.advanceHint()
        updateGameState()
        setCurrentHint(null)
        setHintPreview(null)
      }
    } else {
      setSelectedPiece(piece)
    }
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
    
    if (!solutionManager.hasSolutions()) {
      return
    }

    // Deselect any currently selected piece when getting a hint
    setSelectedPiece(null)
    setDraggedPiece(null)

    const hint = solutionManager.getNextHint()
    
    if (hint) {
      setCurrentHint(hint)
      
      // Create hint preview
      const pieceData = solutionManager.getCurrentSolution()[hint.stepNumber - 1]
      
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
    handleDragEnd,
    handleDragOver,
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