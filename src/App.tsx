import { ViewPort } from './components/viewport';
import { Navbar } from './components/navbar';
import {
  DEFAULT_VIEWPORT_WIDTH,
  DEFAULT_VIEWPORT_HEIGHT,
  DEFAULT_SCALE_FACTOR,
} from './components/viewport/config';

import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <section className="app-content-container">
        <div className="app-content">
          <ViewPort
            width={DEFAULT_VIEWPORT_WIDTH}
            height={DEFAULT_VIEWPORT_HEIGHT}
            scaleFactor={DEFAULT_SCALE_FACTOR}
            title="Cells Analysis Results"
          />
        </div>
      </section>
    </div>
  );
}

export default App;
