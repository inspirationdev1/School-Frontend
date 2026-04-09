import * as yup from 'yup';

export const feestructureSchema = yup.object({
    name: yup.string().required("Feestructure Name is  required."),
    code: yup.string().required("Feestructure Code is  required."),
    class: yup.string().required("Class is  required."),
    feestype: yup.string().required("Feestype is  required."),
    amount: yup
            .number()
            .typeError("Amount must be a number")
            .moreThan(0, "Amount must be greater than zero")
            .required("Amount is required")
})