import * as yup from 'yup';

export const examinationSchema = yup.object({
    examination_name:yup.string().required("Exam  Name is required."),
    examination_code:yup.string().required("Exam Code is a required fild."),
    
})