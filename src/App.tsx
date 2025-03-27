// import { CellsCanvas } from './components/CellsCanvas'
import { CellsOffScreenCanvas } from './components/CellsOffScreenCanvas'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <h1>Cells Canvas</h1>
      {/* <CellsCanvas 
        width={1000}
        height={1000}
      /> */}
      <CellsOffScreenCanvas 
        width={1000}
        height={1000}
      />
    </div>
  )
}

export default App
