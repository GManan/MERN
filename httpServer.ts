import { config } from './config';
import { startDB } from './db/Database';
import { createPublicUser, deletePublicUser, getAll, getUserByUserID, updateUserByUserID } from './endpoints/user/publicUsers';
import winston from 'winston';
import express from 'express';
import { IUser } from './endpoints/user/publicUsersModel';


const app = express()
app.use(express.json());

//create logger instance
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
    try {
        const users: IUser[] = await getAll();
        logger.info("Users:");
        users.forEach((user: IUser) => {
            logger.info(JSON.stringify(user));
        });
        response.send(users);
    } catch (error) {
        logger.error("Error:", error);
        response.status(500).send('Internal Server Error');
    }
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
                console.log("hhtp server 76 userBody password", userBody.password);
                console.log("hhtp server 76 userid", userID);
                logger.info('This is an info message', { file: __filename, line: 10 });
                logger.info("requested user with user ID http server: ", userID);
                logger.info("requested userBody with user ID: ", userBody);
                logger.info("INFO respons from find by id ", resp);
                console.log("INFO  1111111111respons from find by id ", resp);
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
            console.log("in update. uder id ", userID);
            console.log("in update. uder updatedUserData ", updatedUserData.password);
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

// linke the app to the port
const port = config.port
app.listen(port, () => {
    console.log(`Server up and listening on port ${port}`)
})

//start the database
startDB()