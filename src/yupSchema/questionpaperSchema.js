import * as yup from 'yup';

export const questionpaperSchema = yup.object({
    name:yup.string(),
//     description:yup.string(),
//     date:yup.string().required("questionpaper  date is required."),
//     class:yup.string().required("Class is a required field."),
//     subject:yup.string().required("Subject is a required field."),
//    teacher:yup.string().required("Teacher is a required field."),
//    examination:yup.string().required("Examination is a required field."),
//    examtype:yup.string(),
//    fileType:yup.string(),
//    fileName:yup.string(),
})