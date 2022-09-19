const uniqid = require("uniqid");
const bcrypt = require("bcrypt");
import mongoose from "mongoose";

const saltRounds = 10;

import { Request, Response } from "express";
import {
  InviteModel,
  UserModel,
  ProjectModel,
  TaskModel,
} from "../schemas/schema";

export const inviteIdList: string[] = [];

export const createInviteID = async (req: Request, res: Response) => {
  const newId = uniqid();

  //Create new invite id
  const invite = new InviteModel({
    inviteID: newId,
  });

  const rs = await invite.save();

  if (!rs) {
    return res.status(404).json({
      message: "Create invite id failed",
      status: 404,
    });
  }
  res.send(newId);
};

export const createUser = async (req: Request, res: Response) => {
  const { req_username, req_password, req_inviteID, name, birthday, email } =
    req.body;

  const hash = bcrypt.hashSync(req_password, saltRounds);

  const checkInvite = await InviteModel.findOne({ inviteId: req_inviteID });
  const users = await UserModel.findOne({ username: req_username });
  const checkEmail = await UserModel.findOne({ email: email });
  const defaultProject = await ProjectModel.findOne({});

  if (!checkInvite) {
    return res.status(404).json({
      message: "Invite ID not found",
      status: 404,
    });
  }

  if (users) {
    return res.status(404).json({
      message: "Username already exists",
      status: 404,
    });
  }

  if (checkEmail) {
    return res.status(404).json({
      message: "Email already exists",
      status: 409,
    });
  }

  // Create transaction to create new user then delete invite id

  const user = new UserModel({
    username: req_username,
    password: hash,
    name: name,
    birthday: birthday,
    email: email,
    active: true,
    inviteID: req_inviteID,
    allProjects: [],
    defaultProject: defaultProject,
    projects: [],
    tasks: [],
  });

  await user
    .save()
    .then(async () => {
      await InviteModel.deleteOne({ inviteID: req_inviteID });
    })
    .then(() => {
      res.send("Create user successfully");
    })
    .catch(async (err) => {
      throw err;
    });
};

export const viewAllUser = async (req: Request, res: Response) => {
  const allUsers = await UserModel.find();

  if (!allUsers) {
    return res.status(404).json({
      message: "No user found",
      status: 404,
    });
  }
  res.send(allUsers);
};

export const viewUserDetail = async (req: Request, res: Response) => {
  const user_id = req.params.id;

  const allUsers = await UserModel.find();

  const userIndex = allUsers.findIndex(
    (item) => item._id.toString() === user_id
  );

  if (userIndex < 0) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  res.send(
    `All user projects : ${allUsers[userIndex].allProjects}\nAll user tasks : ${allUsers[userIndex].task}`
  );
};

export const deleteUser = async (req: Request, res: Response) => {
  const user_id = req.params.id;

  const user = await UserModel.findById(user_id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }
  // Create new query builder to delete user by id
  await UserModel.deleteOne({ _id: user_id })
    .then(() => {
      res.send("Delete user successfully");
    })
    .catch((err) => {
      return res.status(404).json(err);
    });

  // Update all projects that user is in
  const allProjects = await ProjectModel.find();

  allProjects.forEach(async (project) => {
    const userIndex = project.members.findIndex(
      (item) => item.toString() === user_id
    );
    if (userIndex >= 0) {
      project.members.splice(userIndex, 1);
      await project.save();
    }
  });

  // Update all tasks have user as assignee
};

export const editUser = async (req: Request, res: Response) => {
  const user_id = req.params.id;
  const { name, birthday, email, active } = req.body;

  const user = await UserModel.findById(user_id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      status: 404,
    });
  }

  // Create new query builder to update user by id
  await UserModel.updateOne(
    { _id: user_id },
    {
      $set: {
        name: name,
        birthday: birthday,
        email: email,
        active: active,
      },
    }
  ).catch((err) => {
    return res.status(404).json(err);
  });
  res.send(`Update user ${user_id} successfully`);
};
