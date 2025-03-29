import { ViewPort } from './components/ViewPort'

import './App.css'

function App() {
  return (
    <div className="app-container">
      <ViewPort 
        width={800}
        height={800}
        ratio={10}
      />
    </div>
  )
}

export default App
