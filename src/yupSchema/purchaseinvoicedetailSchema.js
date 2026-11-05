import * as yup from "yup";

export const purchaseinvoicedetailSchema = yup.object({
  item: yup
    .string()
    .min(3, "Must Contain 3 Character.")
    .required("Feestructure is  required."),
  purchase_price: yup
    .number()
    .typeError("Purchase Price must be a number")
    .moreThan(0, "Purchase Price must be greater than zero"),
  grossAmount: yup
    .number()
    .typeError("Gross amount must be a number")
    .moreThan(0, "Gross amount must be greater than zero")
    .required("Gross amount is required"),
  discountType: yup
    .string()
    .min(1, "Must Contain 3 Character.")
    .required("discountType is  required."),
  discountMonth: yup.number().typeError("discount month must be a number"),
  discountPer: yup.number().typeError("discount per must be a number"),
  discountAmount: yup.number().typeError("discount amount must be a number"),
  netAmount: yup
    .number()
    .typeError("Net amount must be a number")
    .moreThan(0, "Net amount must be greater than zero")
    .required("Net amount is required"),
  remarks: yup.string().min(3, "Must Contain 3 Character."),
});
