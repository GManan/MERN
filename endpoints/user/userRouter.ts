import express from 'express';
import { authService } from '../authentication/authService';
import { createPublicUser, deletePublicUser, getAll, getUserByUserID, updateUserByUserID } from './publicUsers';
import { IUser } from './userModel';

const userRouter = express.Router();


//READING ALL
userRouter.get('/', async (req, res) => {
    console.log("landed here after middleware", req.headers)

    // Check if has token todo: move into a middleware
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        let reqToken = req.headers.authorization.split(' ')[1];
        console.log("req Tocken ", reqToken);
        const decoded = await authService.verifyToken(reqToken);
        console.log('Decoded Token:', decoded);
        (req as any).decodedUser = decoded;
        let isAdmin = await authService.verifyRights(decoded.username)
        console.log(" ADMIN ", isAdmin);
        if (isAdmin) {
            getAll().then(
                resp => {
                    console.log("resp ", resp);
                    res.status(200).send(resp);
                },
                error => {
                    console.log("error catching here ", error);
                    res.status(500).send('Internal Server Error');
                }
            )
        }
        else {
            res.status(401).send(" Can't see all the users, only yourself ma'am ")
        }
        // next();
    } else {
        res.status(401).send("FAILURE: no rights to do anything here ")
    }
    //     // next();
})
//READING one user
userRouter.get('/:userID', async (req, res) => {
    console.log("landed here after middleware", req.headers)

    // Check if has token todo: move into a middleware
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        const userID = req.params.userID;

        let reqToken = req.headers.authorization.split(' ')[1];
        console.log("req Tocken ", reqToken);
        const decoded = await authService.verifyToken(reqToken);
        console.log('Decoded Token:', decoded);
        (req as any).decodedUser = decoded;
        let isAdmin = await authService.verifyRights(decoded.username)
        console.log(" ADMIN ", isAdmin);
        if (!isAdmin) {
            if (!(decoded.username == userID)) {
                res.status(401).send("FAILURE: no rights to do anything here ")
            } else {
                //todo dry this out
                getUserByUserID(userID).then(
                    resp => {
                        console.log("resp ", resp);
                        res.status(200).send(resp);
                    },
                    error => {
                        console.log("error catching here ", error);
                        res.status(500).send('Internal Server Error');
                    }
                )
            }
        } else
            if (isAdmin) {
                getUserByUserID(userID).then(
                    resp => {
                        console.log("resp ", resp);
                        res.status(200).send(resp);
                    },
                    error => {
                        console.log("error catching here ", error);
                        res.status(500).send('Internal Server Error');
                    }
                )
            }
            else {

                res.status(401).send(" Can't see all the users, only yourself ma'am ")
            }
        // next();
    } else {
        res.status(401).send("FAILURE: no rights to do anything here ")
    }
    //     // next();
})
//CREATE
userRouter.post("/", async (req, res) => {
    try {
        // Extract user data from the request body
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
                const newUser = await createPublicUser(userData);

                if (newUser) {
                    res.status(201).json({ message: 'User created successfully', user: newUser });
                } else {
                    res.status(400).json({ message: 'User creation failed' });
                }
            } else {

            }
        } else {
            res.status(401).send("Only administrators can create users");
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//UPDATE
userRouter.put("/:userID", async (req, res) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        const userID = req.params.userID;
        const updatedUserData = req.body;
        let reqToken = req.headers.authorization.split(' ')[1];
        console.log("req Tocken ", reqToken);
        const decoded = await authService.verifyToken(reqToken);
        console.log('Decoded Token:', decoded);
        (req as any).decodedUser = decoded;
        let isAdmin = await authService.verifyRights(decoded.username)
        console.log(" ADMIN ", isAdmin);
        console.log(" updatedUserData", updatedUserData)
        if (!isAdmin) {
            if (!(decoded.username == userID)) {
                res.status(401).send("FAILURE: no rights to do anything here ")
            } else {
                //todo dry this out
                if (isValidUpdateData(updatedUserData)) {
                    updateUserByUserID(userID, updatedUserData).then(
                        resp => {
                            console.log("resp ", resp);
                            res.status(200).send(resp);
                        },
                        error => {
                            console.log("error catching here ", error);
                            res.status(500).send('Internal Server Error');
                        }
                    )
                } else {
                    res.status(401).send("FAILURE: trying to change protected artibutes ")
                }

            }
        } else
            if (isAdmin) {
                updateUserByUserID(userID, updatedUserData).then(
                    resp => {
                        console.log("resp ", resp);
                        res.status(200).send(resp);
                    },
                    error => {
                        console.log("error catching here ", error);
                        res.status(500).send('Internal Server Error');
                    }
                )
            }
            else {

                res.status(401).send(" Can't see all the users, only yourself ma'am ")
            }
        // next();
    } else {
        res.status(401).send("FAILURE: no rights to do anything here ")
    }
})
//DELETE
userRouter.delete('/:userID', async (req, res) => {
    var userId = req.params.userID;
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
                if (userId) {
                    console.info("Deleting user with user id: ", userId);
                    const deletedUser = await deletePublicUser(userId);
                    if (deletedUser === null) {
                        return res.status(404).send(`User with userId ${userId} does not exists`);
                    }

                    res.send(`User with userId ${userId} is deleted`)
                } else {
                    return res.status(409).send("No UserId Provided")

                }
            } else {
                res.status(401).send("Only administrators can delete users");
            }
        } else {
            res.status(401).send("No Authentication");
        }
    } catch (error) {
        console.error("Error deleting user ", error);
        res.status(500).send("Initial Server Error");
    }
})
export default userRouter;


function isValidUpdateData(userData: Partial<IUser>) {
    const allowedAttributes = ['password', 'lastName', 'firstName'];

    // Check if userData only contains allowed attributes
    const keys = Object.keys(userData);
    const isValid = keys.every(key => allowedAttributes.includes(key));

    return isValid;
}

