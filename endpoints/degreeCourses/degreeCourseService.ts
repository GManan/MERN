// degreeCourse.service.ts
import { IDegreeCourse, DegreeCourse } from './degreeCoursesModel';

export async function getAllDegreeCourses(): Promise<IDegreeCourse[]> {
    return await DegreeCourse.find();
}

export async function createDegreeCourse(degreeCourseData: any): Promise<IDegreeCourse | null> {
    if (degreeCourseData) {
        // Check if degree course exists
        const existingDegreeCourse = await DegreeCourse.findOne({ id: degreeCourseData.id });
        if (existingDegreeCourse) {
            console.error(`Degree course with id ${degreeCourseData.id} already exists`);
            return null;
        }

        const degreeCourse = new DegreeCourse(degreeCourseData);
        return await degreeCourse.save();
    } else {
        console.error('No degree course data provided');
        return null;
    }
}

export async function getDegreeCourseById(degreeCourseId: string): Promise<IDegreeCourse | null> {
    return await DegreeCourse.findOne({ id: degreeCourseId });
}

export async function updateDegreeCourseById(degreeCourseId: string, updatedDegreeCourseData: IDegreeCourse): Promise<IDegreeCourse | null> {
    return await DegreeCourse.findOneAndUpdate({ id: degreeCourseId }, updatedDegreeCourseData, { new: true });
}

export async function deleteDegreeCourseById(degreeCourseId: string): Promise<boolean> {
    const result = await DegreeCourse.deleteOne({ id: degreeCourseId });
    return result.deletedCount === 1;
}
