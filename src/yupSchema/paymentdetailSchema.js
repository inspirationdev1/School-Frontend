import * as yup from 'yup';

export const paymentdetailSchema = yup.object({
    expenseAmount: yup
        .number()
        .typeError("Exp amount must be a number")
        .moreThan(0, "Exp amount must be greater than zero")
        .required("Exp amount is required"),
    paidAmount: yup
        .number()
        .typeError("Paid amount must be a number")
        .moreThan(0, "Paid amount must be greater than zero")
        .required("Paid amount is required"),
    remarks: yup.string().min(3, "Must Contain 3 Character.")
})