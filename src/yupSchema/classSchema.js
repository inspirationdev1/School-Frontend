import * as yup from 'yup';

export const classSchema = yup.object({
    class_code: yup.string().required("Class Code is  required."),
    class_name: yup.string().required("Class Name is  required.")
})