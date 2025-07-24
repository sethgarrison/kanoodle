import React from 'react'
import { gameEngine } from '../gameEngine'

function PieceDisplay({ piece, onClick, isSelected, isHintPiece, isAvailable, rotation = 0, flip = false, pieceKey }) {
  const maxRow = Math.max(...piece.coordinates.map(coord => coord[0]))
  const maxCol = Math.max(...piece.coordinates.map(coord => coord[1]))
  const gridSize = Math.max(maxRow + 1, maxCol + 1)
  
  const getDarkerColor = (color) => {
    // Convert hex to RGB and darken
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Darken by 30%
    const darkR = Math.max(0, r * 0.7)
    const darkG = Math.max(0, g * 0.7)
    const darkB = Math.max(0, b * 0.7)
    
    return `rgb(${Math.round(darkR)}, ${Math.round(darkG)}, ${Math.round(darkB)})`
  }
  
  const renderPieceGrid = () => {
    const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null))
    
    // Apply rotation to coordinates
    const rotatedCoordinates = gameEngine.getRotatedCoordinates(
      pieceKey,
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
                  '--piece-color': piece.color,
                  '--piece-color-dark': getDarkerColor(piece.color),
                  opacity: isAvailable ? 1 : 0.5
                }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  const handleClick = () => {
    if (!isAvailable) return
    if (onClick) {
      onClick(piece)
    }
  }

  return (
    <div 
      className={`piece-display ${isSelected ? 'selected' : ''} ${isHintPiece ? 'hint-piece' : ''} ${!isAvailable ? 'unavailable' : ''}`}
      onClick={handleClick}
    >
      {renderPieceGrid()}
    </div>
  )
}

export default PieceDisplay 