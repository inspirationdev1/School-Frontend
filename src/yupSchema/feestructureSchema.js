import * as yup from 'yup';

export const feestructureSchema = yup.object({
    name: yup.string().min(3, "Must contain 3 character.").required("Feestructure Name is  required."),
    code: yup.string().min(3,"Must Contain 3 Character.").required("Feestructure Codename is  required."),
    class: yup.string().min(3,"Must Contain 3 Character.").required("Class is  required."),
    feestype: yup.string().min(3,"Must Contain 3 Character.").required("Feestype is  required."),
    amount: yup
            .number()
            .typeError("Amount must be a number")
            .moreThan(0, "Amount must be greater than zero")
            .required("Amount is required")
})