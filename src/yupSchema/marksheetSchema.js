import * as yup from 'yup';

export const marksheetSchema = yup.object({
    msCode: yup.string().min(3, "Must contain 3 character.").required("MS Code is  required."),
    name: yup.string().min(3, "Must contain 3 character.").required("MS Name is  required."),
    msDate: yup.string().min(3, "Must Contain 3 Character.").required("MS Date is  required."),
    class: yup.string().min(3, "Must Contain 3 Character.").required("Class is  required."),
    section: yup.string().min(3, "Must Contain 3 Character.").required("Section is  required."),
    teacher: yup.string().min(3, "Must Contain 3 Character.").required("Teacher is  required."),
    subject: yup.string().min(3, "Must Contain 3 Character.").required("Subject is  required."),
    examination: yup.string().min(3, "Must Contain 3 Character.").required("Examination is  required."),
    questionpaper: yup.string().min(3, "Must Contain 3 Character.").required("Questionpaper is  required."),
    marksLimit: yup
                .number()
                .typeError("Marks Limit must be a number")
                .moreThan(0, "Marks Limit must be greater than zero")
                .required("Marks Limit is required"),
    status: yup.string().min(1, "Must Contain 3 Character.").required("status is  required."),
    remarks: yup.string().min(3, "Must Contain 3 Character."),
    year: yup.string().required("Year is required"),
})