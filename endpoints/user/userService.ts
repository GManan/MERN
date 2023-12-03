import { User } from "./userModel";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const userService = {
    // Your userService functions and logic
    async authenticate({ username, password }: { username: string, password: string }) {


        const user = await User.findOne({ username });

        if (!user) {
            return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return null;
        }

        // Generate a JWT token with user information//MIGHT BE AN ISSUE HERE
        const token = jwt.sign({ userId: user._id, username: user.userID }, 'your-secret-key', { expiresIn: '1h' });

        return token;
    }
};