import * as yup from "yup";

export const openingstockdetailSchema = yup.object({
  item: yup.mixed().required("Item is required."),
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .moreThan(0, "Quantity must be greater than zero")
    .required("Quantity is required."),
  purchase_price: yup
    .number()
    .typeError("Rate must be a number")
    .min(0, "Rate cannot be negative")
    .required("Rate is required."),
  grossAmount: yup
    .number()
    .typeError("Amount must be a number")
    .min(0, "Amount cannot be negative")
    .required("Amount is required."),
  remarks: yup.string().max(500, "Remarks cannot exceed 500 characters."),
});
