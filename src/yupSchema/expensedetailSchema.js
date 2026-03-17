import * as yup from 'yup';

export const expensedetailSchema = yup.object({
    expenseAmount: yup
        .number()
        .typeError("Expense amount must be a number")
        .moreThan(0, "Expense amount must be greater than zero")
        .required("Expense amount is required"),
    remarks: yup.string().min(3, "Must Contain 3 Character.")
})