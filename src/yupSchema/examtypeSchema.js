import * as yup from 'yup';

export const examtypeSchema = yup.object({
    examtype_name: yup.string().min(3, "Must contain 3 character.").required("Examtype Name is  required."),
    examtype_code: yup.string().min(3,"Must Contain 3 Character.").required("Examtype Codename is  required.")
})