import * as yup from 'yup';

export const schoolreportsSchema = yup.object({
    reportId: yup.string().min(3, "Must contain 3 character.").required("Report Name is  required."),
    // class: yup.string().min(3, "Must contain 3 character.").required("Section Name is  required."),
    // section: yup.string().min(3, "Must contain 3 character.").required("Class Name is  required."),
    // teacher: yup.string().min(3,"Must Contain 3 Character.").required("Teacher is  required."),
    // subject: yup.string().min(3,"Must Contain 3 Character.").required("Subject is  required."),
    // examination: yup.string().min(3,"Must Contain 3 Character.").required("Examination is  required."),
    // questionpaper: yup.string().min(3,"Must Contain 3 Character.").required("Questionpaper is  required."),
    student: yup.string().min(3,"Must Contain 3 Character.").required("Student is  required."),
    
    
})

