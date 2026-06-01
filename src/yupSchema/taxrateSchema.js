import * as yup from 'yup';

export const taxrateSchema = yup.object({
    tax_code: yup.string().required("tax Code is  required."),
    tax_name: yup.string().required("tax Name is  required."),
    tax_percent: yup
        .number()
        .typeError("Marks(Min) must be a number")
        .moreThan(-1, "Marks(Min) must be greater than -1")
        .required("Marks(Min) is required"),
    

})