// degreeCourse.model.ts
import { Schema, model, Document } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface IDegreeCourse extends Document {
    id: string;
    name: string;
    shortName: string;
    universityName: string;
    universityShortName: string;
    departmentName: string;
    departmentShortName: string;
}

// 2. Create a Schema corresponding to the document interface.
const degreeCourseSchema = new Schema<IDegreeCourse>({
    id: { type: String },
    name: { type: String },
    shortName: { type: String },
    universityName: { type: String },
    universityShortName: { type: String },
    departmentName: { type: String },
    departmentShortName: { type: String },
});

// 3. Create a Model.
export const DegreeCourse = model<IDegreeCourse>('DegreeCourse', degreeCourseSchema);
