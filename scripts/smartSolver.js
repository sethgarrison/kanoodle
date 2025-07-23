import { KanoodleGameEngine } from "../src/gameEngine.js"

console.log('🧠 Smart Solver - Using Geometric Constraints')
console.log('=============================================')

const engine = new KanoodleGameEngine()
const pieces = Object.keys(engine.getAllPieces())

// Analyze which pieces can go in corners
console.log('\n📊 Analyzing piece constraints...')
const constraints = {}

pieces.forEach(pieceKey => {
  const piece = engine.getPiece(pieceKey)
  const coords = piece.coordinates
  
  // More sophisticated analysis
  const maxRow = Math.max(...coords.map(([r, _]) => r))
  const maxCol = Math.max(...coords.map(([_, c]) => c))
  
  // Check if piece is "L-shaped" (good for corners)
  const isLShaped = (maxRow > 0 && maxCol > 0) && 
                    (coords.some(([r, c]) => r === 0 && c > 0) && 
                     coords.some(([r, c]) => r > 0 && c === 0))
  
  // Check if piece is "T-shaped" (bad for corners)
  const isTShaped = coords.some(([r, c]) => r === 0 && c > 0) &&
                   coords.some(([r, c]) => r === 0 && c < maxCol) &&
                   coords.some(([r, c]) => r > 0 && c > 0 && c < maxCol)
  
  // Check if piece is "I-shaped" (line)
  const isIShaped = maxRow === 0 || maxCol === 0
  
  // Check if piece is "Z-shaped" or "S-shaped"
  const isZShaped = coords.some(([r, c]) => r === 0 && c > 0) &&
                   coords.some(([r, c]) => r > 0 && c === 0) &&
                   coords.some(([r, c]) => r > 0 && c > 0)
  
  constraints[pieceKey] = {
    canGoInCorner: isLShaped || (isIShaped && coords.some(([r, c]) => r === 0 && c === 0)),
    isLShaped,
    isTShaped,
    isIShaped,
    isZShaped,
    size: coords.length,
    maxRow,
    maxCol
  }
  
  console.log(`${piece.name}: corner=${constraints[pieceKey].canGoInCorner}, L=${isLShaped}, T=${isTShaped}, I=${isIShaped}, Z=${isZShaped}, size=${coords.length}`)
})

// Sort pieces by constraint (corner pieces first, then by size)
const sortedPieces = pieces.sort((a, b) => {
  const constraintA = constraints[a]
  const constraintB = constraints[b]
  
  // Corner pieces first
  if (constraintA.canGoInCorner && !constraintB.canGoInCorner) return -1
  if (!constraintA.canGoInCorner && constraintB.canGoInCorner) return 1
  
  // Then by size (larger pieces first)
  return constraintB.size - constraintA.size
})

console.log('\n🎯 Sorted pieces (by constraints):')
sortedPieces.forEach((pieceKey, index) => {
  const piece = engine.getPiece(pieceKey)
  const constraint = constraints[pieceKey]
  console.log(`${index + 1}. ${piece.name} (${constraint.size} cells, corner: ${constraint.canGoInCorner})`)
})

console.log('\n💡 Key insights:')
console.log('- Corner pieces should be placed first')
console.log('- L-shaped pieces are good for corners')
console.log('- T-shaped pieces should avoid corners')
console.log('- Larger pieces should be placed before smaller ones')

// Now implement the smart solver
console.log('\n🚀 Starting smart backtracking...')

let attempts = 0
let solutions = []

function smartBacktrack(pieces, depth = 0) {
  attempts++
  
  // Only log progress every 10000 attempts
  if (attempts % 10000 === 0) {
    console.log(`⏳ Depth ${depth}, attempts: ${attempts.toLocaleString()}`)
  }

  // Check if solved
  if (depth === pieces.length) {
    console.log(`🎉 SOLUTION FOUND after ${attempts.toLocaleString()} attempts!`)
    return true
  }

  const currentPiece = pieces[depth]
  const piece = engine.getPiece(currentPiece)
  const constraint = constraints[currentPiece]
  
  // Get valid positions based on constraints
  const validPositions = []
  
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 11; col++) {
      // Skip corners if piece can't go there
      if (!constraint.canGoInCorner && (row === 0 || row === 4) && (col === 0 || col === 10)) {
        continue
      }

      // Check if piece would fit within grid bounds
      const maxRow = row + constraint.maxRow
      const maxCol = col + constraint.maxCol
      if (maxRow >= 5 || maxCol >= 11) {
        continue
      }

      // Try all rotations
      for (let rotation = 0; rotation < 4; rotation++) {
        if (engine.canPlacePiece(currentPiece, row, col, rotation)) {
          validPositions.push({ row, col, rotation })
        }
      }
    }
  }
  
  // Only log when we start a new piece (depth 0) or every 1000 attempts
  if (depth === 0 || attempts % 1000 === 0) {
    console.log(`🔍 ${piece.name}: ${validPositions.length} valid positions (attempt ${attempts.toLocaleString()})`)
  }

  // Try each valid position
  for (const pos of validPositions) {
    engine.placePiece(currentPiece, pos.row, pos.col, pos.rotation)
    
    if (smartBacktrack(pieces, depth + 1)) {
      return true
    }
    
    engine.removePiece(currentPiece)
  }

  return false
}

const startTime = Date.now()
if (smartBacktrack(sortedPieces)) {
  console.log('\n✅ SUCCESS! Found solution in', ((Date.now() - startTime) / 1000).toFixed(1), 'seconds')
  console.log('Total attempts:', attempts.toLocaleString())
} else {
  console.log('\n❌ No solution found')
  console.log('Total attempts:', attempts.toLocaleString())
}
