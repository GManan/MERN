import express from 'express';
import winston from 'winston';
import { config } from './config';
import { startDB } from './db/Database';
import dgRouter from './endpoints/degreeCourses/degreeCoursesRouter';
import authMiddleware from './endpoints/middleware/AuthMiddleware';
import { createPublicUser, deletePublicUser, getAll, getUserByUserID, updateUserByUserID } from './endpoints/user/publicUsers';
import userRouter from './endpoints/user/userRouter';
// import dgaRouter from './endpoints/degreeCourseApplication/dcaRouter'
import dcaRouter from './endpoints/degreeCourseApplication/dcaRouter';
import { User } from './endpoints/user/userModel';
import https from 'https';
import fs from 'fs';

const key = fs.readFileSync('./certificates/key.pem');
const cert = fs.readFileSync('./certificates/cert.pem');
const app = express();
app.use(express.json());


const server = https.createServer({ key: key, cert: cert }, app)

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        // contextFormatter(),
        winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console()
    ]

})
export default logger;
export interface CustomRequest extends express.Request {
    isAdmin?: boolean;
    username?: String
}

export async function createDefaultAdminUser() {
    const adminExists = await User.findOne({ userID: 'admin' });
    if (!adminExists) {

        // Create the default admin user
        const adminUser = new User({
            userID: 'admin',
            password: '123',
            isAdministrator: true
        });

        await adminUser.save();

    }
}
// ###############################################################################################



// PUBLIC USERTS: not refactoring cz ig we gonna delete it later?
//CREATE
app.post('/api/publicUsers', async (request: any, response: any) => {
    var userData = request.body;
    try {
        if (userData && userData.password && userData.userID) {
            logger.info("Creating new user with data: ", userData);
            const createdUser = await createPublicUser(request.body);
            if (createdUser === null) {
                response.status(409).send(`User with userId ${userData.userID} already exists`);
                return
            }

            response.send(createdUser);
        } else {
            logger.error("Bad request body");
            response.status(400).send("Bad Request: Incomplete body")
        }
    } catch (error) {
        logger.error("Error creating user ", error);
        response.status(500).send("Internal Server Error");
    }
});

//READ
/** Adding the public user endpoint */
app.get('/api/publicUsers', async (request: any, response: any) => {

    getAll().then(
        resp => {

            response.status(200).send(resp);
        },
        error => {

            response.status(500).send('Internal Server Error');
        }
    )
});

//READ
/*Find user by userId*/
app.get('/api/publicUsers/:userID', async (request: any, response: any) => {
    const userID = request.params.userID;
    const userBody = request.body;
    try {
        if (userID) {
            const resp = await getUserByUserID(userID);
            if (resp) {

                response.status(200).send(resp);
            } else {
                response.status(404).send(`NO USER with the ID ${userID}`);
            }
        }
        else {

            response.status(400).send("User ID not provided");
        }
    } catch (error) {
        logger.error("Error creating user ", error);
        response.status(500).send("Internal Server Error");
    }
})

//UPDATE
app.put('/api/publicUsers/:userID', async (request: any, response: any) => {
    const userID = request.params.userID;
    const updatedUserData = request.body;
    try {
        if (userID) {
            const resp = await updateUserByUserID(userID, updatedUserData);
            if (resp) {

                // logger.info('user2upd', resp);
                response.status(200).send(resp);
            } else {
                response.status(404).send(`User with userId ${userID} does not exists`);
            }
        } else {

            return response.status(409).send("User ID not provided");
        }
    } catch (error) {
        logger.error("Error updating user ", error);
        response.status(500).send("Internal Server Error");
    }
})

//DELETE
app.delete('/api/publicUsers/:userID', async (request: any, response: any) => {
    var userId = request.params.userID;
    try {

        if (userId) {
            logger.info("Deleting user with user id: ", userId);
            const deletedUser = await deletePublicUser(userId);
            if (deletedUser === null) {
                return response.status(404).send(`User with userId ${userId} does not exists`);
            }

            response.send(`User with userId ${userId} is deleted`)
        } else {
            return response.status(409).send("No UserId Provided")

        }
    } catch (error) {
        logger.error("Error deleting user ", error);
        response.status(500).send("Initial Server Error");
    }
})
// ##############################################################################################


app.use(authMiddleware)
app.use(userRouter);
app.use(dgRouter)
app.use(dcaRouter)


createDefaultAdminUser();

// linke the app to the port
// const port = config.port
// app.listen(port, () => {
//     console.log(`Server up and listening on port ${port}`)
// })

server.listen(config.httpsPort, () => {

})

//start the database
startDB()


// module.exports = app;