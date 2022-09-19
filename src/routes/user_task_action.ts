import {
  allUserTask,
  userCreatePrivateTask,
  userDeletePrivateTask,
  userEditPrivateTask,
} from "../controllers/user_task_actions";
import express from "express";
import {
  validateParamId,
  validateTask,
  validateUsernameAndParamsId,
} from "../middlewares/validations";
import { userAuth } from "../middlewares/auth";
const userPrivateTaskRouter = express.Router();

userPrivateTaskRouter.get("/:id/task", validateParamId,  userAuth,allUserTask);
userPrivateTaskRouter.post(
  "/:id/task",
  validateTask,
  userAuth,
  userCreatePrivateTask
);
userPrivateTaskRouter.delete("/:id/:task_id", userAuth, userDeletePrivateTask);
userPrivateTaskRouter.put(
  "/:id/:task_id/",
  validateTask,
  userAuth,
  userEditPrivateTask
);

export { userPrivateTaskRouter };
