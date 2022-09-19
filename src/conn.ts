import mongoose from "mongoose";

//initiate connection
export default async function connect() {
  await mongoose
    .connect("mongodb://localhost:27017/task_tracking")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Could not connect to MongoDB...", err));
}
