import * as yup from 'yup';

export const examSchema = yup.object({
    name:yup.string().required("Exam  Name is required."),
    examCode:yup.string().required("Exam Code is a required fild."),
    
})