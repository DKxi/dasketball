// One catch-all Function keeps the Express application in a single bundle and
// preserves request paths such as /api/signup and /api/playoffs/start.
import app from '../server/src/index.js';
export default app;
