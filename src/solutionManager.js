import manualSolutionData from './manualSolution.json' assert { type: 'json' }

export class SolutionManager {
  constructor() {
    // Load manual solution
    this.manualSolution = manualSolutionData.solution || []
    this.currentHintStep = 0
  }

  // Get manual solution
  getSolutions() {
    return [this.manualSolution]
  }

  // Get current solution
  getCurrentSolution() {
    return this.manualSolution
  }

  // Convert coordinates to kid-friendly language
  getKidFriendlyPosition(row, col) {
    const rowNames = ['top', 'second', 'third', 'fourth', 'bottom']
    const colNames = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th']
    
    return `${rowNames[row]} row, ${colNames[col]} column`
  }

  // Convert piece names to kid-friendly names
  getKidFriendlyPieceName(pieceKey) {
    const pieceNames = {
      'darkBlueL': 'blue L',
      'orangeL': 'orange L', 
      'darkPinkL': 'pink L',
      'whiteL': 'white L',
      'redZigzag': 'red zigzag',
      'yellowT': 'yellow T',
      'greenSquare': 'green square',
      'purpleLine': 'purple line',
      'lightPinkT': 'light pink T',
      'lightBlueL': 'light blue L',
      'greenL2': 'dark green L',
      'greyCross': 'gray cross'
    }
    
    return pieceNames[pieceKey] || pieceKey
  }

  // Get step-by-step guide for current solution
  getCurrentGuide() {
    return {
      steps: this.manualSolution.map((piece, index) => {
        const position = this.getKidFriendlyPosition(piece.position[0], piece.position[1])
        const rotationText = piece.rotation === 0 ? 'normal' : 
                           piece.rotation === 1 ? 'turned right' : 
                           piece.rotation === 2 ? 'upside down' : 'turned left'
        const flipText = piece.flip ? ' and flip it' : ''
        const pieceName = this.getKidFriendlyPieceName(piece.pieceKey)
        
        return {
          stepNumber: index + 1,
          piece: {
            name: piece.pieceKey,
            position: { row: piece.position[0], col: piece.position[1] },
            rotation: piece.rotation,
            flip: piece.flip
          },
          description: `Put the ${pieceName} in the ${position} ${rotationText}${flipText}`
        }
      }),
      totalSteps: this.manualSolution.length
    }
  }

  // Get next hint
  getNextHint() {
    const guide = this.getCurrentGuide()
    if (!guide) return null

    if (this.currentHintStep < guide.steps.length) {
      const hint = guide.steps[this.currentHintStep]
      return {
        ...hint,
        progress: `${this.currentHintStep + 1}/${guide.totalSteps}`
      }
    }
    return null
  }

  // Advance to next hint (only called when hint is applied)
  advanceHint() {
    this.currentHintStep++
  }

  // Get current hint step
  getCurrentHintStep() {
    return this.currentHintStep
  }

  // Reset hint progress
  resetHints() {
    this.currentHintStep = 0
  }

  // Check if solutions are available
  hasSolutions() {
    return this.manualSolution.length > 0
  }

  // Get total number of solutions
  getTotalSolutions() {
    return 1
  }

  // Get solution statistics
  getSolutionStats() {
    return {
      totalSolutions: 1,
      currentSolution: 1,
      currentHintStep: this.currentHintStep,
      hasSolutions: this.hasSolutions()
    }
  }

  // Apply a solution to the game engine
  applySolution(gameEngine, solutionIndex = null) {
    const solution = this.getCurrentSolution()
    
    if (!solution) return false

    // Reset the game engine
    gameEngine.resetGame()

    // Apply each piece in order
    for (const pieceData of solution) {
      const success = gameEngine.placePiece(
        pieceData.pieceKey,
        pieceData.position[0],
        pieceData.position[1],
        pieceData.rotation,
        pieceData.flip
      )
      
      if (!success) {
        console.error(`Failed to place piece: ${pieceData.pieceKey}`)
        return false
      }
    }

    return true
  }

  // Apply a specific step from the solution
  applyStep(gameEngine, stepNumber) {
    const guide = this.getCurrentGuide()
    if (!guide || stepNumber < 1 || stepNumber > guide.steps.length) {
      return false
    }

    const step = guide.steps[stepNumber - 1]
    const pieceData = this.manualSolution[stepNumber - 1]

    if (!pieceData) return false

    return gameEngine.placePiece(
      pieceData.pieceKey,
      pieceData.position[0],
      pieceData.position[1],
      pieceData.rotation,
      pieceData.flip
    )
  }

  // Get all available hints for current solution
  getAllHints() {
    const guide = this.getCurrentGuide()
    if (!guide) return []

    return guide.steps.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
      isCompleted: index < this.currentHintStep
    }))
  }
}

// Export a singleton instance
export const solutionManager = new SolutionManager() 