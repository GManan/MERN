// degreeCourse.routes.ts
import express, { Response } from 'express';
import { CustomRequest } from '../../httpServer';
import * as DegreeCourseService from './degreeCourseService';
import { getAllDegreeCourseApps } from '../degreeCourseApplication/dcaService';

const router = express.Router();
// READ ONE
router.get('/api/degreeCourses/:id', async (req: CustomRequest, res: Response) => {
    const id = req.params.id;


    const course = await DegreeCourseService.getDegreeCourseById(id);

    if (!course) {
        return res.status(404).json({ error: 'Degree course not found' });
    }
    res.status(200).json(course);
})

// READ ALL
router.get('/api/degreeCourses', async (req: CustomRequest, res: Response) => {
    const filters = req.query;

    const courses = await DegreeCourseService.getAllDegreeCourses(filters);
    if (!courses) {
        return res.status(404).json({ Error: 'no courses found' })
    }
    res.status(200).json(courses);
})


// READ ALL FOR A SPESIFIC COURSE
router.get('/api/degreeCourses/:id/degreeCourseApplications', async (req: CustomRequest, res: Response) => {
    const degreeCourseId = req.params.id;
    const isAdmin = req.isAdmin;

    if (!isAdmin) {
        return res.status(401).json({ Error: 'Not authorized to view degree course applications' });
    }

    try {
        const applications = await getAllDegreeCourseApps({ degreeCourseID: degreeCourseId });
        if (!applications) {
            return res.status(404).json({ error: 'No degree course applications found for the specified degree course' });
        }

        res.status(200).json(applications);
    } catch (error) {

        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//CREATE
router.post('/api/degreeCourses', async (req: CustomRequest, res: Response) => {
    const newCourse = req.body;
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
        return res.status(401).json({ Error: 'Not authorized to create a course' })
    }
    // if (!newCourse.id) {
    //     res.status(400).json({ error: 'ID not provided' });
    //     return
    // }
    try {
        const createDegRes = await DegreeCourseService.createDegreeCourse(newCourse);
        // console.log("createDegRes ", createDegRes);
        // console.log("created COURSE ", createDegRes);
        if (createDegRes.existingCourse) {
            res.status(409).json({ error: " Course already exists " });
        } else if (createDegRes.createdCourse) {
            res.status(200).send(createDegRes.createdCourse)
        }
    }
    catch (error) {

        res.status(409).json({ error: 'no auth' });
    }
});

//UPDATE 
router.put('/api/degreeCourses/:id', async (req: CustomRequest, res: Response) => {
    const id = req.params.id;
    const updatedCourse = req.body;
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
        return res.status(401).json({ Error: 'Not authorized to update a course' })
    }
    try {
        const updated = await DegreeCourseService.updateDegreeCourseById(id, updatedCourse);
        if (!updated) {
            return res.status(404).json({ error: 'Degree course not found' });
        }
        res.status(200).json(
            updated
        )
    } catch (error) {

        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE BY ID
router.delete('/api/degreeCourses/:id', async (req: CustomRequest, res: Response) => {
    const id = req.params.id;
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
        return res.status(401).json({ Error: 'Not authorized to delete a course' })
    }
    try {
        const success = await DegreeCourseService.deleteDegreeCourseById(id);
        if (!success) {
            return res.status(404).json({ error: 'Degree could not be deleted' });
        }
        res.status(200).json({ message: 'Degree course deleted successfully' });
    } catch (error) {

        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
