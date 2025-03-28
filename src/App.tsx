// import { CellsCanvas } from './components/CellsCanvas'
// import { CellsOffScreenCanvas } from './components/CellsOffScreenCanvas'
// import { CellsViewPortCanvas } from './components/CellsViewPortCanvas';
import { CellViewPortOffScreenCanvas } from './components/CellViewPortWorker'
import { useState } from 'react'

import './App.css'

function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="app-container">
      {/* <h1>Cells Canvas</h1> */}
      {/* <CellsCanvas 
        width={1000}
        height={1000}
      /> */}
      {/* <CellsOffScreenCanvas 
        width={1000}
        height={1000}
      /> */}
      {/* <CellsViewPortCanvas 
        width={1000}
        height={1000}
      /> */}
      <CellViewPortOffScreenCanvas 
        width={1000}
        height={1000}
      />
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
      {count}
    </div>
  )
}

export default App
