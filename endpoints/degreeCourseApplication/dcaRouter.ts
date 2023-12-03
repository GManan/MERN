import express, { Response } from "express";
import { CustomRequest } from "../../httpServer";
import { createDegreeCourseApp, deleteDegreeCourseAppById, getAllDegreeCourseApps, updateDegreeCourseAppById } from "./dcaService";
import { getDegreeCourseById } from "../degreeCourses/degreeCourseService";
// import { getAllDegreeCourseApps } from "./dcaService";
const dcaRouter = express.Router();

//CREATE
dcaRouter.post('/api/degreeCourseApplications', async (req: CustomRequest, res: Response) => {
    const dcaApplication = req.body;
    const isAdmin = req.isAdmin;
    if (!dcaApplication.degreeCourseID) {
        res.status(400).json({ error: 'Bad request degree Course ID not provided' });
        return
    }
    const degreeCourse = await getDegreeCourseById(dcaApplication.degreeCourseID)

    if (!degreeCourse) {
        res.status(400).json({ error: 'Bad request degree Course ID in wrong format' });
        return
    }
    if (!isAdmin) {

        dcaApplication.applicantUserID = req.username;

    }
    try {
        const createDegRes = await createDegreeCourseApp(dcaApplication);
        // console.log("createDegRes ", createDegRes);
        // console.log("created COURSE ", createDegRes);
        if (createDegRes.existingCourse) {
            res.status(409).json({ conflict: "Application already exists" });
        } else if (createDegRes.createdCourse) {
            res.status(200).json(createDegRes.createdCourse)
        }
    }
    catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: 'Bad request: Validation error', details: error.message });
        } else {

            res.status(500).json("Internal Server Error");
        }
    }
});
// READ ALL
dcaRouter.get('/api/degreeCourseApplications', async (req: CustomRequest, res: Response) => {
    try {
        const filters = req.query;
        const isAdmin = req.isAdmin;
        const userId = req.username;  // Assuming you store user ID in req.username

        if (!isAdmin) {
            return res.status(404).json({ Error: 'Forbidden, no auth' });
        }

        // Admins can access all applications
        const dcapps = await getAllDegreeCourseApps(filters);

        if (!dcapps || dcapps.length === 0) {
            return res.status(404).json({ Error: 'No applications found' });
        }

        return res.status(200).json(dcapps);
    } catch (error) {

        res.status(500).json({ Error: 'Internal Server Error' });
    }
});
// READ ALL APPs for a Degree course
dcaRouter.get('/api/degreeCourses/:id/degreeCourseApplications', async (req: CustomRequest, res: Response) => {

    try {
        const isAdmin = req.isAdmin;
        const userId = req.username;  // Assuming you store user ID in req.username

        if (!isAdmin) {
            return res.status(404).json({ Error: 'Forbidden, no auth' });
        }
    } catch (error) {

        res.status(500).json({ Error: 'Internal Server Error' });
    }
});

// READ ONE
dcaRouter.get('/api/degreeCourseApplications/myApplications', async (req: CustomRequest, res: Response) => {
    try {
        const isAdmin = req.isAdmin;
        const userId = req.username;

        if (!isAdmin) {
            const dcapps = await getAllDegreeCourseApps({ applicantUserID: userId });
            if (!dcapps || dcapps.length === 0) {
                return res.status(404).json({ Error: 'No soup for you' });
            }
            return res.status(200).json(dcapps);
        }
        // Admins can access all applications
        const dcapps = await getAllDegreeCourseApps(req.query);
        if (!dcapps || dcapps.length === 0) {
            return res.status(404).json({ Error: 'No applications found' });
        }
        return res.status(200).json(dcapps);
    } catch (error) {

        res.status(500).json({ Error: 'Internal Server Error' });
    }
});

// UPDATE BY ID
dcaRouter.put('/api/degreeCourseApplications/:id', async (req: CustomRequest, res: Response) => {
    const applicationID = req.params.id;
    const isAdmin = req.isAdmin;

    if (!isAdmin) {
        return res.status(401).json({ Error: 'Not authorized to update a degree course application' });
    }

    const updatedData = req.body;

    try {
        const updatedDegreeCourseApp = await updateDegreeCourseAppById(applicationID, updatedData);

        if (!updatedDegreeCourseApp) {
            return res.status(404).json({ error: 'Degree course application not found' });
        }

        res.status(200).json(updatedDegreeCourseApp);
    } catch (error) {

        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// DELETE BY ID
dcaRouter.delete('/api/degreeCourseApplications/:id', async (req: CustomRequest, res: Response) => {
    const id = req.params.id;
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
        return res.status(401).json({ Error: 'Not authorized to delete the application' })
    }
    try {
        const success = await deleteDegreeCourseAppById(id);
        if (!success) {
            return res.status(404).json({ error: 'Application could not be deleted' });
        }
        res.status(200).json({ message: 'Application course deleted successfully' });
    } catch (error) {

        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default dcaRouter;
