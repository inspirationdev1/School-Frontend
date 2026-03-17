import * as yup from 'yup';

export const expensetypeSchema = yup.object({
    expensetype_name: yup.string().min(3, "Must contain 3 character.").required("Expensetype Name is  required."),
    expensetype_code: yup.string().min(3,"Must Contain 3 Character.").required("Expensetype Code is  required.")
})