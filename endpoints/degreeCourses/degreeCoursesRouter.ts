// degreeCourse.routes.ts
import express, { Request, Response } from 'express';
import * as DegreeCourseService from './degreeCourseService';
import { authService } from '../authentication/authService';

const router = express.Router();

// READ ALL
router.get('/', async (req: Request, res: Response) => {
    const filters = req.query;
    try {
        // if (Object.keys(filters).length > 0) {

        //     // const courses = await DegreeCourseService.searchByFilters();
        //     // res.status(200).json(courses);
        //     // todo implement queryparam filtering
        // }
        if (filters) {
            console.log("query.term ", filters);

        } else {

            // courses.filter()
        }
        console.log("filters in getuser ", filters);
        const courses = await DegreeCourseService.getAllDegreeCourses(filters);
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error getting degree courses:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// READ ONE
router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    console.log("id ", id)

    try {
        const course = await DegreeCourseService.getDegreeCourseById(id);
        console.log("course ", course);
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
                // const createdCourse = await DegreeCourseService.createDegreeCourse(newCourse);
                const createDegRes = await DegreeCourseService.createDegreeCourse(newCourse);
                // console.log("created COURSE ", createDegRes);
                console.log("createDegRes ", createDegRes);
                if (createDegRes.existingCourse) {

                    res.status(409).send(createDegRes.createdCourse);
                } else if (createDegRes.createdCourse) {
                    res.status(200).send(createDegRes.createdCourse)
                }
            }
            else {
                res.status(401).send("Only administrators can create users");
            }
        }
    }
    catch (error) {
        console.error('Error creating degree course:', error);
        res.status(409).json("no auth");
    }
});

//UPDATE 
router.put('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
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
    const id = req.params.id;
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
            // Check if the decoded user has admin  rights

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
