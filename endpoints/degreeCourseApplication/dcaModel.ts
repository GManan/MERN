import { Schema, model } from "mongoose";
export interface IDegreeCourseApp extends Document {
    applicantUserID: string;
    degreeCourseID: string;
    targetPeriodYear: string;
    targetPeriodShortName: string;
}
const dcaSchema = new Schema<IDegreeCourseApp>({
    applicantUserID: { type: String },
    degreeCourseID: { type: String },
    targetPeriodYear: {
        type: String,
        required: true,
        validate: {
            validator: function (value: string) {
                const currentYear = new Date().getFullYear();
                const targetYear = parseInt(value, 10);
                if (targetYear < currentYear) {
                    return false;
                }
                if (targetYear > currentYear + 2) {
                    return false;
                }
                return true;
            },
            message: 'Invalid target period year',
        },
    },
    targetPeriodShortName: { type: String },
});
export const DegreeCourseApp = model<IDegreeCourseApp>('DegreeCourseApp', dcaSchema)