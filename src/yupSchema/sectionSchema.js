import * as yup from 'yup';

export const sectionSchema = yup.object({
    section_name: yup.string().min(3, "Must contain 3 character.").required("Section Name is  required."),
    section_code: yup.string().required("Section Code is  required.")
})