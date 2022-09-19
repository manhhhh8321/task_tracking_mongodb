import { Request, Response } from "express";
import { PriorityModel } from "../schemas/schema";

const createPrior = async (req: Request, res: Response) => {
  const { name, order } = req.body;

  const priors = await PriorityModel.find({ priorName: name });

  if (priors.length > 0) {
    return res.status(409).json({
      message: "Priority already exists",
      status: 409,
    });
  }

  // Create new priority
  const prior = new PriorityModel({
    priorName: name,
    orderNumber: order,
    visible: true,
  });

  // Save to database
  const rs = await prior.save();
  if (!rs) {
    return res.status(500).json({
      message: "Cannot create priority",
      status: 500,
    });
  }
  res.send(rs);
};

const viewAllPrior = async (req: Request, res: Response) => {
  const allPrior = await PriorityModel.find().sort({ orderNumber: 1 });

  if (allPrior.length <= 0) {
    return res.status(204).json({
      message: "No content found",
      status: 204,
    });
  }
  res.status(204).json(allPrior);
};

const editPrior = async (req: Request, res: Response) => {
  const { name, order } = req.body;
  const id = req.params.id;

  const priors = await PriorityModel.findOne({ priorName: name });

  if (priors) {
    return res.status(409).json({
      message: "Priority already exists",
      status: 409,
    });
  }

  await PriorityModel.updateOne(
    { _id: id },
    {
      $set: {
        priorName: name,
        orderNumber: order,
      },
    }
  ).catch((err) => {
    return res.status(500).json({
      message: "Cannot update priority",
      status: 500,
    });
  });
  res.send(`Update priority ${priors!.priorName} successfully`);
};

const setVisiblePrior = async (req: Request, res: Response) => {
  const reqID = req.params.id;

  const priors = await PriorityModel.findOne({ _id: reqID });

  if (!priors) {
    return res.status(404).json({
      message: "Priority not found",
      status: 404,
    });
  }
  // Create query builder to update priority visible
  await PriorityModel.updateOne(
    { _id: reqID },
    {
      $set: {
        visible: priors!.visible,
      },
    }
  ).catch((err) => {
    return res.status(500).json({
      message: "Cannot update priority",
      status: 500,
    });
  });

  res.send(`Update priority ${priors!.priorName} successfully`);
};
export { createPrior, editPrior, viewAllPrior, setVisiblePrior };
