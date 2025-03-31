import { ViewPort } from './components/viewport';
import { Navbar } from './components/navbar';

import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <section className="app-content-container">
        <div className="app-content">
          <ViewPort width={800} height={800} ratio={10} title="Cells Analysis Results" />
        </div>
      </section>
    </div>
  );
}

export default App;
