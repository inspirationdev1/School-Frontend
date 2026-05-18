import * as yup from 'yup';

export const gradeSchema = yup.object({
    grade_code: yup.string().required("grade Code is  required."),
    grade_name: yup.string().required("grade Name is  required."),
    grade_percentage: yup
                        .number()
                        .typeError("Seq must be a number")
                        .moreThan(0, "Seq must be greater than zero")
                        .required("Seq is required"),
})