import * as yup from "yup";

export const classsubjectSchema = yup.object({
  classsubject_name: yup.string().required("Name is  required."),
  classsubject_code: yup.string().required("Code is required"),
  // seq: yup
  //     .number()
  //     .typeError("Seq be a number")
  //     .moreThan(0, "Seq must be greater than zero")
  //     .required("Seq is required"),
});
