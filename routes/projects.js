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

  res.render("projects", {
    title: "Projects",
    projects,
    boroughValues,
    neighborhoodValues,
    councilDistrict,
    fiscalYears,
    currentPage,
    totalPages,
    selected: filters
  });
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
