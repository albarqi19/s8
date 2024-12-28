import express from 'express';
import { displayController } from '../controllers/displayController';

const router = express.Router();

router.post('/display', displayController.updateDisplay.bind(displayController));
router.get('/display-updates', displayController.setupSSE.bind(displayController));
router.get('/current-content', displayController.getCurrentContent.bind(displayController));

export default router;