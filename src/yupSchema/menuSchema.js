import * as yup from 'yup';

export const menuSchema = yup.object({
    menu_name: yup.string().min(3, "Must contain 3 character.").required("Menu Name is  required."),
    menu_code: yup.string().min(3,"Must Contain 3 Character.").required("Menu Code is  required.")
})