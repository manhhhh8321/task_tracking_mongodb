import { Request, Response } from "express";
import {
  AdminModel,
  PriorityModel,
  ProjectModel,
  StatusModel,
  TaskModel,
  TypeModel,
  UserModel,
} from "../schemas/schema";

const createTask = async (req: Request, res: Response) => {
  let assignee = req.body.assignee;
  const {
    name,
    req_start_date,
    req_end_date,
    req_project_id,
    req_prior_id,
    req_status_id,
    req_type_id,
  } = req.body;

  const project = await ProjectModel.findById(req_project_id);
  const status = await StatusModel.findById(req_status_id);
  const type = await TypeModel.findById(req_type_id);
  const priority = await PriorityModel.findById(req_prior_id);
  const admin = await AdminModel.findById(assignee);
  const user = await UserModel.findById(assignee);

  const assigneeUser = await UserModel.findById(assignee);
  const assigneeAdmin = await AdminModel.findById(assignee);

  if (!assigneeUser && !assigneeAdmin) {
    return res.status(404).json({
      message: "Assignee not found",
      status: 404,
    });
  }

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
      status: 404,
    });
  }

  if (!status) {
    return res.status(404).json({
      message: "Status not found",
      status: 404,
    });
  }

  if (!user && !admin) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  // Check if user exist then assignee = user else assignee = admin
  if (user) {
    assignee = user;
  } else {
    assignee = admin;
  }

  // Create new query builder instance for the task table
  const task = new TaskModel({
    taskName: name,
    assignee: user?.username,
    start_date: req_start_date,
    end_date: req_end_date,
    project: project.projectName,
    type: type?.typeName,
    status: status.statusName,
    priority: priority?.priorName,
  });

  const rs = await task.save();

  if (!rs) {
    return res.status(500).json({
      message: "Task not created",
      status: 500,
    });
  }

  // Update user's task list with the new task by assignee
  if (user) {
    await UserModel.findOneAndUpdate(
      { _id: assignee },
      { $push: { task: rs.taskName } },
      { new: true }
    ).catch((err) => {
      return new Error("User not found");
    });

    await ProjectModel.findOneAndUpdate(
      { _id: req_project_id },
      { $push: { tasks: rs.taskName } },
      { new: true }
    ).catch((err) => {
      return new Error("Project not found");
    });
  } else if (admin) {
    await AdminModel.findOneAndUpdate(
      { _id: assignee },
      { $push: { task: rs.taskName } },
      { new: true }
    ).catch((err) => {
      return new Error("Admin not found");
    });

    await ProjectModel.findOneAndUpdate(
      { _id: req_project_id },
      { $push: { tasks: rs.taskName } },
      { new: true }
    ).catch((err) => {
      return new Error("Project not found");
    });
  }

  return res.send(rs);
};

export const editTask = async (req: Request, res: Response) => {
  const req_task_id = req.params.id;
  const {
    name,
    assignee,
    req_start_date,
    req_end_date,
    req_project_id,
    req_prior_id,
    req_status_id,
    req_type_id,
  } = req.body;

  const project = await ProjectModel.findById(req_project_id);
  const status = await StatusModel.findById(req_status_id);
  const type = await TypeModel.findById(req_type_id);
  const priority = await PriorityModel.findById(req_prior_id);
  const user = await UserModel.findById(assignee);

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
      status: 404,
    });
  }
  let def;
  const defaultStatus = await StatusModel.findOne({ isDefault: true });

  if (!status) {
    def = defaultStatus;
  } else def = status;

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  // Create new query builder instance to update the task table
  await TaskModel.updateOne(
    { _id: req_task_id },
    {
      taskName: name,
      assignee: user.username,
      start_date: req_start_date,
      end_date: req_end_date,
      project: project.projectName,
      type: type?.typeName,
      status: def?.statusName,
      priority: priority?.priorName,
    }
  ).catch(() => {
    return res.status(404).json({
      message: "Task not found",
      status: 404,
    });
  });

  res.send(`Task ${req_task_id} updated`);
};

export const deleteTask = async (req: Request, res: Response) => {
  const req_id = req.params.id;

  const task = await TaskModel.findById(req_id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
      status: 404,
    });
  }

  await UserModel.findOneAndUpdate(
    { task: req_id },
    { $pull: { task: req_id } },
    { new: true }
  ).catch((err) => {
    return new Error("User not found");
  });

  await ProjectModel.findOneAndUpdate(
    { tasks: req_id },
    { $pull: { tasks: req_id } },
    { new: true }
  ).catch((err) => {
    return new Error("Project not found");
  });

  await TaskModel.deleteOne({ _id: req_id }).catch((err) => {
    return new Error("Task not found");
  });

  res.send(`Task ${req_id} deleted`);
};

export const viewAllTasks = async (req: Request, res: Response) => {
  const obj: Record<string, any> = {};

  const allTasks = await TaskModel.find();
  const allStatus = await StatusModel.find();
  const statusArr = allStatus.map((item) => item.statusName);

  statusArr.forEach((el) => {
    obj[el] = [];
  });

  allTasks.forEach((element) => {
    const temp = element.status.statusName;
    obj[`${temp}`].push(element);
  });

  if (!obj) {
    return res.status(404).json({
      message: "No tasks found",
      status: 404,
    });
  }
  res.send(obj);
};
export { createTask };
