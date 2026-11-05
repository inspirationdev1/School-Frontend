import * as yup from "yup";

export const itemtypeSchema = yup.object({
  itemtype_name: yup
    .string()
    .min(3, "Must contain 3 character.")
    .required("Itemtype Name is  required."),
  itemtype_code: yup.string().required("Itemtype Code is  required."),
});
