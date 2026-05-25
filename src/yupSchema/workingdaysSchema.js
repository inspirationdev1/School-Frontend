import * as yup from 'yup';

export const workingdaysSchema = yup.object({
    year: yup.string().required("Year  required."),
    month: yup.string().required("Month is required"),
    work_days: yup
        .number()
        .typeError("Work Days be a number")
        .moreThan(0, "Work Days must be greater than zero")
        .required("Work Days is required"),
    seq: yup
        .number()
        .typeError("Work Days be a number")
        .moreThan(0, "Work Days must be greater than zero")
        .required("Work Days is required"),

})