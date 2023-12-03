// degreeCourse.service.ts
import mongoose from 'mongoose';
import { IDegreeCourse, DegreeCourse } from './degreeCoursesModel';

export async function getAllDegreeCourses(queryparam?: any): Promise<IDegreeCourse[]> {

    return await DegreeCourse.find(queryparam);
}

export async function createDegreeCourse(degreeCourseData: any): Promise<{ createdCourse: IDegreeCourse | null, existingCourse: IDegreeCourse | null, message?: string }> {
    if (degreeCourseData) {
        // Check if degree course exists
        const existingDegreeCourse = await DegreeCourse.findOne({ _id: degreeCourseData.id });


        // const existingDegreeCourse = await DegreeCourse.findOne(degreeCourseData);


        if (existingDegreeCourse) {

            return { createdCourse: null, existingCourse: existingDegreeCourse, message: `Degree course with id ${degreeCourseData.id} already exists` };
        }
        const degreeCourse = new DegreeCourse(degreeCourseData);
        const savedDegreeCourse = await degreeCourse.save();

        return { createdCourse: savedDegreeCourse, existingCourse: null };
    } else {

        return { createdCourse: null, existingCourse: null, message: 'No degree course data provided' };
    }
}


export async function getDegreeCourseById(degreeCourseId: string): Promise<IDegreeCourse | null> {

    //TODO TEST THIS  query, exec the schnickschnack
    if (!mongoose.Types.ObjectId.isValid(degreeCourseId)) {

        return null;
    }
    const foundCourse = await DegreeCourse.findById(degreeCourseId);

    return foundCourse
}

export async function updateDegreeCourseById(degreeCourseId: string, updatedDegreeCourseData: IDegreeCourse): Promise<IDegreeCourse | null> {

    return await DegreeCourse.findByIdAndUpdate(degreeCourseId, updatedDegreeCourseData, { new: true });
}

export async function deleteDegreeCourseById(degreeCourseId: string): Promise<boolean> {
    const result = await DegreeCourse.deleteOne({ _id: degreeCourseId });
    return result.deletedCount === 1;
}
