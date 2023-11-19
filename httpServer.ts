import express from 'express';
import winston from 'winston';
import { config } from './config';
import { startDB } from './db/Database';
import authRouter from './endpoints/authentication/AuthenticationRouter';
import { createPublicUser, deletePublicUser, getAll, getUserByUserID, updateUserByUserID } from './endpoints/user/publicUsers';
import userRouter from './endpoints/user/userRouter';
import dgRouter from './endpoints/degreeCourses/degreeCoursesRouter'
import { User } from './endpoints/user/userModel';
const app = express();
app.use(express.json());


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

export async function createDefaultAdminUser() {
    const adminExists = await User.findOne({ userID: 'admin' });
    if (!adminExists) {
        console.log("No admin: creating default one")
        // Create the default admin user
        const adminUser = new User({
            userID: 'admin',
            password: '123',
            isAdministrator: true
        });

        await adminUser.save();
        console.log('Default admin user created successfully');
    }
}

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
            console.log("resp ", resp);
            response.status(200).send(resp);
        },
        error => {
            console.log("error catching here ", error);
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
            console.log("No user ID provided");
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
            // console.log("in update. uder id ", userID);
            // console.log("in update. uder updatedUserData ", updatedUserData.password);
            // logger.info("requested user with user ID: ", userID);


            const resp = await updateUserByUserID(userID, updatedUserData);
            if (resp) {
                console.log("respons from find by id ", resp);
                // logger.info('user2upd', resp);
                response.status(200).send(resp);
            } else {
                response.status(404).send(`User with userId ${userID} does not exists`);
            }
        } else {
            console.log("No user ID provided");
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

//middleware


app.use('/api/authenticate', authRouter)
// Route handling
app.get('/api/authenticate', (req, res) => {
    console.log("header ", res.getHeaders())
    console.log("req.headers.authorization ", req.headers.authorization);
    res.send('LOGGED IN');
});
app.post('/api/authenticate', (req, res) => {
    console.log("req.headers.authorization ", req.headers.authorization);
    res.send('Hello, this is a POST request to api/authenticate');
});
app.use("/api/users", userRouter);
app.use('/api/degreeCourses', dgRouter)
createDefaultAdminUser();
// linke the app to the port
const port = config.port
app.listen(port, () => {
    console.log(`Server up and listening on port ${port}`)
})


const errConst = {
    'VALIDATION_ERROR': 'ValidationError'
}
//start the database
startDB()


// module.exports = app;