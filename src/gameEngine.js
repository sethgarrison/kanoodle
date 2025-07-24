import piecesData from './pieces.json' assert { type: 'json' }

// Game state management
export class KanoodleGameEngine {
  constructor() {
    this.grid = this.createEmptyGrid()
    this.pieces = piecesData.pieces
    this.availablePieces = { ...this.pieces }
    this.placedPieces = []
    this.selectedPiece = null
    this.isSolved = false
    this.pieceRotations = {} // Track rotation state for each piece
    this.pieceFlips = {} // Track flip state for each piece
  }

  // Create empty 5x11 grid
  createEmptyGrid() {
    return Array(5).fill().map(() => Array(11).fill(null))
  }

  // Reset game to initial state
  resetGame() {
    this.grid = this.createEmptyGrid()
    this.availablePieces = { ...this.pieces }
    this.placedPieces = []
    this.selectedPiece = null
    this.isSolved = false
    this.pieceRotations = {}
  }

  // Rotate coordinates 90 degrees clockwise
  rotateCoordinates(coordinates, rotation) {
    if (rotation === 0) return coordinates
    
    let rotated = [...coordinates]
    
    for (let i = 0; i < rotation; i++) {
      rotated = rotated.map(([row, col]) => [col, -row])
    }
    
    // Normalize coordinates (shift to positive)
    const minRow = Math.min(...rotated.map(([r, _]) => r))
    const minCol = Math.min(...rotated.map(([_, c]) => c))
    
    return rotated.map(([row, col]) => [row - minRow, col - minCol])
  }

  // Flip coordinates horizontally
  flipCoordinates(coordinates, flip) {
    if (!flip) return coordinates
    
    const maxCol = Math.max(...coordinates.map(([_, c]) => c))
    return coordinates.map(([row, col]) => [row, maxCol - col])
  }

  // Get rotated and flipped piece coordinates
  getRotatedCoordinates(pieceKey, rotation = 0, flip = false) {
    const piece = this.pieces[pieceKey]
    if (!piece) return []
    
    let coordinates = this.rotateCoordinates(piece.coordinates, rotation)
    coordinates = this.flipCoordinates(coordinates, flip)
    
    return coordinates
  }

  // Rotate a piece
  rotatePiece(pieceKey) {
    const currentRotation = this.pieceRotations[pieceKey] || 0
    this.pieceRotations[pieceKey] = (currentRotation + 1) % 4
    return this.pieceRotations[pieceKey]
  }

  // Get current rotation of a piece
  getPieceRotation(pieceKey) {
    return this.pieceRotations[pieceKey] || 0
  }

  // Flip a piece
  flipPiece(pieceKey) {
    const currentFlip = this.pieceFlips[pieceKey] || false
    this.pieceFlips[pieceKey] = !currentFlip
    return this.pieceFlips[pieceKey]
  }

  // Get current flip state of a piece
  getPieceFlip(pieceKey) {
    return this.pieceFlips[pieceKey] || false
  }

  // Check if a piece can be placed at a specific position with rotation and flip
  canPlacePiece(pieceKey, row, col, rotation = 0, flip = false) {
    const piece = this.pieces[pieceKey]
    if (!piece || !this.availablePieces[pieceKey]) {
      return false
    }

    const rotatedCoordinates = this.getRotatedCoordinates(pieceKey, rotation, flip)

    // Check each coordinate of the rotated piece
    for (const [pieceRow, pieceCol] of rotatedCoordinates) {
      const gridRow = row + pieceRow
      const gridCol = col + pieceCol

      // Check bounds
      if (gridRow < 0 || gridRow >= 5 || gridCol < 0 || gridCol >= 11) {
        return false
      }

      // Check if cell is already occupied
      if (this.grid[gridRow][gridCol] !== null) {
        return false
      }
    }

    return true
  }

  // Get the top-left corner offset for a piece
  getPieceTopLeftOffset(pieceKey, rotation = 0, flip = false) {
    const rotatedCoordinates = this.getRotatedCoordinates(pieceKey, rotation, flip)
    
    if (rotatedCoordinates.length === 0) return [0, 0]
    
    const minRow = Math.min(...rotatedCoordinates.map(([r, _]) => r))
    const minCol = Math.min(...rotatedCoordinates.map(([_, c]) => c))
    
    return [minRow, minCol]
  }

  // Place a piece on the grid with the drop position being the top-left corner
  placePiece(pieceKey, row, col, rotation = 0, flip = false) {
    const currentRotation = this.pieceRotations[pieceKey] || 0
    const currentFlip = this.pieceFlips[pieceKey] || false
    const finalRotation = (currentRotation + rotation) % 4
    const finalFlip = currentFlip !== flip // XOR operation to combine current and new flip
    
    const piece = this.pieces[pieceKey]
    if (!piece || !this.availablePieces[pieceKey]) {
      return false
    }

    const rotatedCoordinates = this.getRotatedCoordinates(pieceKey, finalRotation, finalFlip)
    
    // Calculate the offset to make the drop position the top-left corner
    const [offsetRow, offsetCol] = this.getPieceTopLeftOffset(pieceKey, finalRotation, finalFlip)
    const adjustedRow = row - offsetRow
    const adjustedCol = col - offsetCol
    
    // Check if the adjusted position is valid
    for (const [pieceRow, pieceCol] of rotatedCoordinates) {
      const gridRow = adjustedRow + pieceRow
      const gridCol = adjustedCol + pieceCol

      // Check bounds
      if (gridRow < 0 || gridRow >= 5 || gridCol < 0 || gridCol >= 11) {
        return false
      }

      // Check if cell is already occupied
      if (this.grid[gridRow][gridCol] !== null) {
        return false
      }
    }
    
    // Place the piece on the grid using the adjusted position
    for (const [pieceRow, pieceCol] of rotatedCoordinates) {
      const gridRow = adjustedRow + pieceRow
      const gridCol = adjustedCol + pieceCol
      this.grid[gridRow][gridCol] = pieceKey
    }

    // Remove piece from available pieces
    delete this.availablePieces[pieceKey]
    
    // Add to placed pieces with rotation info
    this.placedPieces.push({
      pieceKey,
      row: adjustedRow,
      col: adjustedCol,
      piece,
      rotation: finalRotation,
      flip: finalFlip
    })

    // Check if puzzle is solved
    this.checkIfSolved()

    return true
  }

  // Place a piece on the grid with exact rotation and flip (for hints)
  placePieceExact(pieceKey, row, col, rotation = 0, flip = false) {
    const piece = this.pieces[pieceKey]
    if (!piece || !this.availablePieces[pieceKey]) {
      return false
    }

    const rotatedCoordinates = this.getRotatedCoordinates(pieceKey, rotation, flip)
    
    // Calculate the offset to make the drop position the top-left corner
    const [offsetRow, offsetCol] = this.getPieceTopLeftOffset(pieceKey, rotation, flip)
    const adjustedRow = row - offsetRow
    const adjustedCol = col - offsetCol
    
    // Check if the adjusted position is valid
    for (const [pieceRow, pieceCol] of rotatedCoordinates) {
      const gridRow = adjustedRow + pieceRow
      const gridCol = adjustedCol + pieceCol

      // Check bounds
      if (gridRow < 0 || gridRow >= 5 || gridCol < 0 || gridCol >= 11) {
        return false
      }

      // Check if cell is already occupied
      if (this.grid[gridRow][gridCol] !== null) {
        return false
      }
    }
    
    // Place the piece on the grid using the adjusted position
    for (const [pieceRow, pieceCol] of rotatedCoordinates) {
      const gridRow = adjustedRow + pieceRow
      const gridCol = adjustedCol + pieceCol
      this.grid[gridRow][gridCol] = pieceKey
    }

    // Remove piece from available pieces
    delete this.availablePieces[pieceKey]
    
    // Add to placed pieces with exact rotation info
    this.placedPieces.push({
      pieceKey,
      row: adjustedRow,
      col: adjustedCol,
      piece,
      rotation: rotation,
      flip: flip
    })

    // Update rotation and flip state to match the placed piece
    this.pieceRotations[pieceKey] = rotation
    this.pieceFlips[pieceKey] = flip

    return true
  }

  // Remove a piece from the grid
  removePiece(pieceKey) {
    // Find the piece in placed pieces
    const placedPieceIndex = this.placedPieces.findIndex(p => p.pieceKey === pieceKey)
    if (placedPieceIndex === -1) {
      return false
    }

    const placedPiece = this.placedPieces[placedPieceIndex]
    const rotatedCoordinates = this.getRotatedCoordinates(pieceKey, placedPiece.rotation, placedPiece.flip)
    
    // Remove from grid
    for (const [pieceRow, pieceCol] of rotatedCoordinates) {
      const gridRow = placedPiece.row + pieceRow
      const gridCol = placedPiece.col + pieceCol
      this.grid[gridRow][gridCol] = null
    }

    // Remove from placed pieces
    this.placedPieces.splice(placedPieceIndex, 1)
    
    // Add back to available pieces
    this.availablePieces[pieceKey] = placedPiece.piece

    // Update solved state
    this.checkIfSolved()

    return true
  }

  // Check if the puzzle is solved (all cells filled)
  checkIfSolved() {
    this.isSolved = this.grid.every(row => row.every(cell => cell !== null))
    return this.isSolved
  }

  // Get available pieces
  getAvailablePieces() {
    return this.availablePieces
  }

  // Get placed pieces
  getPlacedPieces() {
    return this.placedPieces
  }

  // Get current grid state
  getGrid() {
    return this.grid
  }

  // Get piece by key
  getPiece(pieceKey) {
    return this.pieces[pieceKey]
  }

  // Get all pieces
  getAllPieces() {
    return this.pieces
  }

  // Check if puzzle is solved
  isPuzzleSolved() {
    return this.isSolved
  }

  // Get piece at specific grid position
  getPieceAt(row, col) {
    return this.grid[row][col]
  }

  // Get piece info for grid display
  getPieceInfoAt(row, col) {
    const pieceKey = this.grid[row][col]
    if (!pieceKey) return null
    
    return {
      pieceKey,
      piece: this.pieces[pieceKey]
    }
  }

  // Auto-solve algorithm (backtracking) with rotation
  solvePuzzle() {
    this.resetGame()
    return this.backtrackSolve()
  }

  // Backtracking algorithm to find solution with rotation
  backtrackSolve() {
    if (this.isSolved) {
      return true
    }

    const availablePieces = Object.keys(this.availablePieces)
    
    for (const pieceKey of availablePieces) {
      // Try all 4 rotations
      for (let rotation = 0; rotation < 4; rotation++) {
        // Try placing the piece at every possible position
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 11; col++) {
            if (this.canPlacePiece(pieceKey, row, col, rotation)) {
              // Place the piece
              this.placePiece(pieceKey, row, col, rotation)
              
              // Recursively try to solve the rest
              if (this.backtrackSolve()) {
                return true
              }
              
              // If this didn't work, remove the piece and try next position
              this.removePiece(pieceKey)
            }
          }
        }
      }
    }
    
    return false
  }

  // Get solution statistics
  getSolutionStats() {
    return {
      totalPieces: Object.keys(this.pieces).length,
      placedPieces: this.placedPieces.length,
      availablePieces: Object.keys(this.availablePieces).length,
      isSolved: this.isSolved,
      gridFilled: this.grid.flat().filter(cell => cell !== null).length,
      totalCells: 5 * 11
    }
  }
}

// Export a singleton instance
export const gameEngine = new KanoodleGameEngine() 