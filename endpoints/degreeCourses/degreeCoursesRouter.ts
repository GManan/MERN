// degreeCourse.routes.ts
import express, { Request, Response } from 'express';
import * as DegreeCourseService from './degreeCourseService';
import { authService } from '../authentication/authService';

const router = express.Router();

// READ ALL
router.get('/', async (req: Request, res: Response) => {
    const filters: Record<string, any> = req.query;
    console.log("filters ", filters);
    try {
        // if (Object.keys(filters).length > 0) {

        //     // const courses = await DegreeCourseService.searchByFilters();
        //     // res.status(200).json(courses);
        //     // todo implement queryparam filtering
        // }

        const courses = await DegreeCourseService.getAllDegreeCourses();
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error getting degree courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// READ ONE
router.get('/:id', async (req: Request, res: Response) => {
    const id = req.body.id;
    try {
        const course = await DegreeCourseService.getDegreeCourseById(id);
        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ error: 'Degree course not found' });
        }
    } catch (error) {
        console.error('Error getting degree course by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//CREATE
router.post('/', async (req: Request, res: Response) => {
    const newCourse = req.body;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            const userData = req.body;
            console.error('Error creating  userData:', userData);
            let reqToken = req.headers.authorization.split(' ')[1];
            console.log("req Tocken ", reqToken);
            const decoded = await authService.verifyToken(reqToken);
            console.log('Decoded Token:', decoded);
            (req as any).decodedUser = decoded;
            const isAdmin = await authService.verifyRights(decoded.username);
            console.log(" ADMIN ", isAdmin);
            // Check if the decoded user has admin rights

            if (isAdmin) {
                // Create the new user
                const createdCourse = await DegreeCourseService.createDegreeCourse(newCourse);
                if (createdCourse) {
                    res.status(201).json({ message: 'Degree course created successfully' });
                } else {
                    res.status(400).json({ error: 'Failed to create degree course' });
                }
                res.status(400).json({ message: 'User creation failed' });
            }
        } else {
            res.status(401).send("Only administrators can create users");
        }
    }
    catch (error) {
        console.error('Error creating degree course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//UPDATE 
router.put('/:id', async (req: Request, res: Response) => {
    const id = req.body.id;
    const updatedCourse = req.body;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            const userData = req.body;
            console.error('Error creating  userData:', userData);
            let reqToken = req.headers.authorization.split(' ')[1];
            console.log("req Tocken ", reqToken);
            const decoded = await authService.verifyToken(reqToken);
            console.log('Decoded Token:', decoded);
            (req as any).decodedUser = decoded;
            const isAdmin = await authService.verifyRights(decoded.username);
            console.log(" ADMIN ", isAdmin);
            // Check if the decoded user has admin rights

            if (isAdmin) {
                const updated = await DegreeCourseService.updateDegreeCourseById(id, updatedCourse);
                if (updated) {
                    res.json({ message: 'Degree course updated successfully', updated });
                } else {
                    res.status(404).json({ error: 'Degree course not found' });
                }
            } else {
                res.status(401).send("Only administrators can update degreeCourse");
            }
        } else {
            res.status(401).send("NO AUTH");
        }
    } catch (error) {
        console.error('Error updating degree course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE BY ID
router.delete('/:id', async (req: Request, res: Response) => {
    const id = req.body.id;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            const userData = req.body;
            console.error('Error creating  userData:', userData);
            let reqToken = req.headers.authorization.split(' ')[1];
            console.log("req Tocken ", reqToken);
            const decoded = await authService.verifyToken(reqToken);
            console.log('Decoded Token:', decoded);
            (req as any).decodedUser = decoded;
            const isAdmin = await authService.verifyRights(decoded.username);
            console.log(" ADMIN ", isAdmin);
            // Check if the decoded user has admin rights

            if (isAdmin) {
                const success = await DegreeCourseService.deleteDegreeCourseById(id);
                if (success) {
                    res.json({ message: 'Degree course deleted successfully' });
                } else {
                    res.status(404).json({ error: 'Degree course not found' });
                }
            } else {
                res.status(401).send("Only administrators can update degreeCourse");
            }
        } else {
            res.status(401).send("NO AUTH");
        }
    } catch (error) {
        console.error('Error deleting degree course:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
