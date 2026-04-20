import * as yup from 'yup';

export const attendeeSchema = yup.object({
    class: yup.string().required("Class  is  required."),
    section: yup.string().required("Section  is  required."),
    teacher: yup.string().required("Student  is  required."),
})