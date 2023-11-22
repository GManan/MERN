// AuthenticationRouter.ts
import express, { NextFunction } from "express";
import { authService } from "./authService";
import { error } from "winston";
import { CustomRequest } from "../../httpServer";
const authRouter = express.Router();

// authRouter.get('/api/authenticate', async (req: CustomRequest, res) => {
const authenticateMiddleware = async (req: any, res: any, next: NextFunction) => {
    console.log("API/AUTHENTICATE MIDDLEWARE:", req.path);
    //credentials
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        res.status(401).json({ message: 'Missing Authorization Header' });
    } else {

        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [userId, password] = credentials.split(':');
        const userToken: any = await authService.authenticateAndToken({ userId, password });

        if (!userToken) {
            return res.status(401).json({ Error: 'Failed to create token: Authentication failed' });
        }
        //add tokcer to the header
        res.setHeader('Authorization', "Bearer " + userToken.token)
        res.setHeader('isAdmin', userToken.isAdmin)
        console.log('This is a middleware.', res.header);
        res.status(200).send({ success: "Logged in" });
    }
};
// authRouter.get(["/api/users", '/api/users/:userID'], async (req: CustomRequest, res, next) => {
const authorizationMiddleware = async (req: any, res: any, next: NextFunction) => {
    console.log("USER MIDDLEWARE", req.headers);
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        const reqToken = req.headers.authorization.split(' ')[1];
        console.log(" Tocken ", reqToken);
        try {

            const decoded = await authService.verifyToken(reqToken);
            console.log("TOKEN PROVIDED")
            console.log('Decoded Token:', decoded);
            const user = await authService.verifyRightsAdmin(decoded.userId)

            console.log('USER:', user);
            if (user) {
                req.isAdmin = user.isAdministrator;
                req.username = user.userID;
                res.setHeader('Authorization', reqToken);
                res.setHeader('isAdmin', `${user.isAdministrator}`);
                res.setHeader('Username', `${user.userID}`);
                next()
            } else {
                res.status(409).json({ Error: `No user with id ${decoded.userId}` });
            }
        } catch (error) {
            console.log(" ERROR ", error);
            res.status(401).json({ Error: 'Authentication failed' });
        }


    } else {
        console.log("NO TOKEN PROVIDED")
        res.status(401).json({ message: 'NO Authorization Token' });
    }
};

authRouter.get('/api/authenticate', authenticateMiddleware)

authRouter.get(['/api/users', '/api/users/:userID'], authorizationMiddleware);
authRouter.post('/api/users', authorizationMiddleware);
authRouter.put('/api/users/:userId', authorizationMiddleware);
authRouter.delete('/api/users/:userId', authorizationMiddleware);


// authRouter.get(['/api/degreeCourses', '/api/degreeCourses/:id'], authorizationMiddleware);
authRouter.post('/api/degreeCourses', authorizationMiddleware);
authRouter.put('/api/degreeCourses/:id', authorizationMiddleware);
authRouter.delete('/api/degreeCourses/:id', authorizationMiddleware);


export = authRouter;
