import { handleViewportWorkerMessage } from './viewportWorkerHandler.ts';

self.onmessage = handleViewportWorkerMessage; 