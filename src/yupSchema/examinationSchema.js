import * as yup from 'yup';

export const examSchema = yup.object({
    exam_date:yup.string().required("Exam  date is required."),
    subject:yup.string().required("Subject is a required fild."),
    examtype:yup.string().required("Examtype is a required fild."),
   
})