import mongoose from "mongoose";
import dotenv from "dotenv";
import Persona from "../models/persona.js";
import personas from "./personaDetails.js"; // Adjust the path as necessary
dotenv.config();

const seedPersonas = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // await Persona.deleteMany(); // Optional: clear previous data
    await Persona.insertMany(personas);

    console.log("✅ Persona data inserted successfully.");
    process.exit();
  } catch (error) {
    console.error("❌ Failed to insert persona data:", error);
    process.exit(1);
  }
};

seedPersonas();
