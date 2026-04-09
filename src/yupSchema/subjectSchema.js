import * as yup from 'yup';

export const subjectSchema = yup.object({
    subject_name: yup.string().min(3, "Must contain 3 character.").required("Subject Name is  required."),
    subject_code: yup.string().required("Subject Code is  required.")
})