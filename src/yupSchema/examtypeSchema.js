import * as yup from 'yup';

export const examtypeSchema = yup.object({
    examtype_name: yup.string().min(3, "Must contain 3 character.").required("Examtype Name is  required."),
    examtype_code: yup.string().required("Examtype Code is  required.")
})