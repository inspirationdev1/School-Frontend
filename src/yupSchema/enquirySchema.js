import * as yup from 'yup';

export const enquirySchema = yup.object({
    enquiry_code: yup.string().required("Enquiry Code is  required."),
    enquiry_name: yup.string().required("Enquiry Name is  required."),
    enquiry_date: yup.string().required("Enquiry Date is  required."),
    class: yup.string().required("Class is  required."),
    year: yup.string().required("Year is required"),
})