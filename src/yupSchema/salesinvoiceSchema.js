import * as yup from 'yup';

export const salesinvoiceSchema = yup.object({
    siCode: yup.string().min(3, "Must contain 3 character.").required("SI Code is  required."),
    invoiceDate: yup.string().min(3, "Must Contain 3 Character.").required("Invoice Date is  required."),
    class: yup.string().min(3, "Must Contain 3 Character.").required("Class is  required."),
    section: yup.string().min(3, "Must Contain 3 Character.").required("Section is  required."),
    student: yup.string().min(3, "Must Contain 3 Character.").required("Student is  required."),
    // paymentStatus: yup.string().min(1, "Must Contain 3 Character.").required("paymentStatus is  required."),
    status: yup.string().min(1, "Must Contain 3 Character.").required("status is  required."),
    remarks: yup.string().min(3, "Must Contain 3 Character."),
    year: yup.string().required("Year is required"),

})