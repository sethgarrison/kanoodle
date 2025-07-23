import { KanoodleGameEngine } from '../src/gameEngine.js'

console.log('🧪 Testing manual piece placement...\n')

const gameEngine = new KanoodleGameEngine()

// Try placing pieces in a simple pattern
const testPlacements = [
  { pieceKey: 'greenSquare', row: 0, col: 0, rotation: 0 },
  { pieceKey: 'yellowT', row: 0, col: 2, rotation: 0 },
  { pieceKey: 'darkPinkL', row: 2, col: 0, rotation: 0 },
  { pieceKey: 'redZigzag', row: 2, col: 3, rotation: 0 },
  { pieceKey: 'greyCross', row: 0, col: 5, rotation: 0 },
  { pieceKey: 'greenL2', row: 2, col: 6, rotation: 0 },
  { pieceKey: 'orangeL', row: 0, col: 8, rotation: 0 },
  { pieceKey: 'darkBlueL', row: 2, col: 9, rotation: 0 },
  { pieceKey: 'lightBlueL', row: 4, col: 0, rotation: 0 },
  { pieceKey: 'whiteL', row: 4, col: 3, rotation: 0 },
  { pieceKey: 'purpleLine', row: 4, col: 5, rotation: 0 },
  { pieceKey: 'lightPinkT', row: 4, col: 7, rotation: 0 }
]

console.log('📋 Testing piece placements:')
console.log('============================')

let successCount = 0
let failCount = 0

testPlacements.forEach((placement, index) => {
  const piece = gameEngine.getPiece(placement.pieceKey)
  console.log(`\n${index + 1}. Trying to place ${piece.name} at (${placement.row}, ${placement.col}) with rotation ${placement.rotation * 90}°`)
  
  if (gameEngine.canPlacePiece(placement.pieceKey, placement.row, placement.col, placement.rotation)) {
    const success = gameEngine.placePiece(placement.pieceKey, placement.row, placement.col, placement.rotation)
    if (success) {
      console.log(`   ✅ Successfully placed ${piece.name}`)
      successCount++
    } else {
      console.log(`   ❌ Failed to place ${piece.name}`)
      failCount++
    }
  } else {
    console.log(`   ❌ Cannot place ${piece.name} at this position`)
    failCount++
  }
})

console.log('\n📊 Results:')
console.log('==========')
console.log(`Successful placements: ${successCount}`)
console.log(`Failed placements: ${failCount}`)
console.log(`Grid filled: ${gameEngine.getGrid().flat().filter(cell => cell !== null).length}/55 cells`)

if (gameEngine.isPuzzleSolved()) {
  console.log('\n🎉 Puzzle solved with manual placement!')
} else {
  console.log('\n💡 Manual placement incomplete. This suggests:')
  console.log('   - The puzzle is very complex')
  console.log('   - Different piece arrangements are needed')
  console.log('   - The search space is extremely large')
}

// Show current grid state
console.log('\n🔍 Current grid state:')
console.log('=====================')
const grid = gameEngine.getGrid()
grid.forEach((row, rowIndex) => {
  const rowStr = row.map(cell => cell ? '█' : '·').join(' ')
  console.log(`Row ${rowIndex}: ${rowStr}`)
}) 