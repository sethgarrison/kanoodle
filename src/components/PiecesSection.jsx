import React from 'react'
import PieceDisplay from './PieceDisplay'

function PiecesSection({ 
  pieces, 
  availablePieces, 
  selectedPiece, 
  onPieceSelect, 
  onDragStart, 
  onRotate, 
  onFlip 
}) {
  return (
    <div className="pieces-section">
      <div className="pieces-container">
        <div className="pieces-grid">
          {Object.entries(pieces).map(([key, piece]) => (
            <PieceDisplay
              key={key}
              pieceKey={key}
              piece={piece}
              onClick={onPieceSelect}
              onDragStart={onDragStart}
              onRotate={onRotate}
              onFlip={onFlip}
              isSelected={selectedPiece?.name === piece.name}
              isAvailable={availablePieces[key]}
              rotation={piece.rotation || 0}
              flip={piece.flip || false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PiecesSection 