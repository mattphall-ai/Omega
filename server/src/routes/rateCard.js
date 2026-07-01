import { Router } from 'express';
import { getRateCard } from '../rateCard.js';

export const rateCardRouter = Router();

rateCardRouter.get('/', async (req, res) => {
  try {
    res.json(await getRateCard());
  } catch (err) {
    res.status(500).json({ error: `Failed to read rate card: ${err.message}` });
  }
});
