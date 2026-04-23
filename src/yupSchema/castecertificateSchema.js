import * as yup from 'yup';

export const castecertificateSchema = yup.object({
    castecertificate_name: yup.string().min(3, "Must contain 3 character.").required("castecertificate Name is  required."),
    castecertificate_code: yup.string().required("castecertificate Code is  required."),
    docDate: yup.string().required("Doc Date is  required."),
    class: yup.string().required("Class  is  required."),
    section: yup.string().required("Section  is  required."),
    student: yup.string().required("Student  is  required."),
     year: yup.string().required("Year is required"),

})