import * as yup from 'yup';

export const screenSchema = yup.object({
    screen_name: yup.string().min(3, "Must contain 3 character.").required("Screen Name is  required."),
    screen_code: yup.string().required("Screen Code is  required."),
    
    
})