import * as yup from 'yup';

export const schoolreportsSchema = yup.object({
    reportId: yup.string().min(3, "Must contain 3 character.").required("Report Name is  required."),
    // class: yup.string().min(3, "Must contain 3 character.").required("Section Name is  required."),
    // section: yup.string().min(3, "Must contain 3 character.").required("Class Name is  required."),
    // teacher: yup.string().required("Teacher is  required."),
    // subject: yup.string().required("Subject is  required."),
    // examination: yup.string().required("Examination is  required."),
    // questionpaper: yup.string().required("Questionpaper is  required."),
    student: yup.string().required("Student is  required."),
    
    
})

