import * as yup from 'yup';

export const questionpaperSchema = yup.object({
    name: yup.string().required("Name is required."),
    description: yup.string(),
    date: yup.string().required("questionpaper  date is required."),
    class: yup.string().required("Class is a required field."),
    subject: yup.string().required("Subject is a required field."),
    teacher: yup.string().required("Teacher is a required field."),
    examination:yup.string().required("Examination is a required field."),
    marksLimit: yup
            .number()
            .typeError("Marks Limit must be a number")
            .moreThan(0, "Marks Limit must be greater than zero")
            .required("Marks Limit is required"),
    //fileType:yup.string(),
    fileName:yup.string().required("Examination is a required field."),
})