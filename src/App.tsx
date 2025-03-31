import { ViewPort } from './components/viewport';
import { Navbar } from './components/navbar';
import {
  DEFAULT_VIEWPORT_WIDTH,
  DEFAULT_VIEWPORT_HEIGHT,
  DEFAULT_IMAGE_HEIGHT,
  DEFAULT_IMAGE_WIDTH,
} from './components/viewport/config';

import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <section className="app__content-container">
        <div className="app__content">
          <ViewPort
            width={DEFAULT_VIEWPORT_WIDTH}
            height={DEFAULT_VIEWPORT_HEIGHT}
            imageWidth={DEFAULT_IMAGE_WIDTH}
            imageHeight={DEFAULT_IMAGE_HEIGHT}
            title="Cells Analysis Results"
          />
        </div>
      </section>
    </div>
  );
}

export default App;
