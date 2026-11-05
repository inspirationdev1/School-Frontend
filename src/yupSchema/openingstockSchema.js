import * as yup from "yup";

export const openingstockSchema = yup.object({
  openingStockDate: yup.string().required("Opening Stock date is required."),
  status: yup
    .string()
    .oneOf(["valid", "cancel"])
    .required("Status is required."),
  remarks: yup.string().max(500, "Remarks cannot exceed 500 characters."),
});
