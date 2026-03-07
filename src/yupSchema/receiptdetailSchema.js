import * as yup from 'yup';

export const receiptdetailSchema = yup.object({
    invAmount: yup
        .number()
        .typeError("Gross amount must be a number")
        .moreThan(0, "Gross amount must be greater than zero")
        .required("Gross amount is required"),
    paidAmount: yup
        .number()
        .typeError("Net amount must be a number")
        .moreThan(0, "Net amount must be greater than zero")
        .required("Net amount is required"),
    remarks: yup.string().min(3, "Must Contain 3 Character.")
})