import express from 'express'
import { IUser, User } from './userModel';
import logger from '../../httpServer';
import bcrypt from 'bcryptjs';
const router = express.Router();


export async function getAll(): Promise<IUser[]> {
    const allUsers: IUser[] = await User.find();
    return allUsers;

}

export async function createPublicUser(userData: any) {
    if (userData && userData.userID) {
        //check if user exists 
        const existingUser = await User.findOne({ userID: userData.userID });
        if (existingUser != null) {
            logger.error(`User with userID ${userData.userID} already exists`)
            return null
        }

        //hash the password
        // const hashValue = await hashPassword(userData.password);
        const user = new User({
            userID: userData.userID,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: userData.password,
            isAdministrator: userData.isAdministrator
        });


        return await user.save();
    }
    else {
        console.log("Have no user data")
        return null;
    }
}


export async function getUserByUserID(userId: string): Promise<IUser | null> {

    const existingUser = await User.findOne({ userID: userId });
    return existingUser;
    // return await User.findOne({ userID: userId }).select("-password");
}

export async function updateUserByUserID(userId: string, updatedUserData: IUser) {
    console.log("updateUserByUserID CALLED", updatedUserData);
    const candidatePassword = updatedUserData.password;
    // Check if user exists
    const existingUser = await User.findOne({ userID: userId });
    console.log("user id ", userId);
    console.log("existingUser ", existingUser);

    if (existingUser == null) {
        logger.error(`User with userID ${userId} does not exist`);
        return null;
    }
    // Check if updatedUserData has a password
    if (candidatePassword) {
        updatedUserData.password = await hashPassword(candidatePassword);

    }

    const updatedUser = await User.findOneAndUpdate({ userID: userId }, updatedUserData, { new: true })
    console.log(`User with userID ${userId} updated successfully`);
    return updatedUser;
}



export async function deletePublicUser(userId: string) {
    const user = await User.findOne({ userID: userId });
    if (user === null) {
        logger.error(`User with userID ${userId} does not exists`)
        return null
    }
    const returnVal = await User.deleteOne({ userID: userId });
    return returnVal

}
async function hashPassword(password: string): Promise<string> {
    // const saltRounds = 10; // Number of salt rounds for hashing (adjust as needed)

    return bcrypt.hash(password, 10);
}