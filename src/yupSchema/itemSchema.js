import * as yup from "yup";

export const itemSchema = yup.object({
  name: yup.string().required("Item Name is  required."),
  code: yup.string().required("Item Code is  required."),
  itemtype: yup.string().required("Itemtype is  required."),
  itemgroup: yup.string().required("Itemgroup is  required."),
  sales_price: yup
    .number()
    .typeError("Sales Price must be a number")
    .moreThan(0, "Sales Price must be greater than zero")
    .required("Sales Price is required"),
  purchase_price: yup
    .number()
    .typeError("Purchase Price must be a number")
    .moreThan(0, "Purchase Price must be greater than zero")
    .required("Purchase Price is required"),
});
