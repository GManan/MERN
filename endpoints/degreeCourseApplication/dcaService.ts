// import { IDegreeCourse } from "../degreeCourses/degreeCoursesModel";
import { DegreeCourse } from "../degreeCourses/degreeCoursesModel";
import { DegreeCourseApp, IDegreeCourseApp } from "./dcaModel";
// import { DegreeCourseApp, DegreeCourseAppApp, IDegreeCourseAppApp } from "./dcaModel";

export async function getAllDegreeCourseApps(queryparam?: any): Promise<IDegreeCourseApp[]> {

    return await DegreeCourseApp.find(queryparam);
}

export async function createDegreeCourseApp(degreeCourseAppData: any): Promise<{ createdCourse: IDegreeCourseApp | null, existingCourse: IDegreeCourseApp | null, message?: string }> {


    if (degreeCourseAppData) {
        // Check if degree course exists
        const existingDegreeCourseApp = await DegreeCourseApp.findOne(degreeCourseAppData);


        if (existingDegreeCourseApp) {

            return { createdCourse: null, existingCourse: existingDegreeCourseApp, message: `Degree course with id ${degreeCourseAppData.id} already exists` };
        }
        const degreeCourseApp = new DegreeCourseApp(degreeCourseAppData);
        const savedDegreeCourseApp = await degreeCourseApp.save();
        return { createdCourse: savedDegreeCourseApp, existingCourse: null };
    } else {

        return { createdCourse: null, existingCourse: null, message: 'No degree course data provided' };
    }
}


export async function getDegreeCourseAppById(degreeCourseAppId: string): Promise<IDegreeCourseApp | null> {


    return await DegreeCourseApp.findOne({ id: degreeCourseAppId });
}

export async function updateDegreeCourseAppById(degreeCourseAppId: string, updatedDegreeCourseAppData: IDegreeCourseApp): Promise<IDegreeCourseApp | null> {

    return await DegreeCourseApp.findOneAndUpdate({ id: degreeCourseAppId }, updatedDegreeCourseAppData, { new: true });
}

export async function deleteDegreeCourseAppById(degreeCourseAppId: string): Promise<boolean> {
    const result = await DegreeCourseApp.deleteOne({ _id: degreeCourseAppId });
    return result.deletedCount === 1;
}
