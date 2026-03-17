import * as yup from 'yup';

export const expenseSchema = yup.object({
    expenseCode: yup.string().min(3, "Must contain 3 character.").required("Exp Code is  required."),
    expenseDate: yup.string().min(3, "Must Contain 3 Character.").required("Expense Date is  required."),
    paymentMethod: yup.string().min(1, "Must Contain 3 Character.").required("paymentMethod is  required."),
    status: yup.string().min(1, "Must Contain 3 Character.").required("status is  required."),
    remarks: yup.string().min(3, "Must Contain 3 Character.")
})