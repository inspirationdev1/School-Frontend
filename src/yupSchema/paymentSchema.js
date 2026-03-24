import * as yup from 'yup';

export const paymentSchema = yup.object({
    paymentCode: yup.string().min(3, "Must contain 3 character.").required("Pay Code is  required."),
    paymentDate: yup.string().min(3, "Must Contain 3 Character.").required("Payment Date is  required."),
    paymentMethod: yup.string().min(1, "Must Contain 3 Character.").required("paymentMethod is  required."),
    status: yup.string().min(1, "Must Contain 3 Character.").required("status is  required."),
    remarks: yup.string().min(3, "Must Contain 3 Character."),
    year: yup.string().required("Year is required"),
})