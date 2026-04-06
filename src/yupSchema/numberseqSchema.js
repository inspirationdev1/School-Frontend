import * as yup from 'yup';

export const numberseqSchema = yup.object({
    numberseq_name: yup.string().min(3, "Must contain 3 character.").required("Number Seq Name is  required."),
    numberseq_name: yup.string().required("Name  required."),
    seq: yup
                    .number()
                    .typeError("Seq must be a number")
                    .moreThan(0, "Seq must be greater than zero")
                    .required("Seq is required"),
})