import { Request, Response } from "express";
import { StatusModel } from "../schemas/schema";

const createStatus = async (req: Request, res: Response) => {
  const { name, order } = req.body;

  const status = await StatusModel.findOne({ statusName: name });

  if (status) {
    return res.status(409).json({
      message: "Status already exists",
      status: 409,
    });
  }

  // Create a new status
  const newStatus = await StatusModel.create({
    statusName: name,
    orderNumber: order,
    visible: true,
    currentStatus: "New",
    isDefault: false,
  });

  // Save to database
  const rs = await newStatus.save().catch((err) => {
    return res.status(500).json({
      message: "Cannot create status",
      status: 500,
    });
  });
  res.send(rs);
};

const viewAllStatus = async (req: Request, res: Response) => {
  const allStatus = await StatusModel.find().sort({ orderNumber: 1 });

  if (allStatus.length <= 0) {
    return res.status(204).json({
      message: "No content found",
      status: 204,
    });
  }
  res.status(200).json(allStatus);
};

const editStatus = async (req: Request, res: Response) => {
  const { name, order } = req.body;
  const id = req.params.id;

  const status = await StatusModel.findOne({ statusName: name });

  if (status) {
    return res.status(409).json({
      message: "Status already exists",
      status: 409,
    });
  }
  // Create query builder to update status

  await StatusModel.updateOne(
    { _id: id },
    {
      $set: {
        statusName: name,
        orderNumber: order,
      },
    }
  ).catch((err) => {
    return res.status(500).json({
      message: "Cannot update status",
      status: 500,
    });
  });
  res.send(`Update status ${status!.statusName} successfully`);
};

const setVisibleStatus = async (req: Request, res: Response) => {
  const reqID = req.params.id;

  const status = await StatusModel.findById(reqID);

  if (!status) {
    return res.status(404).json({
      message: "Status not found",
      status: 404,
    });
  }

  await StatusModel.updateOne(
    { _id: reqID },
    {
      $set: {
        visible: !status!.visible,
      },
    }
  ).catch((err) => {
    return res.status(500).json({
      message: "Cannot update status",
      status: 500,
    });
  });
  res.send(`Update status ${status!.statusName} successfully`);
};
export { createStatus, editStatus, viewAllStatus, setVisibleStatus };
