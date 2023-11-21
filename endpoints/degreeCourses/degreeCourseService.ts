// degreeCourse.service.ts
import { IDegreeCourse, DegreeCourse } from './degreeCoursesModel';

export async function getAllDegreeCourses(queryparam?: any): Promise<IDegreeCourse[]> {
    console.log("FILTER ", queryparam);
    return await DegreeCourse.find(queryparam);
}

export async function createDegreeCourse(degreeCourseData: any): Promise<{ createdCourse: IDegreeCourse | null, existingCourse: IDegreeCourse | null, message?: string }> {
    if (degreeCourseData) {
        // Check if degree course exists
        const existingDegreeCourse = await DegreeCourse.findOne({ id: degreeCourseData.id });
        if (existingDegreeCourse) {
            console.error(`Degree course with id ${degreeCourseData.id} already exists`);
            return { createdCourse: null, existingCourse: existingDegreeCourse, message: `Degree course with id ${degreeCourseData.id} already exists` };
        }
        const degreeCourse = new DegreeCourse(degreeCourseData);
        const savedDegreeCourse = await degreeCourse.save();
        return { createdCourse: savedDegreeCourse, existingCourse: null };
    } else {
        console.error('No degree course data provided');
        return { createdCourse: null, existingCourse: null, message: 'No degree course data provided' };
    }
}


export async function getDegreeCourseById(degreeCourseId: string): Promise<IDegreeCourse | null> {
    console.log("degreeCourseData.id  ", degreeCourseId)

    return await DegreeCourse.findOne({ id: degreeCourseId });
}

export async function updateDegreeCourseById(degreeCourseId: string, updatedDegreeCourseData: IDegreeCourse): Promise<IDegreeCourse | null> {
    console.log("degreeCourseId", degreeCourseId);
    return await DegreeCourse.findOneAndUpdate({ id: degreeCourseId }, updatedDegreeCourseData, { new: true });
}

export async function deleteDegreeCourseById(degreeCourseId: string): Promise<boolean> {
    const result = await DegreeCourse.deleteOne({ id: degreeCourseId });
    return result.deletedCount === 1;
}
