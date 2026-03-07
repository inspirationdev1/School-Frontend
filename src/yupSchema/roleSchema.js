import * as yup from 'yup';

export const roleSchema = yup.object({
    role_name: yup.string().min(3, "Must contain 3 character.").required("Role Name is  required."),
    role_code: yup.string().min(3,"Must Contain 3 Character.").required("Role Code is  required."),
    roleType: yup.string().min(3,"Must Contain 3 Character.").required("Role Type is  required."),
    
})