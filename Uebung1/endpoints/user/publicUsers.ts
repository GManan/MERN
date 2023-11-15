import express from 'express'
import { IUser, User } from './publicUsersModel';
import logger from '../../httpServer';
import bcrypt from 'bcryptjs';
const router = express.Router();


export async function getAll(): Promise<IUser[]> {
    const allUsers: IUser[] = await User.find();
    return allUsers;

}

export async function createPublicUser(userData: any) {
    if (userData) {
        //check if user exists 
        const existingUser = await User.findOne({ userID: userData.userID });
        if (existingUser != null) {
            logger.error(`User with userID ${userData.userID} already exists`)
            return null
        }

        //hash the password
        const hashValue = await hashPassword(userData.password);
        const user = new User({
            userID: userData.userID,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: hashValue,
            isAdministrator: userData.isAdministrator
        });


        return await user.save();
    }
    else {
        console.log("Have no user data")
    }
}

export async function updateUserByUserID(userId: string, updatedUserData: Partial<IUser>) {

    const updatedUser = await User.findOneAndUpdate({ userID: userId }, updatedUserData, { new: true });
    if (!updatedUser) {
        logger.error(`User with userID ${userId} does not exist`);
        return null;
    }
    logger.info("updated User ", JSON.stringify(updatedUser));
    return updatedUser

}
export async function getUserByUserID(userId: string): Promise<IUser | null> {
    return await User.findOne({ userID: userId });
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