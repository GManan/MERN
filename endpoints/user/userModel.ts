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
        required: true
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
    console.log("docToUpdate ", docToUpdate); // The document that `findOneAndUpdate()` will modify
    // const user = this as IUser;

    // const update: any = this.getUpdate();
    // console.log("GETUPTADE", update)
    // if (update && update.password) {

    //     update.password = bcrypt.hashSync(update.password, 10);
    //     console.log("update.password", update.password);
    // }

})
// })

// 3. Hashing the password with a pre-save hook when created.
// userSchema.pre<IUser>('findOneAndUpdate', async function (next) {
//     // console.log("IN pre findOneAndUpdate hook", this);
//     // const update = this.getUpdate() as Partial<IUser>;

//     const user = this as IUser;
//     console.log("this v66666666666666666666", user.password)
//     // if (!user.isModified('password')) {
//     //     return next();
//     // }
//     const query = this; // The query being executed
//     const filter = query.getFilter(); // The filter used in the query

//     try {
//         const hashedPassword = await bcrypt.hash(user.password, 10);
//         user.password = hashedPassword;
//         next();
//     } catch (Error: any) {
//         return next(Error);
//     }
// })

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
