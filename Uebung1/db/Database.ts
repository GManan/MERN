import { connect } from "mongoose";
import { config } from "../config";

export async function startDB() {
    console.log("Connect database");
    try {
        // await connect(config.mongoDB_Link);
        await connect(config.mongoDB_Link);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
    console.log("connected db")
} 