import express from 'express';
import { CustomRequest } from '../../httpServer';
import { createPublicUser, deletePublicUser, getAll, getUserByUserID, updateUserByUserID } from './publicUsers';
import { IUser } from './userModel';

const userRouter = express.Router();


//READING ALL
userRouter.get('/api/users', async (req: CustomRequest, res) => {

    const token = req.headers.authorization?.split(' ')[1];
    const isAdmin = req.isAdmin;

    // const userId = req.username;
    res.setHeader('Authorization', `Bearer ${token}`);
    if (isAdmin) {
        getAll().then(
            resp => {
                // console.log("resp ", resp);
                res.status(200).send(resp);
            },
            error => {

                res.status(500).send('Internal Server Error');
            }
        )
    }
    else {
        res.status(401).send("No access to users")
    }

})

//READING one user
userRouter.get('/api/users/:userId', async (req: CustomRequest, res) => {
    // console.log("userRouter.get('/api/users/:userId' MIDDLEWARE  ",req.user.role)
    const token = req.headers.authorization?.split(' ')[1];
    const isAdmin = req.isAdmin;
    const username = req.username;
    const userToFetch = req.params.userId;

    res.setHeader('Authorization', token ? `Bearer ${token}` : 'none');
    res.setHeader('Username', `${username}`);
    // Check if the user is an admin or is trying to access their own information
    if (isAdmin || username === userToFetch) {
        try {
            const fetchedUser = await getUserByUserID(userToFetch);

            if (fetchedUser) {

                res.status(200).json(fetchedUser);
            } else {
                res.status(404).json({ Error: "User not found" });
            }
        } catch (error) {

            res.status(500).json({ Error: "Internal Server Error" });
        }
    } else {
        res.status(401).json({ Error: "Not Authorized" });
    }
});

//CREATE
userRouter.post("/api/users", async (req: CustomRequest, res) => {

    // const token = req.headers.authorization?.split(' ')[1];
    // const username = req.username;
    const isAdmin = req.isAdmin;
    const userData = req.body;
    if (!isAdmin) {
        res.status(401).json({ Error: 'Not Authorised to create a user' });
    }
    try {
        const newUser = await createPublicUser(userData);
        if (newUser === null) {
            res.status(401).json({ Error: `User already exists or  id not provided` });
            return
        } else {

            res.status(200).send(newUser);
        }
    } catch (error) {

        res.status(500).json({ message: 'Internal server error' });
    }
})

//UPDATE
userRouter.put("/api/users/:userID", async (req: CustomRequest, res) => {

    const isAdmin = req.isAdmin;
    const username = req.username;
    const userToUpd = req.params.userID;
    const updatedUserData = req.body;




    if (!isAdmin) {
        if (!(username == userToUpd)) {
            res.status(401).json({
                Error: `no rights to update user ${userToUpd}`
            })
        } else {
            //todo dry this out
            if (isValidUpdateData(updatedUserData)) {
                const updatedUser = await updateUserByUserID(userToUpd, updatedUserData);
                if (!updatedUser) {
                    return res.status(404).send('User not found');
                }

                res.status(200).send(updatedUser);
            } else {
                res.status(401).send("FAILURE: trying to change protected artibute ")
            }
        }
    } else if (isAdmin) {
        const updatedUser = await updateUserByUserID(userToUpd, updatedUserData)
        if (!updatedUser) {
            return res.status(404).send('User not found');
        }

        res.status(200).send(updatedUser);
    }

})
//DELETE
userRouter.delete('/api/users/:userID', async (req: CustomRequest, res) => {
    const userId = req.params.userID;
    const isAdmin = req.isAdmin;
    if (!isAdmin) {
        res.send(401).json({ Error: 'NO Authentication' });
    }
    try {
        console.info("Deleting user with user id: ", userId);
        const deletedUser = await deletePublicUser(userId);
        if (deletedUser === null) {
            return res.status(404).send(`User with userId ${userId} does not exists`);
        }
        res.status(204).send(`User with userId ${userId} is deleted`)

    } catch (error) {

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

