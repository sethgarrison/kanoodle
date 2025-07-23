import React, { useState } from 'react'
import { gameEngine } from '../gameEngine'

function Grid({ 
  grid, 
  selectedPiece, 
  draggedPiece, 
  hintPreview, 
  onCellClick, 
  onDragStart, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
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

  const handleCellDragOver = (e, row, col) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    
    // Show drop zone preview for dragged piece
    if (draggedPiece) {
      const preview = getDropZonePreview(row, col, draggedPiece)
      setDropZonePreview(preview)
    }
    
    onDragOver(e)
  }

  const handleCellDrop = (row, col) => {
    setDropZonePreview([])
    onDrop(row, col)
  }

  const renderGrid = () => {
    // Calculate hint preview cells
    const hintPreviewCells = new Map()
    if (hintPreview) {
      const piece = gameEngine.getPiece(hintPreview.pieceKey)
      if (piece) {
        const rotatedCoordinates = gameEngine.getRotatedCoordinates(
          hintPreview.pieceKey, 
          hintPreview.rotation, 
          hintPreview.flip
        )
        
        for (const [pieceRow, pieceCol] of rotatedCoordinates) {
          const gridRow = hintPreview.position[0] + pieceRow
          const gridCol = hintPreview.position[1] + pieceCol
          if (gridRow >= 0 && gridRow < 5 && gridCol >= 0 && gridCol < 11) {
            hintPreviewCells.set(`${gridRow}-${gridCol}`, piece.color)
          }
        }
      }
    }

    return (
      <div className="grid-container">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => {
              const pieceInfo = gameEngine.getPieceInfoAt(rowIndex, colIndex)
              const hintPreviewColor = hintPreviewCells.get(`${rowIndex}-${colIndex}`)
              const isHintPreviewCell = hintPreviewColor && !pieceInfo
              const isDropZonePreview = dropZonePreview.some(([r, c]) => r === rowIndex && c === colIndex)
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`grid-cell${pieceInfo ? ' filled' : ''}${isHintPreviewCell ? ' hint-preview-cell' : ''}${isDropZonePreview ? ' drop-zone-preview' : ''}`}
                  onClick={() => {
                    if (isHintPreviewCell) {
                      onApplyHint()
                    } else {
                      onCellClick(rowIndex, colIndex)
                    }
                  }}
                  onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                  onMouseLeave={handleCellMouseLeave}
                  onDragOver={(e) => handleCellDragOver(e, rowIndex, colIndex)}
                  onDrop={() => handleCellDrop(rowIndex, colIndex)}
                  onDragLeave={onDragLeave}
                  data-row={rowIndex}
                  data-col={colIndex}
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
                          '--piece-color': selectedPiece?.color || draggedPiece?.color || '#4a5568',
                          '--piece-color-dark': getDarkerColor(selectedPiece?.color || draggedPiece?.color || '#4a5568'),
                          opacity: 0.8,
                          cursor: 'pointer',
                        }
                      : {
                          cursor: selectedPiece || draggedPiece ? 'pointer' : 'default',
                        }
                  }
                >
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return renderGrid()
}

export default Grid 