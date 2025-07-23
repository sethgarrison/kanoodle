import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Import the game engine
import { KanoodleGameEngine } from '../src/gameEngine.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class SolutionGenerator {
  constructor() {
    this.gameEngine = new KanoodleGameEngine()
    this.solutions = []
    this.stepByStepGuides = []
    this.maxSolutions = 1 // Just find one solution
    this.startTime = Date.now()
    this.maxTime = null // No timeout
    this.attempts = 0
    this.lastLogTime = Date.now()
  }

  // Find solutions with optimizations
  generateAllSolutions() {
    console.log('🔍 Starting unlimited solution generation...')
    console.log('📊 Total pieces: 12')
    console.log('🎯 Grid size: 5x11 (55 cells)')
    console.log('⚡ Optimizations: Detailed logging, no timeout')
    console.log('🎯 Target: 1 solution')
    console.log('⏳ This will run until a solution is found...\n')

    const startTime = Date.now()
    
    // Reset and start searching
    this.gameEngine.resetGame()
    this.findAllSolutions()
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    console.log(`\n✅ Solution generation complete!`)
    console.log(`⏱️  Time taken: ${duration.toFixed(2)} seconds`)
    console.log(`🎉 Found ${this.solutions.length} solution(s)`)
    console.log(`🔢 Total attempts: ${this.attempts.toLocaleString()}`)
    
    return {
      solutions: this.solutions,
      stepByStepGuides: this.stepByStepGuides,
      metadata: {
        totalSolutions: this.solutions.length,
        generationTime: duration,
        totalAttempts: this.attempts,
        gridSize: '5x11',
        totalPieces: 12,
        totalCells: 55,
        maxSolutions: this.maxSolutions
      }
    }
  }

  // Check if we should stop searching
  shouldStop() {
    const elapsed = Date.now() - this.startTime
    
    // Log progress every 10 seconds
    if (Date.now() - this.lastLogTime > 10000) {
      console.log(`⏳ Still searching... ${elapsed.toFixed(0)}s elapsed, ${this.attempts.toLocaleString()} attempts`)
      this.lastLogTime = Date.now()
    }
    
    return this.solutions.length >= this.maxSolutions
  }

  // Optimized recursive function to find solutions
  findAllSolutions() {
    if (this.shouldStop()) {
      return
    }

    if (this.gameEngine.isPuzzleSolved()) {
      // Found a solution!
      const solution = this.createSolutionData()
      this.solutions.push(solution)
      
      console.log(`🎯 Solution ${this.solutions.length} found after ${this.attempts.toLocaleString()} attempts!`)
      
      // Create step-by-step guide for this solution
      const stepByStepGuide = this.createStepByStepGuide(solution)
      this.stepByStepGuides.push(stepByStepGuide)
      
      return
    }

    const availablePieces = Object.keys(this.gameEngine.availablePieces)
    
    // Sort pieces by size (larger pieces first) for better pruning
    const sortedPieces = availablePieces.sort((a, b) => {
      const pieceA = this.gameEngine.getPiece(a)
      const pieceB = this.gameEngine.getPiece(b)
      
      // Prioritize pieces with more constraints (corners, edges)
      const aConstraints = this.calculateConstraints(pieceA.coordinates)
      const bConstraints = this.calculateConstraints(pieceB.coordinates)
      
      // First by constraints (more constrained pieces first)
      if (aConstraints !== bConstraints) {
        return bConstraints - aConstraints
      }
      
      // Then by size (larger pieces first)
      return pieceB.coordinates.length - pieceA.coordinates.length
    })
    
    for (const pieceKey of sortedPieces) {
      if (this.shouldStop()) break
      
      // Try rotations in order (0°, 90°, 180°, 270°)
      for (let rotation = 0; rotation < 4; rotation++) {
        if (this.shouldStop()) break
        
        // Find valid positions more efficiently
        const validPositions = this.findValidPositions(pieceKey, rotation)
        
        for (const [row, col] of validPositions) {
          if (this.shouldStop()) break
          
          this.attempts++
          
          // Place the piece
          this.gameEngine.placePiece(pieceKey, row, col, rotation)
          
          // Recursively try to find more solutions
          this.findAllSolutions()
          
          // Remove the piece and try next position
          this.gameEngine.removePiece(pieceKey)
        }
      }
    }
  }

  // Calculate how constrained a piece is (higher = more constrained)
  calculateConstraints(coordinates) {
    let constraints = 0
    
    // Check if piece has corners (harder to place)
    coordinates.forEach(([row, col]) => {
      // Corner pieces are more constrained
      if ((row === 0 || row === 4) && (col === 0 || col === 10)) {
        constraints += 3
      }
      // Edge pieces are somewhat constrained
      else if (row === 0 || row === 4 || col === 0 || col === 10) {
        constraints += 1
      }
    })
    
    // Smaller pieces are more constrained
    constraints += (5 - coordinates.length) * 2
    
    return constraints
  }

  // Find valid positions more efficiently
  findValidPositions(pieceKey, rotation) {
    const validPositions = []
    const rotatedCoordinates = this.gameEngine.getRotatedCoordinates(pieceKey, rotation)
    
    // Calculate bounds for this piece
    const maxRow = Math.max(...rotatedCoordinates.map(([r, _]) => r))
    const maxCol = Math.max(...rotatedCoordinates.map(([_, c]) => c))
    
    // Only try positions where the piece could fit
    for (let row = 0; row <= 5 - maxRow - 1; row++) {
      for (let col = 0; col <= 11 - maxCol - 1; col++) {
        if (this.gameEngine.canPlacePiece(pieceKey, row, col, rotation)) {
          validPositions.push([row, col])
        }
      }
    }
    
    return validPositions
  }

  // Create solution data structure
  createSolutionData() {
    const placedPieces = this.gameEngine.getPlacedPieces()
    
    return {
      id: this.solutions.length + 1,
      pieces: placedPieces.map((placed, index) => ({
        step: index + 1,
        pieceKey: placed.pieceKey,
        pieceName: placed.piece.name,
        color: placed.piece.color,
        position: {
          row: placed.row,
          col: placed.col
        },
        rotation: placed.rotation,
        coordinates: this.gameEngine.getRotatedCoordinates(placed.pieceKey, placed.rotation)
      })),
      grid: this.gameEngine.getGrid(),
      stats: this.gameEngine.getSolutionStats()
    }
  }

  // Create step-by-step guide for a solution
  createStepByStepGuide(solution) {
    return {
      solutionId: solution.id,
      steps: solution.pieces.map((piece, index) => ({
        stepNumber: index + 1,
        instruction: `Place the ${piece.pieceName} (${piece.color}) at position (${piece.position.row + 1}, ${piece.position.col + 1}) with rotation ${piece.rotation * 90}°`,
        piece: {
          name: piece.pieceName,
          color: piece.color,
          position: piece.position,
          rotation: piece.rotation,
          coordinates: piece.coordinates
        },
        hint: `Step ${index + 1}: Place the ${piece.pieceName} piece. This piece should be rotated ${piece.rotation * 90} degrees and placed starting at grid position (${piece.position.row + 1}, ${piece.position.col + 1}).`
      })),
      totalSteps: solution.pieces.length
    }
  }

  // Save solutions to file
  saveSolutions(solutionsData) {
    const outputPath = path.join(__dirname, '../src/solutions.json')
    
    try {
      fs.writeFileSync(outputPath, JSON.stringify(solutionsData, null, 2))
      console.log(`💾 Solutions saved to: ${outputPath}`)
      return true
    } catch (error) {
      console.error('❌ Error saving solutions:', error)
      return false
    }
  }

  // Generate and save solutions
  async run() {
    try {
      const solutionsData = this.generateAllSolutions()
      const success = this.saveSolutions(solutionsData)
      
      if (success) {
        console.log('\n🎉 Solution generation completed successfully!')
        console.log(`📁 Solutions file: src/solutions.json`)
        console.log(`📊 Total solutions: ${solutionsData.metadata.totalSolutions}`)
        console.log(`⏱️  Generation time: ${solutionsData.metadata.generationTime.toFixed(2)}s`)
        
        if (solutionsData.metadata.totalSolutions === 0) {
          console.log('\n💡 No solutions found in time limit. Try:')
          console.log('   - Increasing maxTime (currently 30s)')
          console.log('   - Increasing maxSolutions (currently 5)')
          console.log('   - Running without time limit (remove maxTime)')
        }
      } else {
        console.log('\n❌ Failed to save solutions')
      }
    } catch (error) {
      console.error('❌ Error during solution generation:', error)
    }
  }
}

// Run the solution generator
const generator = new SolutionGenerator()
generator.run() 