const decode = require("jwt-decode");

import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
const jwt = require("jsonwebtoken");
import { SECRET } from "../controllers/admin_login";
import { UserModel } from "../schemas/schema";

export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const decoded = decode(token);

    if (decoded.username === "admin") {
      jwt.verify(token, SECRET, (err: Error) => {
        if (err) {
          return res.sendStatus(403);
        }
      });
      return next();
    } else {
      return res.sendStatus(403);
    }
  } else {
    return res.sendStatus(401);
  }
};

export const userAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Find user by id
  const user = await UserModel.findOne({ _id: req.params.id });

  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const decoded = decode(token);

    if (!user) {
      return res.sendStatus(404);
    }

    if (user.username.toString() === decoded.username.toString()) {
      jwt.verify(token, SECRET, (err: Error) => {
        if (err) {
          return res.sendStatus(403);
        }
      });
      next();
    } else {
      return res.sendStatus(403);
    }
  } else {
    return res.sendStatus(401);
  }
};
