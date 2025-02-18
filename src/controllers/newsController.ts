import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import News from '../models/News';
import moment from "moment"; 
import { newsSchema } from '../schemas';

export const getNews = asyncHandler(async (req: Request, res: Response) => {
  // Get the page and limit from query params, default to page 1 and limit 10 if not provided
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 11;

  // Calculate the number of articles to skip based on the page number
  const skip = (page - 1) * limit;

  // Fetch total count of news articles to calculate total pages
  const totalNewsCount = await News.countDocuments();

  // Get the news with pagination and sorting by date
  const news = await News.find({})
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  // Calculate total pages based on total count and limit
  const totalPages = Math.ceil(totalNewsCount / limit);

  // Return paginated results
  res.json({
    news,
    currentPage: page,
    totalPages,
    totalNewsCount,
  });
});

export const getViralNews = asyncHandler(async (_req: Request, res: Response) => {
  // Get today's date and the date from 10 days ago
  const tenDaysAgo = moment().subtract(10, "days").toISOString();

  // Find news articles that were created within the last 10 days and sort by the number of clicks
  const news = await News.find({
    date: { $gte: tenDaysAgo }, // Only articles from the last 10 days
  })
    .sort({ clicks: -1 })
    .limit(4) // Sort by clicks in descending order (most clicked first)
    .exec();

  // Return the filtered and sorted news
  res.json(news);
});

export const getNewsById = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.findById(req.params.id);
  if (news) {
    res.json(news);
  } else {
    res.status(404).json({ message: 'News not found' });
  }
});

export const getNewsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = req.params.category; // Get the category from URL parameters

  // Limit the number of articles to 4
  const limit = 4;

  // Fetch news articles by category, limit to 4 and sort by date
  const news = await News.find({ category })
    .sort({ date: -1 })
    .limit(limit);

  if (!news.length) {
    res.status(404).json({ message: "No news found for this category" });
  } else {
    res.json(news);
  }
});

export const createNews = asyncHandler(async (req: Request, res: Response) => {
  const newsData = newsSchema.parse(req.body);
  const news = await News.create(newsData);
  res.status(201).json(news);
});

export const updateNews = asyncHandler(async (req: Request, res: Response) => {
  const newsData = newsSchema.parse(req.body);
  const news = await News.findByIdAndUpdate(req.params.id, newsData, {
    new: true,
    runValidators: true
  });

  if (news) {
    res.json(news);
  } else {
    res.status(404).json({ message: 'News not found' });
  }
});

export const deleteNews = asyncHandler(async (req: Request, res: Response) => {
  const news = await News.findByIdAndDelete(req.params.id);
  if (news) {
    res.json({ message: 'News removed' });
  } else {
    res.status(404).json({ message: 'News not found' });
  }
});