import express from 'express';
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getBreakingNews,
  getNewsByCategory,
  incrementNewsClick,
  getTrendingNews
} from '../controllers/newsController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .get(getNews)
  .post(protect, admin, createNews);

router.get('/breaking-news', getBreakingNews);
router.get('/trending-news', getTrendingNews)

router.get('/category/:category', getNewsByCategory);

router.put('/:id/click', incrementNewsClick);

router.route('/:id')
  .get(getNewsById)
  .put(protect, admin, updateNews)
  .delete(protect, admin, deleteNews);

export default router;