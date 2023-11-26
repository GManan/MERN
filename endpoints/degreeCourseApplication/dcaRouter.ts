// import express, { Response } from "express";
// import { CustomRequest } from "../../httpServer";
// import { getAllDegreeCourseApps } from "./dcaService";
// const dcaRouter = express.Router();

// // READ ALL
// dcaRouter.get('/api/degreeCourseApplications', async (req: CustomRequest, res: Response) => {
//     const filters = req.query;
//     console.log("filters in getuser ", filters);
//     const courses = await getAllDegreeCourseApps(filters);
//     if (!courses) {
//         return res.status(404).json({ Error: 'no courses found' });
//     }
//     res.status(200).json();
// })
// export default dcaRouter;
