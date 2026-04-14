import * as yup from 'yup';

export const appsettingSchema = yup.object({
    appsetting_name: yup.string().required("Appsetting Name is  required."),
    appsetting_code: yup.string().required("Appsetting Code is  required."),
    discPerAllowed: yup
        .number()
        .typeError("Disc Per must be a number")
        .min(0, "Minimum value is 0")
        .max(100, "Maximum value is 100")
        .required("Disc Per is required")
})