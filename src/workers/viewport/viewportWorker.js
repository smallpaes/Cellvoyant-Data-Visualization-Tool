import { handleViewportWorkerMessage } from './viewportWorkerHandler';

// Set up message handler
self.onmessage = handleViewportWorkerMessage;