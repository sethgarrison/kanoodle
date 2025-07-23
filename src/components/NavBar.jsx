import React from 'react'

function NavBar({ isSolved }) {
  return (
    <header className="app-header">
      <div className="nav-kanoodle-lid">
        <h1 className="nav-kanoodle-title">KANOODLE</h1>
        <p className="nav-kanoodle-subtitle">The goal is to fill the grid with all the pieces.</p>
        <p className="nav-kanoodle-subtitle">Can you solve it?</p>

      </div>
      {isSolved && (
        <div className="solved-banner">
          🎉 Puzzle Solved! All pieces fit perfectly! 🎉
        </div>
      )}
    </header>
  )
}

export default NavBar 