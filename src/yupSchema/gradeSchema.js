import * as yup from 'yup';

export const gradeSchema = yup.object({
    grade_code: yup.string().required("grade Code is  required."),
    gpa: yup.string().required("GPA is  required."),
    marks_limit: yup
        .number()
        .typeError("Markslimit must be a number")
        .moreThan(0, "Markslimit must be greater than zero")
        .required("Markslimit is required"),
    marks_min: yup
        .number()
        .typeError("Marks(Min) must be a number")
        .moreThan(-1, "Marks(Min) must be greater than -1")
        .required("Marks(Min) is required"),
    marks_max: yup
        .number()
        .typeError("Marks(Max) be a number")
        .moreThan(0, "Marks(Max) must be greater than zero")
        .required("Marks(Max) is required"),

})