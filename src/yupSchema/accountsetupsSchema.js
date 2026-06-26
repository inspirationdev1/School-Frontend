import * as yup from "yup";

export const accountsetupsSchema = yup.object({
  screen: yup.string().required("Screen Name is  required."),
  accountledger: yup.string().required("Accountledger is  required."),
  amount_type: yup.string().required("Amount type is  required."),
  mapping_type: yup.string().required("Mapping type is  required."),
  seq: yup.number().typeError("Seq must be a number"),
});
