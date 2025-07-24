import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { gameEngine } from '../gameEngine'

function Grid({ 
  grid, 
  selectedPiece, 
  hintPreview, 
  onCellClick, 
  onApplyHint,
  getDropZonePreview
}) {
  const [dropZonePreview, setDropZonePreview] = useState([])
  const [hoveredCell, setHoveredCell] = useState(null)

  const getDarkerColor = (color) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const darkR = Math.max(0, r * 0.7)
    const darkG = Math.max(0, g * 0.7)
    const darkB = Math.max(0, b * 0.7)
    return `rgb(${Math.round(darkR)}, ${Math.round(darkG)}, ${Math.round(darkB)})`
  }

  const handleCellMouseEnter = (row, col) => {
    setHoveredCell([row, col])
    
    // Show drop zone preview for selected piece
    if (selectedPiece) {
      const preview = getDropZonePreview(row, col, selectedPiece)
      setDropZonePreview(preview)
    }
  }

  const handleCellMouseLeave = () => {
    setHoveredCell(null)
    setDropZonePreview([])
  }

  const handleCellClick = (row, col) => {
    if (onCellClick) {
      onCellClick(row, col)
    }
  }

  const renderGrid = () => {
    const hintPreviewCells = new Map()
    
    if (hintPreview) {
      const pieceKey = hintPreview.pieceKey
      const rotation = hintPreview.rotation || 0
      const flip = hintPreview.flip || false
      const [hintRow, hintCol] = hintPreview.position
      
      const rotatedCoordinates = gameEngine.getRotatedCoordinates(pieceKey, rotation, flip)
      
      rotatedCoordinates.forEach(([pieceRow, pieceCol]) => {
        const gridRow = hintRow + pieceRow
        const gridCol = hintCol + pieceCol
        
        if (gridRow >= 0 && gridRow < 5 && gridCol >= 0 && gridCol < 11) {
          const piece = gameEngine.getPiece(pieceKey)
          hintPreviewCells.set(`${gridRow}-${gridCol}`, piece.color)
        }
      })
    }

    return (
      <div 
        className="grid-container"
        style={{ position: 'relative' }}
      >
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => {
              const pieceInfo = gameEngine.getPieceInfoAt(rowIndex, colIndex)
              const hintPreviewColor = hintPreviewCells.get(`${rowIndex}-${colIndex}`)
              const isHintPreviewCell = hintPreviewColor && !pieceInfo
              const isDropZonePreview = dropZonePreview.some(([r, c]) => r === rowIndex && c === colIndex)
              
              return (
                <GridCell
                  key={`${rowIndex}-${colIndex}`}
                  row={rowIndex}
                  col={colIndex}
                  pieceInfo={pieceInfo}
                  isHintPreviewCell={isHintPreviewCell}
                  hintPreviewColor={hintPreviewColor}
                  isDropZonePreview={isDropZonePreview}
                  selectedPiece={selectedPiece}
                  onClick={handleCellClick}
                  onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                  onMouseLeave={handleCellMouseLeave}
                  getDarkerColor={getDarkerColor}
                />
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return renderGrid()
}

// Individual grid cell component with dnd-kit support
function GridCell({ 
  row, 
  col, 
  pieceInfo, 
  isHintPreviewCell, 
  hintPreviewColor, 
  isDropZonePreview, 
  selectedPiece, 
  onClick, 
  onMouseEnter, 
  onMouseLeave, 
  getDarkerColor 
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${row}-${col}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={`grid-cell${pieceInfo ? ' filled' : ''}${isHintPreviewCell ? ' hint-preview-cell' : ''}${isDropZonePreview ? ' drop-zone-preview' : ''}${isOver ? ' drag-over' : ''}`}
      onClick={() => onClick(row, col)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-row={row}
      data-col={col}
      title={pieceInfo ? `Click to remove ${pieceInfo.piece.name}` : ''}
      style={
        pieceInfo
          ? {
              '--piece-color': pieceInfo.piece.color,
              '--piece-color-dark': getDarkerColor(pieceInfo.piece.color),
              cursor: 'pointer',
            }
          : isHintPreviewCell
          ? {
              '--piece-color': hintPreviewColor,
              '--piece-color-dark': getDarkerColor(hintPreviewColor),
              opacity: 0.6,
              cursor: 'pointer',
            }
          : isDropZonePreview
          ? {
              '--piece-color': selectedPiece?.color || '#4a5568',
              '--piece-color-dark': getDarkerColor(selectedPiece?.color || '#4a5568'),
              opacity: 0.8,
              cursor: 'pointer',
            }
          : {
              cursor: selectedPiece ? 'pointer' : 'default',
            }
      }
    >
    </div>
  )
}

export default Grid 