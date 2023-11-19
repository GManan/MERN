// import { User } from "././"
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { User } from '../user/userModel';

export const authService = {



    // Your userService functions and logic

    async authenticateAndToken({ username, password }: { username: string, password: string }) {
        console.log("data", username)
        console.log("data password", password)
        const user = await User.findOne({ userID: username });
        if (!user) {
            return null;
        }
        console.log("USER FOUND ");
        // const passwordMatch = await user.comparePassword(password, user.password);
        return new Promise((resolve, reject) => {
            user.comparePassword(password, async (err, isMatch) => {
                if (err) {
                    console.error(`Error comparing passwords: ${err}`);
                    return null;
                }

                if (isMatch) {
                    // passwordMatch = true;
                    //relocate
                    const key = config.jwtKey;
                    // const seconds = config.jwtExpirySeconds;

                    console.log("SAME PASSWORD. start creating the token");
                    const token = jwt.sign({ username }, key, {
                        algorithm: 'HS256',
                        expiresIn: config.jwtExpirySeconds,
                    })
                    console.log("TOKEN ", token);
                    resolve(token);
                } else {
                    // Passwords don't match
                    console.log("Different passwods: ");
                    resolve(null);

                }
            })
        })

        // Generate a JWT token with user information//MIGHT BE AN ISSUE HERE
        // const token = jwt.sign({ userId: user._id, username: user.userID }, 'your-secret-key', { expiresIn: '1h' });

    },
    async verifyToken(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.jwtKey, (err, decoded) => {
                if (err) {
                    console.error(`Error verifying token: ${err}`);
                    reject(err);
                } else {
                    console.log('Token is valid');
                    resolve(decoded);
                }
            });
        });
    },
    async verifyRights(username: string): Promise<boolean> {
        try {
            const user = await User.findOne({ userID: username });
            console.log('user ', user);
            console.log('is admin ', user?.isAdministrator);
            return user?.isAdministrator || false;

        } catch (error) {
            console.error('Error in verifyRights:', error);
            return false;
        }
    }
}