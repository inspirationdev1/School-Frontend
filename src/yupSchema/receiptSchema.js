import * as yup from 'yup';

export const receiptSchema = yup.object({
    receiptCode: yup.string().min(3, "Must contain 3 character.").required("Rec Code is  required."),
    receiptDate: yup.string().min(3, "Must Contain 3 Character.").required("Receipt Date is  required."),
    paymentMethod: yup.string().min(1, "Must Contain 3 Character.").required("paymentMethod is  required."),
    status: yup.string().min(1, "Must Contain 3 Character.").required("status is  required."),
    remarks: yup.string().min(3, "Must Contain 3 Character.")
})