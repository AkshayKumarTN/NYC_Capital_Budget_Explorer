import { Router } from "express";
import * as ProjectsMethods from '../data/projects.js';

const router = Router();

router.route("/").get(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 500;

  const filters = {
    borough: req.query.borough,
    fy: req.query.fy,
    district: req.query.district,
    neighborhood: req.query.neighborhood,
    sponsor: req.query.sponsor
  };

  const {
    projects, 
    currentPage,
    totalPages,
    boroughValues,
    fiscalYears,
    councilDistrict,
    neighborhoodValues,
  } = await ProjectsMethods.getProjects(page, limit, filters);
  const yearRange = await ProjectsMethods.getFiscalYearRange();

  res.render("projects", {
    title: "Projects",
    projects,
    boroughValues,
    neighborhoodValues,
    councilDistrict,
    fiscalYears,
    currentPage,
    totalPages,
    selected: filters,
    yearRange,
  });
});

router.get('/bar-data', async (req, res) => {
  try {
    const { startYear, endYear, borough, district } = req.query;
    const filters = {
      startYear: parseInt(startYear),
      endYear: parseInt(endYear),
      borough_full: borough,
      council_district: district
    };

    const data = await ProjectsMethods.getTopProjectsByAmount(filters, 10);
    res.json(data);
  } catch (e) {
    console.error('Bar chart data error:', e);
    res.status(500).json({ error: 'Failed to load bar chart data' });
  }
});


router.get('/:id', async (req, res) => {
  const projectId = req.params.id;
  const project = await ProjectsMethods.getProjectById(projectId);
  // const feedbacks = await ProjectsMethods.getLatestFeedbacks(projectId, 10);
  const feedbacks = null;
  // return res.json(projectId);
  res.render('projectDetail', { project, feedbacks });
});

router.post('/projects/:id/feedback', async (req, res) => {
  const projectId = req.params.id;
  const feedbackText = req.body.feedbackText;

  // await saveFeedback(projectId, feedbackText);
});




export default router;
