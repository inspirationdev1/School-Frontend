import * as yup from 'yup';

export const expensetypeSchema = yup.object({
    expensetype_name: yup.string().min(3, "Must contain 3 character.").required("Expensetype Name is  required."),
    expensetype_code: yup.string().required("Expensetype Code is  required.")
})