import { Response, Request, NextFunction } from "express";
import slug from "slug";

import { ProjectModel, UserModel } from "../schemas/schema";

const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, start_date, end_date } = req.body;

  const project = await ProjectModel.findOne({ projectName: name });

  if (project) {
    return res.status(409).json({
      message: "Project already exists",
      status: 409,
    });
  }

  const newProject = new ProjectModel({
    projectName: name,
    slug: slug(name),
    start_date: start_date,
    end_date: end_date,
    members: [],
    tasks: [],
    task_closed: [],
  });

  const rs = await newProject.save();
  if (!rs) {
    return res.status(500).json({
      message: "Project not created",
      status: 500,
    });
  }

  res.send(rs);
};

const viewAllProject = async (req: Request, res: Response) => {
  const allProjects = await ProjectModel.find({ relations: ["tasks"] });

  let pushArray = [];
  for (let el of allProjects) {
    const taskAmount = el.tasks.length;
    const closedTaskAmount = el.task_closed.length;

    const obj = {
      projectName: el.projectName,
      taskAmount: taskAmount,
      // check process if taskAmount = 0 => process = 0
      process: taskAmount === 0 ? 0 : closedTaskAmount / taskAmount,
    };
    pushArray.push(obj);
  }
  if (allProjects.length > 0) {
    res.status(200).json(pushArray);
  } else {
    return res.status(204).json({
      message: "No project found",
      status: 204,
    });
  }
};

const editProject = async (req: Request, res: Response, next: NextFunction) => {
  const { name, start_date, end_date } = req.body;
  const slugParams = req.params.slug;

  const project = await ProjectModel.findOne({ slug: slugParams });

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
      status: 404,
    });
  }

  // Update project by slug
  await ProjectModel.updateOne(
    { slug: slugParams },
    { projectName: name, start_date: start_date, end_date: end_date }
  ).catch((err) => {
    return res.status(500).json({
      message: "Project not updated",
      status: 500,
    });
  });
  res.send(`Update project ${name} successfully`);
};

const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const slugParams = req.params.slug;

  const project = await ProjectModel.findOne({ slug: slugParams });

  await ProjectModel.deleteOne({ slug: slugParams })
    .then(() => {
      res.send(`Delete project ${project!.projectName} successfully`);
    })
    .catch((err) => {
      return res.status(500).json({
        message: "Project not deleted",
        status: 500,
      });
    });
};

export const addMemberToProject = async (req: Request, res: Response) => {
  const { req_username } = req.body;
  const req_slug = req.params.slug;

  const project = await ProjectModel.findOne({ slug: req_slug });
  const user = await UserModel.findOne({ username: req_username });

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
      status: 404,
    });
  }

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  if (project!.members === null) {
    project!.members = [];
  }

  const checkMember = project!.members.find((el) => el === user!.username);

  if (checkMember) {
    return res.status(409).json({
      message: "User already in project",
      status: 409,
    });
  }

  // Create transaction to add member to project and add project to user project list
  const session = await ProjectModel.startSession();
  session.startTransaction();
  try {
    await ProjectModel.findOneAndUpdate(
      { slug: req_slug },
      { $push: { members: req_username } }
    ).catch((err) => {
      throw err;
    });

    await UserModel.findOneAndUpdate(
      { username: req_username },
      { $push: { allProjects: project.projectName } }
    ).catch((err) => {
      throw err;
    });

    await session.commitTransaction();
    session.endSession();
    res.send(`Add ${req_username} to project ${req_slug} successfully`);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: "Add member to project failed",
      status: 500,
    });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  const { req_username } = req.body;
  const req_slug = req.params.slug;

  const project = await ProjectModel.findOne({ slug: req_slug });
  const user = await UserModel.findOne({ username: req_username });

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
      status: 404,
    });
  }

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  const checkMember = project!.members.find((el) => el === user!.username);

  if (!checkMember) {
    return res.status(404).json({
      message: "User not in project",
      status: 404,
    });
  }

  // Create transaction to remove member from project and remove project from user project list
  const session = await ProjectModel.startSession();
  session.startTransaction();
  try {
    await ProjectModel.findOneAndUpdate(
      { slug: req_slug },
      { $pull: { members: req_username } }
    ).catch((err) => {
      throw err;
    });
    // get project _id from allProject array of user

    await UserModel.findOneAndUpdate(
      { username: req_username },
      {
        $pull: {
          allProjects: project.projectName,
        },
      }
    ).catch((err) => {
      throw err;
    });

    await session.commitTransaction();
    session.endSession();
    res.send(`Remove ${req_username} from project ${req_slug} successfully`);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    return res.status(500).json({
      message: "Remove member from project failed",
      status: 500,
    });
  }
};

export { createProject, viewAllProject, editProject, deleteProject };
