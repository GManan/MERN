// import { User } from "././"
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { IUser, User } from '../user/userModel';

export const authService = {



    // Your userService functions and logic

    async authenticateAndToken({ userId, password }: { userId: string, password: string }) {
        const user = await User.findOne({ userID: userId }).select("+password");
        if (!user) {
            return null;
        }
        return new Promise((resolve, reject) => {
            user.comparePassword(password, async (err, isMatch) => {
                if (err) {
                    console.error(`Error comparing passwords: ${err}`);
                    resolve(null);
                    // return;
                }

                console.log("USER FOUND ", user.isAdministrator);
                if (isMatch) {
                    const key = config.jwtKey;
                    console.log("SAME PASSWORD. start creating the token");
                    const token = jwt.sign({ userId }, key, {
                        algorithm: 'HS256',
                        expiresIn: config.jwtExpirySeconds,
                    })
                    console.log("TOKEN ", token);
                    resolve({ token: token, isAdmin: user.isAdministrator });

                } else {
                    // Passwords don't match
                    console.log("Different passwods: ");
                    resolve(null);

                }
            })
        })
    },

    async verifyToken(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.jwtKey, (err, decoded) => {
                if (err) {
                    console.error(`Error verifying token: ${err}`);
                    reject(`Error verifying token: ${err}`);
                } else {
                    console.log('Token is valid');
                    resolve(decoded);
                }
            });
        });
    },
    async verifyRightsAdmin(userId: string): Promise<any> {
        return await User.findOne({ userID: userId }).select(["-password", "_id"]);

    }
}