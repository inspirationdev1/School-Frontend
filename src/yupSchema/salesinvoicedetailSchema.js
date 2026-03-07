import * as yup from 'yup';

export const salesinvoicedetailSchema = yup.object({
    feestructure: yup.string().min(3, "Must Contain 3 Character.").required("Feestructure is  required."),
    feeFrequency: yup.string().min(1, "Must Contain 3 Character.").required("feeFrequency is  required."),
    feeAmount: yup.number()
        .typeError("feeAmount amount must be a number"),
    grossAmount: yup
        .number()
        .typeError("Gross amount must be a number")
        .moreThan(0, "Gross amount must be greater than zero")
        .required("Gross amount is required"),
    discountType: yup.string().min(1, "Must Contain 3 Character.").required("discountType is  required."),
    discountMonth: yup.number()
        .typeError("feeAmount amount must be a number"),
    discountPer: yup.number()
        .typeError("feeAmount amount must be a number"),
    discountAmount: yup.number()
        .typeError("feeAmount amount must be a number"),
    netAmount: yup
        .number()
        .typeError("Net amount must be a number")
        .moreThan(0, "Net amount must be greater than zero")
        .required("Net amount is required"),
    remarks: yup.string().min(3, "Must Contain 3 Character.")
})