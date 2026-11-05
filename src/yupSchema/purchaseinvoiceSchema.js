import * as yup from "yup";

export const purchaseinvoiceSchema = yup.object({
  invoiceDate: yup
    .string()
    .min(3, "Must Contain 3 Character.")
    .required("Invoice Date is  required."),
  supplier: yup
    .string()
    .min(3, "Must Contain 3 Character.")
    .required("Supplier is  required."),
  status: yup
    .string()
    .min(1, "Must Contain 3 Character.")
    .required("status is  required."),
});
