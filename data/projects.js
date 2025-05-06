import { all } from "axios";
import { projects } from "../config/mongoCollections.js";
import { neighborhoodMap } from "../utils/borough_neighborhood_map.js";

export const getAllProjects = async () => {
  const projectsCollection = await projects();
  let allProjects = await projectsCollection.find({}).toArray();

  allProjects = allProjects.map((project) => {
    const award = Number(project.award || 0);
    const neighborhoodString = project.borough + "-" + project.council_district;

    return {
      ...project,
      award_formatted: award.toLocaleString("en-US"),
      // allNeighborhoods: allNeighborhoods,
      councilDistrictToStr: Object.entries(neighborhoodMap).find(
        ([key]) => key === neighborhoodString
      )
        ? Object.entries(neighborhoodMap).find(
            ([key]) => key === neighborhoodString
          )
        : "NA",
    };
  });

  return allProjects;
};


export const getProjectById = async (id) => {
  // inputStringCheck(id, 'ID');
  id = id.trim();
  // if (!ObjectId.isValid(id)) throw 'Error: invalid object ID';
  const projectsCollection = await projects();
  const project = await projectsCollection.findOne({ id: id });
  if (project === null) throw 'Error: No Project with that id';
  project._id = project._id.toString();
  return project;
};

