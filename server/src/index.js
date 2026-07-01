import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { rateCardRouter } from './routes/rateCard.js';
import { estimatesRouter } from './routes/estimates.js';
import './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

app.use('/api/rate-card', rateCardRouter);
app.use('/api/estimates', estimatesRouter);

// In production, serve the built client (npm run build in /client) as static files.
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`AICP bid estimator server listening on http://localhost:${PORT}`);
});
