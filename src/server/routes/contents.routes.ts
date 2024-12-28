import { Router } from 'express';
import { getContents } from '../controllers/contentsController';

const router = Router();

router.get('/contents', getContents);

export default router;