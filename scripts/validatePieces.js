import piecesData from '../src/pieces.json' assert { type: 'json' }

console.log('🔍 Validating puzzle pieces...\n')

const pieces = piecesData.pieces
const gridSize = 5 * 11 // 55 cells
let totalPieces = 0
let totalArea = 0

console.log('📊 Piece Analysis:')
console.log('==================')

Object.entries(pieces).forEach(([key, piece]) => {
  const area = piece.coordinates.length
  totalPieces++
  totalArea += area
  
  console.log(`${piece.name}: ${area} cells (${piece.color})`)
})

console.log('\n📈 Summary:')
console.log('==========')
console.log(`Total pieces: ${totalPieces}`)
console.log(`Total area: ${totalArea} cells`)
console.log(`Grid size: ${gridSize} cells`)
console.log(`Difference: ${gridSize - totalArea} cells`)

if (totalArea === gridSize) {
  console.log('\n✅ Perfect! Total piece area equals grid size.')
} else if (totalArea < gridSize) {
  console.log('\n❌ Problem: Total piece area is LESS than grid size.')
  console.log('   This means the puzzle cannot be solved!')
} else {
  console.log('\n❌ Problem: Total piece area is MORE than grid size.')
  console.log('   This means the puzzle cannot be solved!')
}

console.log('\n🔍 Checking piece coordinates:')
console.log('============================')

Object.entries(pieces).forEach(([key, piece]) => {
  console.log(`\n${piece.name}:`)
  piece.coordinates.forEach((coord, index) => {
    console.log(`  ${index + 1}. [${coord[0]}, ${coord[1]}]`)
  })
})

console.log('\n💡 Recommendations:')
if (totalArea !== gridSize) {
  console.log('- Check that all pieces are correctly defined')
  console.log('- Verify that piece coordinates are accurate')
  console.log('- Ensure total area equals exactly 55 cells')
} else {
  console.log('- Piece definitions look correct!')
  console.log('- The puzzle should be solvable')
  console.log('- Try increasing the time limit in the generator')
} 