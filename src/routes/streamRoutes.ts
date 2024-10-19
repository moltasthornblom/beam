import { Router, Request, Response } from 'express';
import Video from '../models/videoModel';
import { Request as JwtRequest } from 'express-jwt';
import authenticateToken from '../middlewares/authMiddleware';
import checkScope from '../middlewares/scopeMiddleware';
import { validateRequest } from '../validation/validation';
import { listVideosSchema } from '../validation/schemas';

const router = Router();

router.get('/streams', authenticateToken, checkScope('LIST_VIDEOS'), validateRequest(listVideosSchema), (req: JwtRequest, res: Response) => {
  const userId = req.auth?.userId;
  
  Video.find({ user: userId })
    .limit(10)
    .then(videos => {
      if (!videos || videos.length === 0) {
        return res.status(404).send('No videos found for this user');
      }
      res.json(videos);
    })
    .catch(error => {
      res.status(500).send('Internal Server Error');
    });
});

export default router;
