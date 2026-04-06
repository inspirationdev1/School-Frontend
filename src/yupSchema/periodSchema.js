import * as yup from 'yup';

export const periodSchema = yup.object({
    period_name:yup.string().required("Period  Name is required."),
    period_code:yup.string().required("Period Code is a required ."),
    class:yup.string().required("Class is a required ."),
    section:yup.string().required("Section is a required ."),
    teacher:yup.string().required("Teacher is a required ."),
    subject:yup.string().required("Teacher is a required ."),
    starttime:yup.string().required("Start Time is a required ."),
    endtime:yup.string().required("End Time is a required ."),
    
})