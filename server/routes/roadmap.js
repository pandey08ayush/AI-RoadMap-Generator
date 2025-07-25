import express from 'express';
const router = express.Router();

import { getRoadmaps,getFocusOptions } from '../controllers/roadmap.js';

// Route to get all roadmaps
router.post('/roadmaps', getRoadmaps); // api for a generate the roadmap
router.get('/focus',getFocusOptions); // api for a get focus options


export default router;