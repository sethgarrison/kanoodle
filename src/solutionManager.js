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

  // Get step-by-step guide for current solution
  getCurrentGuide() {
    return {
      steps: this.manualSolution.map((piece, index) => ({
        stepNumber: index + 1,
        piece: {
          name: piece.pieceKey,
          position: { row: piece.position[0], col: piece.position[1] },
          rotation: piece.rotation,
          flip: piece.flip
        },
        description: `Place ${piece.pieceKey} at position [${piece.position[0]}, ${piece.position[1]}] with rotation ${piece.rotation}${piece.flip ? ' and flipped' : ''}`
      })),
      totalSteps: this.manualSolution.length
    }
  }

  // Get next hint
  getNextHint() {
    const guide = this.getCurrentGuide()
    if (!guide) return null

    if (this.currentHintStep < guide.steps.length) {
      const hint = guide.steps[this.currentHintStep]
      this.currentHintStep++
      return {
        ...hint,
        progress: `${this.currentHintStep}/${guide.totalSteps}`
      }
    }
    return null
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