import * as yup from 'yup';

export const bonafidecertificateSchema = yup.object({
    bonafidecertificate_name: yup.string().min(3, "Must contain 3 character.").required("bonafidecertificate Name is  required."),
    bonafidecertificate_code: yup.string().required("bonafidecertificate Code is  required."),
    docDate: yup.string().required("Doc Date is  required."),
    class: yup.string().required("Class  is  required."),
    section: yup.string().required("Section  is  required."),
    student: yup.string().required("Student  is  required."),
     year: yup.string().required("Year is required"),

})