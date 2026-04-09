import * as yup from 'yup';

export const departmentSchema = yup.object({
    department_name: yup.string().min(3, "Must contain 3 character.").required("Department Name is  required."),
    department_code: yup.string().required("Department Code is  required.")
})