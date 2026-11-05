import * as yup from "yup";

export const itemgroupSchema = yup.object({
  itemgroup_name: yup
    .string()
    .min(3, "Must contain 3 character.")
    .required("Itemgroup Name is  required."),
  itemgroup_code: yup.string().required("Itemgroup Code is  required."),
});
  