import { Response, Request, NextFunction } from "express";
import { AdminModel, UserModel } from "../schemas/schema";

const bcrypt = require("bcrypt");
const saltRounds = 10;

const passwordStr = "123a";
var jwt = require("jsonwebtoken");
export const SECRET = "SECRET";

const hash = bcrypt.hashSync(passwordStr, saltRounds);

export const createAdmin = async () => {
  // Delete all admin from mongodb
  const admin = new AdminModel({
    username: "admin",
    password: hash,
    role: "admin",
    allProjects: [],
    active: true,
    birthday: "2001-01-01",
    email: "admin@gmail.com",
    name: "yeti",
    defaultProject: [],
    inviteID: "123",
    projects: [],
    tasks: [],
  });

  const rs = async () => {
    await admin.save();
    console.log("User has been saved");
  };
  rs();
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { uname, upass } = req.body;

  const admin = await AdminModel.findOne({ username: uname });
  const user = await UserModel.findOne({ username: uname });

  if (admin) {
    const isBycrypted = bcrypt.compareSync(upass, hash);

    if (isBycrypted) {
      const accessToken = jwt.sign(
        { username: admin.username, role: admin.role },
        SECRET
      );

      return res.json({
        accessToken,
      });
    } else {
      return res.status(400).json({
        message: "Wrong password",
        statusCode: 400,
      });
    }
  } else {
    if (user) {
      if (
        uname === user.username &&
        bcrypt.compareSync(upass, user.password) &&
        user.active != false
      ) {
        const accessToken = jwt.sign(
          {
            username: user.username,
            id: user.id,
          },
          SECRET
        );
        return res.send(accessToken);
      } else {
        return res.status(400).json({
          message: "Wrong password",
          statusCode: 400,
        });
      }
    } else {
      return res.status(400).json({
        message: "User not found",
        statusCode: 400,
      });
    }
  }
};
