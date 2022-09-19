import mongoose from "mongoose";
const Schema = mongoose.Schema;

import {
  IProject,
  Admins,
  IPriority,
  IStatus,
  ITask,
  IType,
  Users,
} from "../interfaces/main";

// Create project schema
const projectSchema = new Schema<IProject>({
  projectName: { type: String, required: true },
  members: [{ type: String, required: true }],
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  slug: { type: String, required: true },
  tasks: [{ type: String, required: true }],
  task_closed: [{ type: Object, required: true }],
});

// Create admin schema
const adminSchema = new Schema<Admins>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  birthday: { type: String, required: true },
  email: { type: String, required: true },
  inviteID: { type: String, required: true },
  active: { type: Boolean, required: true },
  defaultProject: { type: Array, required: true },
  allProjects: [{ type: String, required: true }],
  task: [{ type: String, required: true }],
  role: { type: String, required: true },
});

// Create priority schema
const prioritySchema = new Schema<IPriority>({
  priorName: { type: String, required: true },
  orderNumber: { type: Number, required: true },
  visible: { type: Boolean, required: true },
});

// Create status schema
const statusSchema = new Schema<IStatus>({
  statusName: { type: String, required: true },
  orderNumber: { type: Number, required: true },
  currentStatus: { type: String, required: true },
  visible: { type: Boolean, required: true },
  isDefault: { type: Boolean, required: true },
});

// Create task schema
const taskSchema = new Schema<ITask>({
  taskName: { type: String, required: true },
  assignee: [
    {
      type: String,
      required: true,
    },
  ],
  project: { type: String, required: true },
  status: { type: String, required: true },
  type: { type: String },
  priority: { type: Array },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
});

// Create type schema
const typeSchema = new Schema<IType>({
  defaultColor: { type: String, required: true },
  color: { type: String, required: true },
  typeName: { type: String, required: true },
  visible: { type: Boolean, required: true },
});

// Create user schema
const userSchema = new Schema<Users>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  birthday: { type: String, required: true },
  email: { type: String, required: true },
  inviteID: { type: String, required: true },
  active: { type: Boolean, required: true },
  defaultProject: { type: Object, required: true },
  allProjects: [{ type: String, required: true }],
  task: [{ type: String, required: true }],
});

const inviteSchema = new Schema({
  inviteID: { type: String, required: true },
});

export const ProjectModel = mongoose.model<IProject>("Project", projectSchema);
export const AdminModel = mongoose.model<Admins>("Admin", adminSchema);
export const PriorityModel = mongoose.model<IPriority>(
  "Priority",
  prioritySchema
);
export const StatusModel = mongoose.model<IStatus>("Status", statusSchema);
export const TaskModel = mongoose.model<ITask>("Task", taskSchema);
export const TypeModel = mongoose.model<IType>("Type", typeSchema);
export const UserModel = mongoose.model<Users>("User", userSchema);
export const InviteModel = mongoose.model("Invite", inviteSchema);
