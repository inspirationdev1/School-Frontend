import * as yup from 'yup';

export const screenSchema = yup.object({
    screen_name: yup.string().min(3, "Must contain 3 character.").required("Screen Name is  required."),
    screen_code: yup.string().min(3,"Must Contain 3 Character.").required("Screen Code is  required."),
    
    
})