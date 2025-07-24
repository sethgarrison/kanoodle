import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import PieceDisplay from './PieceDisplay'

function PiecesSection({ 
  pieces, 
  availablePieces, 
  selectedPiece, 
  hintPreview,
  onPieceSelect, 
  onRotate, 
  onFlip
}) {
  return (
    <div className="pieces-section">
      <div className="pieces-container">
        <div className="pieces-grid">
          {Object.entries(pieces).map(([key, piece]) => {
            const isSelected = selectedPiece?.name === piece.name
            const isHintPiece = hintPreview && hintPreview.pieceKey === key
            
            // Use hint rotation/flip for hint pieces, otherwise use current piece state
            const rotation = isHintPiece ? hintPreview.rotation : (piece.rotation || 0)
            const flip = isHintPiece ? hintPreview.flip : (piece.flip || false)
            
            return (
              <div key={key} className="piece-wrapper">
                <DraggablePiece
                  pieceKey={key}
                  piece={piece}
                  isSelected={isSelected}
                  isHintPiece={isHintPiece}
                  isAvailable={availablePieces[key]}
                  onPieceSelect={onPieceSelect}
                  rotation={rotation}
                  flip={flip}
                />
                {availablePieces[key] && (
                  <div className="piece-controls">
                    <button
                      className="rotate-button"
                      onClick={() => onRotate(piece)}
                      title="Rotate piece"
                    >
                      🔄
                    </button>
                    <button
                      className="flip-button"
                      onClick={() => onFlip(piece)}
                      title="Flip piece"
                    >
                      ↔️
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Draggable piece component (without controls)
function DraggablePiece({ 
  pieceKey, 
  piece, 
  isSelected, 
  isHintPiece, 
  isAvailable, 
  onPieceSelect, 
  rotation, 
  flip 
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: pieceKey,
    disabled: !isAvailable,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`draggable-piece ${isDragging ? 'dragging' : ''}`}
    >
      <PieceDisplay
        pieceKey={pieceKey}
        piece={piece}
        onClick={onPieceSelect}
        isSelected={isSelected}
        isHintPiece={isHintPiece}
        isAvailable={isAvailable}
        rotation={rotation}
        flip={flip}
      />
    </div>
  )
}

export default PiecesSection 