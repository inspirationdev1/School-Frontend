import * as yup from 'yup';

export const feestypeSchema = yup.object({
    feestype_name: yup.string().min(3, "Must contain 3 character.").required("Feestype Name is  required."),
    feestype_code: yup.string().required("Feestype Code is  required.")
})