import express from 'express';
const router = express.Router();

import { getRoadmaps,getFocusOptions,getRoadmapById } from '../controllers/roadmap.js';

// Route to get all roadmaps
router.post('/roadmaps', getRoadmaps); // api for a generate the roadmap
router.get('/focus',getFocusOptions); // api for a get focus options
router.get('/roadmaps/:id', getRoadmapById); // api for a get roadmap by id


export default router;