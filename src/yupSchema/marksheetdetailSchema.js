import * as yup from 'yup';

export const marksheetdetailSchema = yup.object({
    student: yup.string().required("Student is  required."),
    marks: yup.number()
        .typeError("feeAmount amount must be a number"),
    remarks: yup.string().min(3, "Must Contain 3 Character.")
})