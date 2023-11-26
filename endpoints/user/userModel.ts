// import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Document, Schema, model } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface IUser extends Document {
    userID: string;
    password: string;
    firstName: string;
    lastName: string;
    isAdministrator: boolean;
    eMail?: string;

    comparePassword(candidatePassword: string, callback: (err: Error | null, isMatch?: boolean) => void): void;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
    userID: { type: String, required: true },
    password: {
        type: String,
        required: true,
        select: false,
    },
    firstName: String,
    lastName: String,
    isAdministrator: {
        type: Boolean,
        default: false,
    },
    eMail: String
});
userSchema.pre<IUser>('findOneAndUpdate', { document: true, query: false }, function () {
    const docToUpdate = this.model().findOne(this.getChanges())
    console.log("docToUpdate ", docToUpdate);
})


userSchema.pre<IUser>('save', async function (next) {
    const user = this as IUser;
    // console.log("IN pre SAVE hook", this);

    if (!user.isModified('password')) {
        return next();
    }
    try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        console.log("securing the password");
        next();
    } catch (error: any) {
        return next(error);
    }
});

userSchema.methods.comparePassword = function (candidatePassword: string, callback: (err: Error | null, isMatch?: boolean) => void) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
};

// 4. Create a Model.
export const User = model<IUser>('User', userSchema);
