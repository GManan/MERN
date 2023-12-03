// AuthenticationRouter.ts
import express, { NextFunction } from "express";
import { authService } from "./authService";
import logger from "../../httpServer";
const authRouter = express.Router();

// authRouter.get('/api/authenticate', async (req: CustomRequest, res) => {
const handleAuthenticate = async (req: any, res: any, next: NextFunction) => {


    //credentials
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"', 'charSet="UTF-8"');
        res.status(401).json({ message: 'Missing Authorization Header' });
    } else {

        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [userId, password] = credentials.split(':');
        const userToken: any = await authService.authenticateAndToken({ userId, password });

        if (!userToken) {
            return res.status(401).json({ Error: 'Invalid authentication credentials' });
        }
        //add tokcer to the header
        res.setHeader('Authorization', "Bearer " + userToken.token)
        res.setHeader('isAdmin', userToken.isAdmin)
        res.status(200).send({ success: "Logged in" });
    }
};
// authRouter.get(["/api/users", '/api/users/:userID'], async (req: CustomRequest, res, next) => {
const handleAuthorization = async (req: any, res: any, next: NextFunction) => {
    // console.log("USER MIDDLEWARE", req.path);
    // console.log("USER methods", req.method);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        const reqToken = req.headers.authorization.split(' ')[1];

        try {

            const decoded = await authService.verifyToken(reqToken);
            logger.info(`TOKEN PROVIDED  ${reqToken}`);

            const user = await authService.verifyRightsAdmin(decoded.userId)
            const resource = req.path.split("/")[2];
            if (user) {
                req.isAdmin = user.isAdministrator;
                req.username = user.userID;
                res.setHeader('Authorization', "Bearer " + reqToken);
                res.setHeader('isAdmin', `${user.isAdministrator}`);
                res.setHeader('Username', `${user.userID}`);
                next()
            } else {
                res.status(409).json({ Error: `No user with id ${decoded.userId}`, });
            }
        } catch (error) {

            res.status(401).json({ Error: 'Authentication failed' });
        }


    } else {

        res.status(401).json({ error: 'NO Authorization Token' });
    }
};

authRouter.get('/api/authenticate', handleAuthenticate)

const protectedRoutes = [
    '/api/users',
    '/api/users/:userID',
    '/api/degreeCourses',
    '/api/degreeCourses/:id',
    '/api/degreeCourseApplications',
    '/api/degreeCourseApplications/myApplications'
];

authRouter.use(protectedRoutes, handleAuthorization);

export = authRouter;
