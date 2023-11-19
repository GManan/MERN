// AuthenticationRouter.ts
import express from "express";
import { authService } from "./authService";
const authRouter = express.Router();

authRouter.get('/', async (req, res, next) => {
    console.log("MIDDLEWARE:  req from authenticate", req.headers);
    console.log("req.headers.authorization.indexOf('Basic ')", req.headers.authorization?.indexOf('Basic '));

    //TOKEN
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        let reqToken = req.headers.authorization.split(' ')[1];
        console.log("req Tocken ", reqToken);

    }
    //credentials
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        return res.status(401).json({ message: 'Missing Authorization Header Gib die daten' });
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    const token = await authService.authenticateAndToken({ username, password });
    console.log("Tocken ", token);
    if (!token) {
        return res.status(401).json({ message: 'Invalid Authentication Credentials' });
    }

    //add tokcer to the header
    res.setHeader('Authorization', "Bearer " + token)
    console.log('This is a token.', token);
    console.log('This is a middleware.', res.getHeader);
    next();
});

export = authRouter;
