import { Request, Response } from "express";
import {
  PriorityModel,
  ProjectModel,
  StatusModel,
  TaskModel,
  TypeModel,
  UserModel,
} from "../schemas/schema";

export const userCreatePrivateTask = async (req: Request, res: Response) => {
  const userid = req.params.id;
  let assignee = req.body.assignee;

  const {
    name,
    req_start_date,
    req_end_date,
    req_prior_id,
    req_status_id,
    req_type_id,
    req_project_id,
  } = req.body;

  const user = await UserModel.findOne({ _id: userid });
  const project = await ProjectModel.findById(req_project_id);
  const priority = await PriorityModel.findById(req_prior_id);
  const status = await StatusModel.findById(req_status_id);
  const type = await TypeModel.findById(req_type_id);

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

  if (project.members === null) {
    user!.allProjects = [];
  }

  const isUserInProject = project.members.some((item) => {
    return item.includes(user.username);
  });

  if (!isUserInProject) {
    return res.status(404).json({
      message: "User not in project",
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

  const newTask = new TaskModel({
    taskName: name,
    start_date: req_start_date,
    end_date: req_end_date,
    priority: priority?.priorName,
    status: status.statusName,
    type: type?.typeName,
    assignee: assignee.username,
    project: project.projectName,
  });

  await newTask.save();

  await project?.updateOne({
    $push: {
      tasks: newTask.taskName,
    },
  });

  if (assignee) {
    await user?.updateOne({
      $push: {
        tasks: newTask.taskName,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: newTask,
  });
};

export const userEditPrivateTask = async (req: Request, res: Response) => {
  const userid = req.params.id;
  const task_id = req.params.task_id;
  let assignee = req.body.assignee;
  const {
    name,
    req_start_date,
    req_end_date,
    req_prior_id,
    req_status_id,
    req_project_id,
    req_type_id,
  } = req.body;

  const user = await UserModel.findOne({ _id: userid });
  const task = await TaskModel.findById(task_id);
  const priority = await PriorityModel.findById(req_prior_id);
  const status = await StatusModel.findById(req_status_id);
  const project = await ProjectModel.findById(req_project_id);
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

  // Check if user is in project
  const isUserInProject = user?.allProjects.some((item) => {
    return item.includes(project.projectName);
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

  // Check if assignee  is in project
  const assigneeUser = await UserModel.findById(assignee);

  const isAssigneeInProject = user?.allProjects.some((item) => {
    return item.includes(project.projectName);
  });

  if (!isAssigneeInProject) {
    return res.status(404).json({
      message: "Assignee not in project",
      status: 404,
    });
  }

  if (assignee) {
    if (!assigneeUser) {
      return res.status(404).json({
        message: "Assignee not found",
        status: 404,
      });
    }
    assignee = assigneeUser;
  }

  const tasks = {
    taskName: name,
    assignee: assignee.username,
    start_date: req_start_date,
    end_date: req_end_date,
    project: project.projectName,
    type: type?.typeName,
    status: status.statusName,
    priority: priority?.priorName,
  };
  //update task
  await TaskModel.findByIdAndUpdate(task_id, tasks)
    .then((result) => {
      res.status(201).json({
        result,
      });
    })
    .catch((err) => {
      res.status(400).json({
        err,
      });
    });
};

export const userDeletePrivateTask = async (req: Request, res: Response) => {
  const userid = req.params.id;
  const task_id = req.params.task_id;

  const user = await UserModel.findById(userid);
  const task = await TaskModel.findById(task_id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
      status: 404,
    });
  }
  //delete task
  await TaskModel.deleteOne({ id: task_id });
  await UserModel.updateOne({ id: userid }, { $pull: { tasks: task_id } });
  await ProjectModel.updateOne(
    { id: task?.project },
    { $pull: { tasks: task_id } }
  );

  res.status(200).json({
    success: true,
    data: task,
  });
};

export const allUserTask = async (req: Request, res: Response) => {
  const user_id = req.params.id;

  const user = await UserModel.findById(user_id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  const tasks = await TaskModel.find({ assignee: user.username });

  res.status(200).json({
    success: true,
    data: tasks,
  });
};
