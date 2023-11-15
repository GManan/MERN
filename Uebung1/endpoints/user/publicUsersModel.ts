import { Schema, model, connect } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface IUser {
    userID: string
    password: string
    firstName: string;
    lastName: string;
    isAdministrator?: boolean;
    eMail?: string
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
    userID: { type: String, required: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
    isAdministrator: Boolean,
    eMail: String
});

// 3. Create a Model.
export const User = model<IUser>('User', userSchema);
