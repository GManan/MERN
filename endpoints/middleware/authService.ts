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

                    resolve(null);
                    // return;
                }


                if (isMatch) {
                    const key = config.jwtKey;

                    const token = jwt.sign({ userId }, key, {
                        algorithm: 'HS256',
                        expiresIn: config.jwtExpirySeconds,
                    })

                    resolve({ token: token, isAdmin: user.isAdministrator });

                } else {
                    // Passwords don't match

                    resolve(null);

                }
            })
        })
    },

    async verifyToken(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.jwtKey, (err, decoded) => {
                if (err) {

                    reject(`Error verifying token: ${err}`);
                } else {
                    resolve(decoded);
                }
            });
        });
    },
    async verifyRightsAdmin(userId: string): Promise<any> {
        return await User.findOne({ userID: userId }).select(["-password", "_id"]);

    }
}