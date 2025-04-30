import { Router } from "express";
// import {
//     getAllProjects,
//     getProjectById,
//     getProjectByBorough,
//     getProjectByNeighborhood,
//     getProjectByFiscalYear,
//     getProjectByDescription,
// } from '../data/projects.js';
import { getAllProjects } from "../data/projects.js";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    const boroughSet = new Set();
    const awardSet = new Set();
    const yearSet = new Set();
    const sponsorSet = new Set();
    const councilDistrictSet = new Set();

    const projects = await getAllProjects();
    projects.forEach((proj) => {
      if (proj.borough_full) boroughSet.add(proj.borough_full);
      if (proj.award_formatted) awardSet.add(proj.award_formatted);
      if (proj.council_district) councilDistrictSet.add(proj.council_district);
      if (proj.fiscal_year) yearSet.add(proj.fiscal_year);
    });

    res.render("projects", {
      title: "Projects",
      projects,
      boroughValues: boroughSet,
      awardValues: awardSet,
      councilDistrict: councilDistrictSet,
      fiscalYears: yearSet,
    });
  } catch (error) {
    console.error("Error loading projects", error);
    res.status(500).render("error");
  }
});

export default router;
