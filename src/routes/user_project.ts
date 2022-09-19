import {
  allTaskOfUserProject,
  createTaskForUser,
  userDeleteTask,
  userDetailProject,
  userEditTask,
  userJoinedProject,
} from "../controllers/user_project";
import express from "express";
import {
  validateUserCreateTask,
} from "../middlewares/validations";
import { userAuth } from "../middlewares/auth";
const userProjectRouter = express.Router();

userProjectRouter.get("/:id", userAuth, userJoinedProject);
userProjectRouter.get(
  "/:id/:project_id",
  userAuth,
  userDetailProject
);
userProjectRouter.get(
  "/:id/:project_id/task",
  userAuth,
  allTaskOfUserProject
);
userProjectRouter.post(
  "/:id/:project_id/task",
  validateUserCreateTask,
  userAuth,
  createTaskForUser
);
userProjectRouter.put(
  "/:id/:project_id/:task_id",
  validateUserCreateTask,
  userAuth,
  userEditTask
);
userProjectRouter.delete(
  "/:id/:project_id/:task_id",
  userAuth,
  userDeleteTask
);

export { userProjectRouter };
