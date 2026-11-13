import * as yup from "yup";

export const warehouseSchema = yup.object({
  warehouse_code: yup.string().required("Warehouse Code is  required."),
  warehouse_name: yup.string().required("Warehouse Name is  required."),
});
