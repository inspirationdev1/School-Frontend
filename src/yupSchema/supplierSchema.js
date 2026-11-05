import * as yup from "yup";

export const supplierSchema = yup.object({
  name: yup
    .string()
    .min(4, "Name must contain 4 characters")
    .required("Name is required"),
  email: yup
    .string()
    .email("It must be an Email.")
    .min(4, "email must contain 4 characters")
    .required("email is required"),
  phone_no: yup
    .string()
    .min(10, "Phone must contain 10 characters")
    .required("Phone is required"),
});
