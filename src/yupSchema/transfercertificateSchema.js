import * as yup from 'yup';

export const transfercertificateSchema = yup.object({
    transfercertificate_name: yup.string().min(3, "Must contain 3 character.").required("transfercertificate Name is  required."),
    transfercertificate_code: yup.string().required("transfercertificate Code is  required."),
    docDate: yup.string().required("Doc Date is  required."),
    leaveDate: yup.string().required("Doc Date is  required."),
    class: yup.string().required("Class  is  required."),
    section: yup.string().required("Section  is  required."),
    student: yup.string().required("Student  is  required."),
     year: yup.string().required("Year is required"),

})