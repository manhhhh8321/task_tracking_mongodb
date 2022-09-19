import { Response, Request, NextFunction } from "express";
import { TypeModel } from "../schemas/schema";

const createType = async (req: Request, res: Response) => {
  const { name, req_color } = req.body;

  const type = await TypeModel.findOne({ typeName: name });
  const allTypes = await TypeModel.find();

  if (type) {
    return res.status(409).json({
      message: "Type already exists",
      status: 409,
    });
  }

  // Create new query builder to create new type
  const types = new TypeModel({
    typeName: name,
    color: req_color,
    visible: true,
    defaultColor: "white",
  });

  // Save to database
  const rs = await types.save();
  if (!rs) {
    return res.status(500).json({
      message: "Cannot create type",
      status: 500,
    });
  }

  for (let el of allTypes) {
    if (el.typeName === "default") {
      el.defaultColor = "white";
    }
    if (el.typeName === "bug") {
      el.defaultColor = "red";
    }
    if (el.typeName === "feature") {
      el.defaultColor = "blue";
    }
  }

  res.send(rs);
};

const viewAllType = async (req: Request, res: Response) => {
  const allTypes = await TypeModel.find();

  if (allTypes.length <= 0) {
    return res.status(204).json({
      message: "No content found",
      status: 204,
    });
  }
  res.status(200).json(allTypes);
};

const editType = async (req: Request, res: Response, next: NextFunction) => {
  const { name, req_color } = req.body;
  const id = req.params.id;

  const type = await TypeModel.findOne({ typeName: name });

  if (!type) {
    return res.status(409).json({
      message: "Type already exists",
      status: 409,
    });
  }
  // Update type
  await TypeModel.updateOne(
    { id: id },
    {
      $set: {
        typeName: name,
        color: req_color,
      },
    }
  ).catch((err) => {
    return err;
  });
  res.send(`Type ${name} has been updated`);
};

const setVisibleType = async (req: Request, res: Response) => {
  const req_id = req.params.id;

  const type = await TypeModel.findOne({ _id: req_id });

  if (!type) {
    return res.status(404).json({
      message: "Type not found",
      status: 404,
    });
  }
  // Create new query builder to update type visible
  const query = await TypeModel.updateOne(
    { _id: req_id },
    {
      $set: {
        // Set visible to its opposite value
        visible: !type!.visible,
      },
    }
  );

  if (!query) {
    return res.status(500).json({
      message: "Cannot update type",
      status: 500,
    });
  }

  res.send(`Type ${req_id} has been updated`);
};

export { createType, viewAllType, editType, setVisibleType };
