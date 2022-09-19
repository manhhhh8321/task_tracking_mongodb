export interface IProject {
  projectName: string;
  members: string[];
  start_date: string;
  end_date: string;
  slug: string;
  tasks: string[];
  task_closed: string[];
}

export interface IStatus {
  statusName: string;
  orderNumber: number;
  currentStatus: string;
  visible: boolean;
  isDefault: boolean;
}

export interface IPriority {
  priorName: string;
  orderNumber: number;
  visible: boolean;
}

export interface IType {
  defaultColor: string;
  color: string;
  typeName: string;
  visible: boolean;
}

export interface ITask {
  taskName: string;
  assignee: Users;
  project: IProject;
  status: IStatus;
  type: IType;
  priority: IPriority;
  start_date: string;
  end_date: string;
}

export interface Users {
  username: string;
  password: string;
  name: string;
  birthday: string;
  email: string;
  inviteID: string;
  active: boolean;
  defaultProject: IProject;
  allProjects: string[];
  project: IProject;
  task: string[];
}

export interface Admins {
  username: string;
  password: string;
  role: string;
  name: string;
  birthday: string;
  email: string;
  inviteID: string;
  active: boolean;
  defaultProject: IProject;
  allProjects: string[];
  project: IProject;
  task: string[];
}

// export interface IUserProject {
//   tasks: string[];
// }

// export interface IUserTasks {
//   allTask: string[];
// }
