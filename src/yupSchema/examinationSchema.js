import * as yup from 'yup';

export const examinationSchema = yup.object({
    examination_name:yup.string().required("Exam  Name is required."),
    examination_code:yup.string().required("Exam Code is a required ."),
    seq: yup
                        .number()
                        .typeError("Seq must be a number")
                        .moreThan(0, "Seq must be greater than zero")
                        .required("Seq is required"),
    
})