import * as yup from 'yup';

export const accountlevelSchema = yup.object({
    accountlevel_name: yup.string().min(3, "Must contain 3 character.").required("Accountlevel Name is  required."),
    accountlevel_code: yup.string().required("Accountlevel Code is  required."),
    
})