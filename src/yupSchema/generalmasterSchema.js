import * as yup from 'yup';

export const generalmasterSchema = yup.object({
    generalmaster_name: yup.string().required("Generalmaster Name is  required."),
    generalmaster_code: yup.string().required("Generalmaster Code is  required."),
    generalmaster_type: yup.string().required("Generalmaster Type is  required."),
})