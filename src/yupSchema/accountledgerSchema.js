import * as yup from 'yup';

export const accountledgerSchema = yup.object({
    accountledger_name: yup.string().min(3, "Must contain 3 character.").required("Accountledger Name is  required."),
    accountledger_code: yup.string().required("Accountledger Code is  required."),
    groupId: yup.string().required("Account Level  is  required."),
})