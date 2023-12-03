import express, { NextFunction } from "express";
import { DegreeCourse } from "../degreeCourses/degreeCoursesModel";

const dataCheckRouter = express.Router()

const handleDataCheckForAppCreation = async (req: any, res: any, next: NextFunction) => {



    if (req.method === 'POST' && req.body.degreeCourseID) {
        // try {
        const degreeCourse = await DegreeCourse.findById(req.body.degreeCourseID).exec();

        // } catch (error) {
        //     console.error("Error finding degree course:", error);
        // }
        //check if the COurse exists
        // const degreeCourse = await DegreeCourse.findById(req.body.degreeCourseID);
        // console.log("111111111111111111111111111111111111111111111111111degreeCourse ", degreeCourse);
        // Perform data check logic here
        // For example, checking if the degree exists
    }
    next()
}

//you might wanna use this middlewatre more and check other stuff datarelaret
const dataCheckNeededRoutes = [
    '/api/degreeCourseApplications',
];
dataCheckRouter.use(dataCheckNeededRoutes, handleDataCheckForAppCreation);
export = dataCheckRouter;