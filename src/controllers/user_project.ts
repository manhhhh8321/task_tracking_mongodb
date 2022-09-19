import { Request, Response } from "express";

import {
  PriorityModel,
  ProjectModel,
  StatusModel,
  TaskModel,
  TypeModel,
  UserModel,
} from "../schemas/schema";
import mongoose from "mongoose";

export const userJoinedProject = async (req: Request, res: Response) => {
  const userId = req.params.id;

  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  const allProject = await ProjectModel.find({ assignee: userId });

  res.json({
    message: "User joined projects",
    status: 200,
    data: allProject,
  });
};

export const userDetailProject = async (req: Request, res: Response) => {
  const userid = req.params.id;
  const projectId = req.params.project_id;

  const user = await UserModel.findById(userid);
  const project = await ProjectModel.findById(projectId);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
      status: 404,
    });
  }

  if (project.members === null || project.members === undefined) {
    user!.allProjects = [];
  }

  // Check if user is in project
  const isUserInProject = project.members.some((item) => {
    return item === user.username;
  });

  if (!isUserInProject) {
    return res.status(404).json({
      message: "User not in project",
      status: 404,
    });
  }

  const pushArray = [];
  // Get username from user model
  // Count number of records in task where assignee = username and project id = projectId
  const countTask = await TaskModel.countDocuments({
    assignee: user.username,
    project: project.projectName,
  });

  const currentTask = countTask;
  const closedTask = project!.task_closed.length;
  const obj = {
    projectName: project!.projectName,
    allTasks: currentTask + closedTask,
    closedTasks: closedTask,
    // Check process if it is number or not, if not then return 0
    process: isNaN((closedTask / currentTask) * 100)
      ? 0
      : (closedTask / currentTask) * 100,
    start_date: project!.start_date,
    end_date: project!.end_date,
  };
  pushArray.push(obj);
  res.send(pushArray);
};

export const allTaskOfUserProject = async (req: Request, res: Response) => {
  const userid = req.params.id;
  const projectId = req.params.project_id;

  const allStatus = await StatusModel.find();
  const allTasks = await TaskModel.find({});

  const user = await UserModel.findOne({ _id: userid });
  const project = await ProjectModel.findOne({ _id: projectId });

  if (project!.members === null || project!.members === undefined) {
    user!.allProjects = [];
  }

  // Check if user is in project
  const isUserInProject = project!.members.some((item) => {
    return item === user!.username;
  });

  if (!isUserInProject) {
    return res.status(404).json({
      message: "User not in project",
      status: 404,
    });
  }

  const statusArr = allStatus.map((item) => item.statusName);
  const obj: Record<string, any> = {};

  statusArr.forEach((el) => {
    obj[el] = [];
  });
  // Find all task of user in project
  const allTaskOfUser = allTasks.filter((item) => {
    return (
      item.assignee.toString() === user!.username.toString() &&
      item.project.toString() === project!.projectName.toString()
    );
  });

  allTaskOfUser.forEach((item) => {
    obj[`${item.status}`].push(item);
  });

  if (!obj) {
    return res.status(404).json({
      message: "No task found",
      status: 404,
    });
  }
  res.send(obj);
};

export const createTaskForUser = async (req: Request, res: Response) => {
  const req_project_id = req.params.project_id;
  const user_id = req.params.id;

  const {
    name,
    req_start_date,
    req_end_date,
    req_prior_id,
    req_status_id,
    req_type_id,
  } = req.body;

  const user = await UserModel.findById(user_id);
  const project = await ProjectModel.findById(req_project_id);
  const priority = await PriorityModel.findById(req_prior_id);
  const status = await StatusModel.findById(req_status_id);
  const type = await TypeModel.findById(req_type_id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
      status: 404,
    });
  }

  if (user!.allProjects === null) {
    user!.allProjects = [];
  }

  const isUserInProject = project.members.some((item) => {
    return item === user!.username;
  });

  if (!isUserInProject) {
    return res.status(404).json({
      message: "User not in project",
      status: 404,
    });
  }

  let def;

  const defaultStatus = await StatusModel.findOne({ isDefault: true });

  if (!status) {
    def = defaultStatus;
  } else {
    def = status;
  }

  const tasks = new TaskModel({
    taskName: name,
    assignee: user.username,
    start_date: req_start_date,
    end_date: req_end_date,
    project: project.projectName,
    type: type?.typeName,
    status: def?.statusName,
    priority: priority?.priorName,
  });

  await tasks.save().catch((err) => {
    return res.status(404).json({
      message: err,
      status: 404,
    });
  });

  await ProjectModel.updateOne(
    { _id: req_project_id },
    { $push: { tasks: tasks } }
  ).catch((err) => {
    return res.status(404).json({
      message: err,
      status: 404,
    });
  });

  await UserModel.updateOne({ _id: user_id }, { $push: { task: tasks } }).catch(
    (err) => {
      return res.status(404).json({
        message: err,
        status: 404,
      });
    }
  );

  res.status(201).json({
    success_msg: "Task created",
  });
};

export const userEditTask = async (req: Request, res: Response) => {
  const project_id = req.params.project_id;
  const userid = req.params.id;
  const task_id = req.params.task_id;

  let assignee = req.body.assignee;

  const {
    name,
    req_start_date,
    req_end_date,
    req_prior_id,
    req_status_id,
    req_type_id,
  } = req.body;

  const user = await UserModel.findById(userid);
  const project = await ProjectModel.findById(project_id);
  const task = await TaskModel.findById(task_id);
  const priority = await PriorityModel.findById(req_prior_id);
  const status = await StatusModel.findById(req_status_id);
  const type = await TypeModel.findById(req_type_id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
      status: 404,
    });
  }

  if (user!.allProjects === null) {
    user!.allProjects = [];
  }

  const isUserInProject = user?.allProjects.some((item) => {
    return item.includes(project_id);
  });

  if (!isUserInProject) {
    return res.status(404).json({
      message: "User not in project",
      status: 404,
    });
  }

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
      status: 404,
    });
  }
  if (!status) {
    return res.status(404).json({
      message: "Status not found",
      status: 404,
    });
  }

  if (assignee) {
    const assigneeUser = await UserModel.findById(assignee);
    if (!assigneeUser) {
      return res.status(404).json({
        message: "Assignee not found",
        status: 404,
      });
    }
    assignee = assigneeUser;
  }
  // Create new  query builder ti update task for user, project, user

  await TaskModel.updateOne(
    { _id: task_id },
    {
      taskName: name,
      assignee: user.username,
      start_date: req_start_date,
      end_date: req_end_date,
      project: project.projectName,
      type: type?.typeName,
      status: status.statusName,
      priority: priority?.priorName,
    }
  )
    .then(() => {
      res.status(200).json({
        success_msg: "Task updated",
      });
    })
    .catch((err) => {
      res.status(404).json({
        message: err,
        status: 404,
      });
    });
};

export const userDeleteTask = async (req: Request, res: Response) => {
  const userid = req.params.id;
  const task_id = req.params.task_id;
  const project_id = req.params.project_id;

  const user = await UserModel.findById(userid);
  const project = await ProjectModel.findById(project_id);
  const task = await TaskModel.findById(task_id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
      status: 404,
    });
  }

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
      status: 404,
    });
  }

  // Delete task of user then update project, task
  await TaskModel.deleteOne({ _id: task_id });
  await ProjectModel.updateOne(
    { _id: project_id },
    { $pull: { tasks: task_id } }
  );
  await UserModel.updateOne({ _id: userid }, { $pull: { tasks: task_id } });

  res.send(`Delete task successfully`);
};
