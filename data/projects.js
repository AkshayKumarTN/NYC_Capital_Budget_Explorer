import { projects, feedbacks } from "../config/mongoCollections.js";

export const getAllProjects = async () => {
  const projectsCollection = await projects();
  let allProjects = await projectsCollection.find().toArray();

  allProjects = allProjects.map((project) => {
    const award = Number(project.award || 0);

    return {
      ...project,
      award_formatted: award.toLocaleString("en-US"),
    };
  });

  return allProjects;
};

export const getProjects = async (page = 1, limit = 500, filters = {}) => {
  const skip = (page - 1) * limit;
  const projectsCollection = await projects();

  const query = {};
  if (filters.borough) query.borough_full = filters.borough;
  if (filters.fy) query.fiscal_year = filters.fy;
  if (filters.district) query.council_district = parseInt(filters.district);
  if (filters.neighborhood) query.neighborhoods = filters.neighborhood;
  if (filters.sponsor)
    query.sponsor = { $regex: filters.sponsor, $options: "i" };

  const total = await projectsCollection.countDocuments(query);
  const allProjects = await projectsCollection
    .find(query)
    .skip(skip)
    .limit(limit)
    .toArray();

  const pages = Math.ceil(total / limit);
  const boroughValues = await projectsCollection.distinct("borough_full");
  const fiscalYears = await projectsCollection.distinct("fiscal_year");
  const councilDistrict = await projectsCollection.distinct("council_district");
  let neighborhoodValues = await projectsCollection.distinct("neighborhoods");
  neighborhoodValues = neighborhoodValues
    .filter((n) => typeof n === "string" && n.trim() !== "")
    .sort((a, b) => a.localeCompare(b));

  const formatted = allProjects.map((project) => ({
    ...project,
    award_formatted: Number(project.award || 0).toLocaleString("en-US"),
  }));

  return {
    projects: formatted,
    currentPage: page,
    totalPages: pages,
    boroughValues,
    fiscalYears,
    councilDistrict,
    neighborhoodValues,
  };
};

export const getTopProjectsByAmount = async (filters = {}, limit = 10) => {
  const collection = await projects();

  const match = {};
  if (filters.startYear && filters.endYear) {
    match.fiscal_year = {
      $gte: `FY${filters.startYear}`,
      $lte: `FY${filters.endYear}`,
    };
  }
  if (filters.borough_full) match.borough_full = filters.borough_full;
  if (filters.council_district)
    match.council_district = parseInt(filters.council_district);

  const results = await collection
    .aggregate([
      { $match: match },
      { $sort: { award: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: "$id",
          label: "$id",
          description: "$description",
          value: "$award",
          borough: "$borough_full",
          fiscal_year: "$fiscal_year",
        },
      },
    ])
    .toArray();

  return results;
};

export const getProjectById = async (id) => {
  // inputStringCheck(id, 'ID');
  id = id.trim();
  // if (!ObjectId.isValid(id)) throw 'Error: invalid object ID';
  const projectsCollection = await projects();
  const project = await projectsCollection.findOne({ id: id });
  if (project === null) throw "Error: No Project with that id";
  project._id = project._id.toString();
  return project;
};

export const saveFeedback = async (projectId, text) => {
  if (!projectId || typeof projectId !== 'string') throw 'Error: Invalid project ID';
  if (!text || typeof text !== 'string' || text.trim().length === 0) throw 'Error: Feedback text is required';

  const feedbacksCollection = await feedbacks(); // assuming you have a `feedbacks()` collection helper
  const feedbackDoc = {
    project_id: projectId.trim(),
    text: text.trim(),
    created_at: new Date()
  };

  const insertResult = await feedbacksCollection.insertOne(feedbackDoc);
  if (!insertResult.acknowledged || !insertResult.insertedId) throw 'Error: Could not save feedback';

  return insertResult.insertedId.toString();
};

export const getLatestFeedbacks = async (projectId, limit = 10) => {
  if (!projectId || typeof projectId !== 'string') throw 'Error: Invalid project ID';
  const feedbacksCollection = await feedbacks();

  const feedbackList = await feedbacksCollection
    .find({ project_id: projectId.trim() })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();

  if(feedbackList.length == 0 ){
    return null;
  }

  return feedbackList.map(fb => ({
    text: fb.text,
    created_at: fb.created_at.toLocaleString()
  }));
};

export const getFiscalYearRange = async () => {
  const collection = await projects();
  const years = await collection.distinct("fiscal_year");

  const numericYears = years
    .map((y) => parseInt(String(y).replace("FY", "")))
    .filter((n) => !isNaN(n));

  const minYear = Math.min(...numericYears);
  const maxYear = Math.max(...numericYears);

  return { minYear, maxYear };
};

export const getProjectsByAmountRange = async (range) => {
  const projectsCollection = await projects();
  const result = await projectsCollection.find(range).toArray();

  return result;
};
