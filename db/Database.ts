
var mongoose = require('mongoose');
import { config } from "../config";

export async function startDB() {

    try {
        // await connect(config.mongoDB_Link);
        await mongoose.connect(config.mongoDB_Link);

    } catch (error) {

    }

} 