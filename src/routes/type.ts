import {
  createType,
  editType,
  setVisibleType,
  viewAllType,
} from "../controllers/type";
import express from "express";
import { validateNameAndColor } from "../middlewares/validations";
const typeRouter = express.Router();

typeRouter.post("/", validateNameAndColor, createType);
typeRouter.put("/:id", validateNameAndColor, editType);
typeRouter.get("/", viewAllType);
typeRouter.patch("/:id", setVisibleType);

export { typeRouter };
