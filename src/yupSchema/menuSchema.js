import * as yup from 'yup';

export const menuSchema = yup.object({
    menu_name: yup.string().min(3, "Must contain 3 character.").required("Menu Name is  required."),
    menu_code: yup.string().required("Menu Code is  required.")
})