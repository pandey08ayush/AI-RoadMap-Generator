import express from 'express';
const router = express.Router();

import { getRoadmaps,getFocusOptions } from '../controllers/roadmap.js';

// Route to get all roadmaps
router.post('/roadmaps', getRoadmaps);
router.get('/focus',getFocusOptions)


export default router;