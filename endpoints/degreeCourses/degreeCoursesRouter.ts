// degreeCourse.routes.ts
import express, { Response } from 'express';
import { CustomRequest } from '../../httpServer';
import * as DegreeCourseService from './degreeCourseService';

const router = express.Router();

// READ ALL
router.get('/api/degreeCourses', async (req: CustomRequest, res: Response) => {
    const filters = req.query;
    console.log("filters in getuser ", filters);
    const courses = await DegreeCourseService.getAllDegreeCourses(filters);
    if (!courses) {
        return res.status(404).json({ Error: 'no courses found' })
    }
    res.status(200).json(courses);
})

// READ ONE
router.get('/api/degreeCourses/:id', async (req: CustomRequest, res: Response) => {
    const id = req.params.id;
    console.log("id ", id)
    const course = await DegreeCourseService.getDegreeCourseById(id);
    console.log("course ", course);
    if (!course) {
        return res.status(404).json({ error: 'Degree course not found' });
    }
    res.status(200).json(course);
})

//CREATE
router.post('/api/degreeCourses', async (req: CustomRequest, res: Response) => {
    const newCourse = req.body;
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
        return res.status(401).json({ Error: 'Not authorized to create a course' })
    }
    try {
        const createDegRes = await DegreeCourseService.createDegreeCourse(newCourse);
        console.log("createDegRes ", createDegRes);
        // console.log("created COURSE ", createDegRes);
        if (createDegRes.existingCourse) {
            res.status(409).send(createDegRes.message);
        } else if (createDegRes.createdCourse) {
            res.status(200).send(createDegRes.createdCourse)
        }
    }
    catch (error) {
        console.error('Error creating degree course:', error);
        res.status(409).json("no auth");
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
        res.status(200).json({
            Success: `course updated ${updated}`
        })
    } catch (error) {
        console.error('Error updating degree course:', error);
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
        console.error('Error deleting degree course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
