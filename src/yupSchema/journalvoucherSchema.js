import * as yup from 'yup';

export const journalvoucherSchema = yup.object({
    // journalvoucherCode: yup.string().min(3, "Must contain 3 character.").required("Exp Code is  required."),
    jv_date: yup.string().min(3, "Must Contain 3 Character.").required("Journalvoucher Date is  required."),
    // employee: yup.string().min(3, "Must Contain 3 Character.").required("Employee is  required."),
    status: yup.string().min(1, "Must Contain 3 Character.").required("status is  required."),
    // remarks: yup.string().min(3, "Must Contain 3 Character."),
    year: yup.string().required("Year is required"),
})