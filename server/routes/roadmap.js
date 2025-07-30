import express from 'express';
const router = express.Router();

import { getRoadmaps,getFocusOptions,getRoadmapById,sessionControl,getallPersonas ,getPersonaById} from '../controllers/roadmap.js';

// Route to get all roadmaps
router.post('/roadmaps', getRoadmaps); // api for a generate the roadmap
router.get('/focus',getFocusOptions); // api for a get focus options
router.get('/roadmaps/:id', getRoadmapById); // api for a get roadmap by id
router.patch('/roadmaps/:roadmapId/sessions/:sessionIndex', sessionControl); // api for a mark session complete
router.get('/personas',getallPersonas)
router.get('/personas/:id', getPersonaById); // ✅ new route



export default router;