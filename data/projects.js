import { all } from "axios";
import { projects } from "../config/mongoCollections.js";

const getAllProjects = async () => {
  const projectsCollection = await projects();
  let allProjects = await projectsCollection.find({}).toArray();

  allProjects = allProjects.map((project) => {
    const award = Number(project.award || 0);

    return {
      ...project,
      award_formatted: award.toLocaleString("en-US"),
    };
  });

  return allProjects;
};

export { getAllProjects };
