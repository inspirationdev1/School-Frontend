import * as yup from 'yup';

export const receiptSchema = yup.object({
    receiptNumber: yup.string().required("Rec Number is  required."),
    receiptDate: yup.string().required("Receipt Date is  required."),
    paymentMethod: yup.string().required("paymentMethod is  required."),
    status: yup.string().required("status is  required."),
    year: yup.string().required("Year is required"),
})