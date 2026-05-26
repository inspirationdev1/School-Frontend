import * as yup from 'yup';

export const classsubjectSchema = yup.object({
    class: yup.string().required("Class is  required."),
    subject: yup.string().required("Subject is required"),
    seq: yup
        .number()
        .typeError("Seq be a number")
        .moreThan(0, "Seq must be greater than zero")
        .required("Seq is required"),

})