import mongoose from "mongoose";

import Feedback from "../models/Feedback.js";



const MONGO_URI = "mongodb+srv://Customer:WD2oNtIjZj7hwH6o@cluster0.y1gr02l.mongodb.net/Feed"

const seedData = [
  {
    name: "Alice Smith",
    email: "alice@example.com",
    message: "Great service and quick response!",
    rating: 5
  },
  {
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    message: "Good experience overall, though there's room for improvement.",
    rating: 4
  },
  {
    name: "Charlie Davis",
    email: "charlie.d@example.com",
    message: "Support was a bit slow but eventually resolved my issue.",
    rating: 3
  },
  {
    name: "Diana Prince",
    email: "diana.prince@example.com",
    message: "Terrible service. No response for days.",
    rating: 1
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("MongoDB connected");

    await Feedback.insertMany(seedData);
    console.log("Seed data inserted successfully");

    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
