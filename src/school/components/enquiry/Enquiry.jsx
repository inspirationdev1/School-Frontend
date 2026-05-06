/* eslint-disable react-hooks/exhaustive-deps */
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    TableBody,
    TableCell,
    TableRow,
    TableHead,
    Table,
    TableContainer,
    Select, MenuItem, Alert, FormControl, InputLabel, Autocomplete,
    Tabs, Tab,
} from "@mui/material";
// import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem, Alert, FormControl, InputLabel, Autocomplete, TextField, Box } from '@mui/material';
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { enquirySchema } from "../../../yupSchema/enquirySchema";
import EnquiryPrint from "./EnquiryPrint";
import { AuthContext } from '../../../context/AuthContext';
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function Enquiry() {
    const { authenticated, user } = useContext(AuthContext);
    const [isDataValid, setIsDataValid] = useState(true);
    const [dataError, setDataError] = useState('');
    const [studentEnquiry, setStudentEnquiry] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [date, setDate] = useState(new Date());

    const [isPrint, setPrint] = useState(false);
    const [printId, setPrintId] = useState(null);

    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [allStudents, setAllStudents] = useState([]);

    const [periods, setPeriods] = useState([])


    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);

    const [boards, setBoards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState(null);

    const [previousschools, setPreviousschools] = useState([]);
    const [selectedPreviousschool, setSelectedPreviousschool] = useState(null);

    const [tab, setTab] = useState(0);
    const [selectedYear, setSelectedYear] = useState(null);


    const years = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { label: `${year}-${year + 1}`, value: year };
    });

    const [enquiryDetails, setEnquiryDetails] = useState([
        {
            class: null,
            child_name: "",
            child_dob: dayjs(), // ✅ instead of new Date()
            previousschool: "",
            previousschool_name: "",
            board: null,
            remarks: "",
            isEdit: false
        },
    ]);


    const clearEnquiryDetails = () => {
        setEnquiryDetails([
            {
                class: null,
                child_name: "",
                child_dob: dayjs(), // ✅ instead of new Date()
                previousschool: "",
                previousschool_name: "",
                board: null,
                remarks: "",
                isEdit: false
            },
        ])
        console.log("enquiryDetails", enquiryDetails);

    };



    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/enquiry/delete/${id}`)
                .then((resp) => {
                    setMessage(resp.data.message);
                    setType("success");
                })
                .catch((e) => {
                    setMessage(e.response.data.message);
                    setType("error");
                    console.log("Error, deleting", e);
                });
        }
    };
    const handleEdit = async (id) => {
        console.log("Handle  Edit is called", id);
        setEdit(true);
        axios.get(`${baseUrl}/enquiry/fetch-single/${id}`)
            .then((resp) => {
                Formik.setFieldValue("enquiry_code", resp.data.data.enquiry_code);
                Formik.setFieldValue("enquiry_name", resp.data.data.enquiry_name);
                Formik.setFieldValue(
                    "enquiry_date",
                    resp.data.data.enquiry_date ? dayjs(resp.data.data.enquiry_date).format("YYYY-MM-DD") : ""
                );
                Formik.setFieldValue("enquiry_time", dayjs().format("YYYY-MM-DD HH:mm:ss"));

                Formik.setFieldValue("father_name", resp.data.data.father_name);
                Formik.setFieldValue("father_occupation", resp.data.data.father_occupation);
                Formik.setFieldValue("father_phoneno", resp.data.data.father_phoneno);
                Formik.setFieldValue("father_email", resp.data.data.father_email);
                Formik.setFieldValue("mother_name", resp.data.data.mother_name);
                Formik.setFieldValue("mother_occupation", resp.data.data.mother_occupation);
                Formik.setFieldValue("mother_phoneno", resp.data.data.mother_phoneno);
                Formik.setFieldValue("mother_email", resp.data.data.mother_email);
                Formik.setFieldValue("address", resp.data.data.address);
                Formik.setFieldValue("status", resp.data.data.status);
                Formik.setFieldValue("remarks", resp.data.data.remarks);
                Formik.setFieldValue("year", resp.data.data.year);
                const matchedYear = years.find(s => s.value === resp.data.data.year);
                setSelectedYear(matchedYear || null);


                setEditId(resp.data.data._id);

                // const editEnquiryDetails = resp.data.data.enquiryDetails.map((row) => ({
                //     ...row,
                //     child_dob: dayjs(row.child_dob).format("DD/MM/YYYY"),
                //     isEdit: true
                // }));
                const editEnquiryDetails = resp.data.data.enquiryDetails.map((row) => ({
                    ...row,
                    child_dob: row.child_dob ? dayjs(row.child_dob) : null, // ✅ MUST be Dayjs
                    isEdit: true
                }));

                setEnquiryDetails(editEnquiryDetails);
                setTab(0); // open Create Receipt tab

            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const handlePrint = async (id) => {
        console.log("Handle  Print is called", id);
        setPrint(true);

        if (user?.role === 'TEACHER') {
            window.open(`/teacher/EnquiryPrint?id=${id}`,
                '_blank');
        } else {
            window.open(`/school/EnquiryPrint?id=${id}`,
                '_blank');
        }



        setPrint(false);


    };


    const cancelEdit = () => {
        setEdit(false);
        setEditId(null);
        Formik.resetForm()
        // 🔥 reset Autocomplete values
        setSelectedClass(null);
        setSelectedYear(null);
        setIsDataValid(true);
        // 🔥 reset Autocomplete values
        clearEnquiryDetails();
    };

    const clearForm = () => {
        setEdit(false);
        setEditId(null);
        Formik.resetForm()
        // 🔥 reset Autocomplete values
        setSelectedClass(null);
        clearEnquiryDetails();

    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("success");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {

        enquiry_code: "",
        enquiry_name: "",
        enquiry_date: "",
        enquiry_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        father_name: "",
        father_occupation: "",
        father_phoneno: "",
        father_email: "",
        mother_name: "",
        mother_occupation: "",
        mother_phoneno: "",
        mother_email: "",
        address: "",
        status: "valid",
        remarks: "",
        year: "",
    };
    const Formik = useFormik({
        initialValues: initialValues,
        // validationSchema: enquirySchema,
        onSubmit: (values) => {

            if (enquiryDetails.length == 0) {
                setDataError('Enquiry Details is missing');
                setIsDataValid(false);
                return;
            }

            let hasInvalidRow = false;

            for (const item of enquiryDetails) {
                if (item.class === undefined || item.class === '' || item.class === null) {
                    setDataError('Select class');
                    hasInvalidRow = true;
                    break; // exit loop when condition met
                }

                if (item.child_name === undefined || item.child_name === '' || item.child_name === null) {
                    setDataError('Select child_name');
                    hasInvalidRow = true;
                    break; // exit loop when condition met
                }

                if (item.child_dob === undefined || item.child_dob === '' || item.child_dob === null) {
                    setDataError('Select child_dob');
                    hasInvalidRow = true;
                    break; // exit loop when condition met
                }

                if (item.board === undefined || item.board === '' || item.board === null) {
                    setDataError('Select Board');
                    hasInvalidRow = true;
                    break; // exit loop when condition met
                }

                if (item.previousschool === undefined || item.previousschool === '' || item.previousschool === null) {
                    setDataError('Select previousschool');
                    hasInvalidRow = true;
                    break; // exit loop when condition met
                }

                console.log(item);

            }
            if (hasInvalidRow) {
                setIsDataValid(false);
                return;
            }

            const hasDuplicate = new Set(enquiryDetails.map(d => d.class?._id.toString())).size !== enquiryDetails.length;
            console.log(hasDuplicate); // true
            if (hasDuplicate) {
                setIsDataValid(false);
                setDataError('Class selection is duplicated');
                return;
            }



            setIsDataValid(true);



            const payload = {
                ...values,
                enquiryDetails: enquiryDetails.map((row) => ({
                    enquiry_date: values?.enquiry_date,
                    enquiry_time: values?.enquiry_time,
                    class: row.class?._id, // 👈 convert here
                    child_name: row.child_name,
                    child_dob: row.child_dob
                        ? dayjs(row.child_dob).format("YYYY-MM-DD")
                        : null,
                    previousschool: row.previousschool?._id,
                    previousschool_name: row.previousschool_name,
                    board: row.board?._id,
                    remarks: '',
                    year: values.year,
                })),
            };
            if (isEdit) {
                console.log("edit id", editId);

                axios
                    .patch(`${baseUrl}/enquiry/update/${editId}`, payload)
                    .then((resp) => {
                        console.log("Edit submit", resp);
                        setMessage(resp.data.message);
                        setType("success");
                        // cancelEdit();
                        clearForm();
                        setTab(1); // go to View List
                    })
                    .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");
                        console.log("Error, edit casting submit", e);
                    });
            } else {

                axios
                    .post(`${baseUrl}/enquiry/create`, payload)
                    .then((resp) => {
                        console.log("Response after submitting admin casting", resp);
                        setMessage(resp.data.message);
                        setType("success");
                    })
                    .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");
                        console.log("Error, response admin casting calls", e);
                    });
                // Formik.resetForm();
                clearForm();
                setTab(1); // go to View List
            }
        },
    });

    const [month, setMonth] = useState([]);
    const [year, setYear] = useState([]);


    const fetchstudentsenquiry = () => {
        axios
            .get(`${baseUrl}/enquiry/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setStudentEnquiry(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };
    const fetchClass = async () => {
        try {
            const classData = await axios.get(`${baseUrl}/class/fetch-all`);
            console.log("class", classData)
            setClasses(classData.data.data);

        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };







    const fetchBoards = () => {
        const params = {
            generalmaster_type: "board",
        };
        axios
            .get(`${baseUrl}/generalmaster/fetch-with-query`, { params: params })
            .then((resp) => {
                console.log("Fetching data in  generalmaster Calls  admin.", resp);
                setBoards(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching generalmaster calls admin data", e);
            });
    };

    const fetchpreviousschool = () => {
        const params = {
            generalmaster_type: "previousschool",
        };
        axios
            .get(`${baseUrl}/generalmaster/fetch-with-query`, { params: params })
            .then((resp) => {
                console.log("Fetching data in  generalmaster Calls  admin.", resp);
                setPreviousschools(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching generalmaster calls admin data", e);
            });
    };

    useEffect(() => {
        fetchstudentsenquiry();

        fetchClass();
        fetchBoards();
        fetchpreviousschool();

    }, [message]);





    useEffect(() => {
        console.log("enquiryDetails:", enquiryDetails);
        for (const item of enquiryDetails) {
            console.log("item", item);
        }

    }, [enquiryDetails]);

    useEffect(() => {
        console.log("isDataValid:", isDataValid);
    }, [isDataValid]);

    const handleChange = (index, field, value) => {
        const updated = [...enquiryDetails];
        updated[index][field] = value;



        setEnquiryDetails(updated);
    };

    const addRow = () => {
        setEnquiryDetails([
            ...enquiryDetails,
            {
                class: null,
                child_name: "",
                child_dob: dayjs(), // ✅ NOT new Date()
                previousschool: "",
                previousschool_name: "",
                board: null,
                remarks: "",
                isEdit: false
            },
        ]);
    };

    const removeRow = (index) => {
        setEnquiryDetails(enquiryDetails.filter((_, i) => i !== index));
        console.log(enquiryDetails);
    };


    return (
        <>
            {message?.trim() && (
                <CustomizedSnackbars
                    reset={resetMessage}
                    type={type}
                    message={message}
                />
            )}
            <Box>
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                    <Tabs
                        value={tab}
                        onChange={(e, newValue) => setTab(newValue)}
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        {/* <Tab label="Create Receipt" /> */}
                        <Tab label={isEdit ? "Edit Enquiry" : "Create Enquiry"} />
                        <Tab label="View List" />
                    </Tabs>
                </Box>


                {tab === 0 && (
                    <Box>
                        <Box component={"div"} sx={{}}>
                            <Paper
                                sx={{ padding: '20px', margin: "10px" }}
                            >
                                {isEdit ? (
                                    <Typography
                                        variant="h4"
                                        sx={{ fontWeight: "800", textAlign: "center" }}
                                    >
                                        Edit enquiry
                                    </Typography>
                                ) : (
                                    <Typography
                                        variant="h4"
                                        sx={{ fontWeight: "800", textAlign: "center" }}
                                    >
                                        Add New  enquiry
                                    </Typography>
                                )}{" "}
                                <Box
                                    component="form"
                                    noValidate
                                    autoComplete="off"
                                    onSubmit={Formik.handleSubmit}
                                >



                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: {
                                                xs: "1fr",      // mobile
                                                md: "1fr 1fr",  // desktop → 2 columns
                                            },
                                            gap: 2,
                                            mt: 2,
                                        }}
                                    >
                                        {/* Enquiry Code */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="Enquiry Code"
                                                variant="outlined"
                                                name="enquiry_code"
                                                value={Formik.values.enquiry_code}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled={isEdit}
                                            />
                                            {Formik.touched.enquiry_code && Formik.errors.enquiry_code && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.enquiry_code}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Enquiry Name */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="enquiry_name"
                                                variant="outlined"
                                                name="enquiry_name"
                                                value={Formik.values.enquiry_name}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}

                                            />
                                            {Formik.touched.enquiry_name && Formik.errors.enquiry_name && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.enquiry_name}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* enquiry_date */}
                                        <Box>
                                            <TextField
                                                name="enquiry_date"
                                                label="Date"
                                                type="date"
                                                variant="outlined"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={Formik.values.enquiry_date}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled={isEdit}

                                            />
                                            {Formik.touched.enquiry_date && Formik.errors.enquiry_date && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.enquiry_date}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Academic Year */}
                                        <Box>
                                            <Autocomplete
                                                // disabled={isEdit}
                                                options={years}
                                                getOptionLabel={(option) => option.label}
                                                value={selectedYear}
                                                onChange={(event, newValue) => {
                                                    setSelectedYear(newValue);

                                                    Formik.setFieldValue(
                                                        "year",
                                                        newValue ? newValue.value : ""
                                                    );
                                                }}
                                                onBlur={() => Formik.setFieldTouched("year", true)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Academic Year"
                                                        placeholder="Search year..."
                                                        fullWidth
                                                        error={Formik.touched.year && Boolean(Formik.errors.year)}
                                                        helperText={Formik.touched.year && Formik.errors.year}
                                                    />
                                                )}
                                            />
                                        </Box>


                                        {/* Class */}

                                        {/* <Box>

                                            <Autocomplete
                                                disabled={isEdit}
                                                options={classes}
                                                getOptionLabel={(option) => option.class_name}
                                                value={selectedClass}
                                                onChange={(event, newValue) => {

                                                    
                                                    setSelectedClass(newValue);

                                                    Formik.setFieldValue(
                                                        "class",
                                                        newValue ? newValue._id : ""
                                                    );

                                                    setSelectedExamination(null);
                                                    setSelectedQuestionpaper(null);

                                                    Formik.setFieldValue(
                                                        "examination",
                                                        ""
                                                    );
                                                    Formik.setFieldValue(
                                                        "questionpaper",
                                                        ""
                                                    );
                                                    Formik.setFieldValue(
                                                        "marksLimit",
                                                        0
                                                    );

                                                    

                                                }}
                                                onBlur={() => Formik.setFieldTouched("class", true)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Select Class"
                                                        placeholder="Search class..."
                                                        fullWidth
                                                        error={Formik.touched.class && Boolean(Formik.errors.class)}
                                                        helperText={Formik.touched.class && Formik.errors.class}
                                                    />
                                                )}
                                            />


                                        </Box> */}

                                        {/* father_name */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="father_name"
                                                variant="outlined"
                                                name="father_name"
                                                value={Formik.values.father_name}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}

                                            />
                                            {Formik.touched.father_name && Formik.errors.father_name && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.father_name}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* father_occupation */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="father_occupation"
                                                variant="outlined"
                                                name="father_occupation"
                                                value={Formik.values.father_occupation}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}

                                            />
                                            {Formik.touched.father_occupation && Formik.errors.father_occupation && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.father_occupation}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* father_phoneno */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="father_phoneno"
                                                variant="outlined"
                                                name="father_phoneno"
                                                value={Formik.values.father_phoneno}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}

                                            />
                                            {Formik.touched.father_phoneno && Formik.errors.father_phoneno && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.father_phoneno}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* father_email */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="father_email"
                                                variant="outlined"
                                                name="father_email"
                                                value={Formik.values.father_email}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}

                                            />
                                            {Formik.touched.father_email && Formik.errors.father_email && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.father_email}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* mother_name */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="mother_name"
                                                variant="outlined"
                                                name="mother_name"
                                                value={Formik.values.mother_name}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}

                                            />
                                            {Formik.touched.mother_name && Formik.errors.mother_name && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.mother_name}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* mother_occupation */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="mother_occupation"
                                                variant="outlined"
                                                name="mother_occupation"
                                                value={Formik.values.mother_occupation}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}

                                            />
                                            {Formik.touched.mother_occupation && Formik.errors.mother_occupation && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.mother_occupation}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* mother_phoneno */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="mother_phoneno"
                                                variant="outlined"
                                                name="mother_phoneno"
                                                value={Formik.values.mother_phoneno}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}

                                            />
                                            {Formik.touched.mother_phoneno && Formik.errors.mother_phoneno && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.mother_phoneno}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* mother_email */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="mother_email"
                                                variant="outlined"
                                                name="mother_email"
                                                value={Formik.values.mother_email}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}

                                            />
                                            {Formik.touched.mother_email && Formik.errors.mother_email && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.mother_email}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* address */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="address"
                                                variant="outlined"
                                                name="address"
                                                value={Formik.values.address}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}

                                            />
                                            {Formik.touched.address && Formik.errors.address && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.address}
                                                </Typography>
                                            )}
                                        </Box>






                                        {/* Status */}

                                        <Box>

                                            <TextField
                                                select
                                                fullWidth
                                                required
                                                label="Status"
                                                name="status"
                                                value={Formik.values.status}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled
                                            >
                                                <MenuItem value="">Select Status</MenuItem>
                                                <MenuItem value="valid">Valid</MenuItem>
                                                <MenuItem value="cancel">Cancel</MenuItem>
                                            </TextField>
                                            {Formik.touched.status && Formik.errors.status && (
                                                <p style={{ color: "red", textTransform: "capitalize" }}>
                                                    {Formik.errors.status}
                                                </p>
                                            )}
                                        </Box>



                                        {/* Remarks → full width */}
                                        <Box sx={{ gridColumn: "1 / -1" }}>
                                            <TextField
                                                fullWidth
                                                label="Remarks"
                                                variant="outlined"
                                                name="remarks"
                                                value={Formik.values.remarks}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                multiline
                                                rows={3}
                                            />
                                            {Formik.touched.remarks && Formik.errors.remarks && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.remarks}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* EnquiryDetail */}
                                    <Box sx={{ mt: 3 }}>

                                        {!isDataValid && (
                                            <Alert severity="error" sx={{ mt: 2 }}>
                                                {dataError}
                                            </Alert>
                                        )}

                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: "3fr 1fr 1fr 1fr 0.5fr",
                                                gap: 1,
                                                fontWeight: "bold",
                                                mb: 1,
                                            }}
                                        >


                                        </Box>

                                        {/* Rows */}
                                        <Box >
                                            {enquiryDetails.map((row, index) => (

                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: "flex",
                                                        gap: 1,
                                                        mb: 2, // ✅ more space between rows
                                                        minWidth: "900px",
                                                        alignItems: "flex-end", // ✅ aligns all inputs properly
                                                    }}
                                                >

                                                    {/* Class */}
                                                    <Box sx={{ minWidth: 150 }}>
                                                        <Autocomplete
                                                            disabled={row.isEdit}
                                                            options={classes}
                                                            getOptionLabel={(option) => option?.class_name || ""}
                                                            isOptionEqualToValue={(option, value) =>
                                                                option._id === value?._id
                                                            }
                                                            value={row.class || null}
                                                            onChange={(event, newValue) => {
                                                                handleChange(index, "class", newValue);
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Class"
                                                                    size="small"
                                                                    sx={{
                                                                        "& .MuiInputBase-root": {
                                                                            height: 40,
                                                                        },
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </Box>

                                                    {/* Child Name */}
                                                    <Box sx={{ minWidth: 250 }}>
                                                        <TextField
                                                            fullWidth
                                                            label="Child Name"
                                                            size="small"
                                                            value={row.child_name || ""}
                                                            onChange={(e) =>
                                                                handleChange(index, "child_name", e.target.value)
                                                            }
                                                        />


                                                    </Box>

                                                    {/* child_dob */}
                                                    {/* DatePicker */}
                                                    <Box sx={{ minWidth: 150 }}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker
                                                                format="DD/MM/YYYY"
                                                                value={dayjs.isDayjs(row.child_dob) ? row.child_dob : null}
                                                                onChange={(newValue) => {
                                                                    handleChange(index, "child_dob", newValue || null);
                                                                }}
                                                                slotProps={{
                                                                    textField: {
                                                                        size: "small",
                                                                        fullWidth: true,
                                                                        label: "Date of Birth"
                                                                    }
                                                                }}
                                                            />
                                                        </LocalizationProvider>
                                                    </Box>

                                                    {/* Board */}
                                                    <Box sx={{ minWidth: 120 }}>
                                                        <Autocomplete
                                                            disabled={row.isEdit}
                                                            options={boards}
                                                            getOptionLabel={(option) => option?.generalmaster_name || ""}
                                                            isOptionEqualToValue={(option, value) =>
                                                                option._id === value?._id
                                                            }
                                                            value={row.board || null}
                                                            onChange={(event, newValue) => {
                                                                handleChange(index, "board", newValue);
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Board"
                                                                    size="small"
                                                                    sx={{
                                                                        "& .MuiInputBase-root": {
                                                                            height: 40,
                                                                        },
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </Box>

                                                    {/* previousschool */}
                                                    <Box sx={{ minWidth: 120 }}>
                                                        <Autocomplete
                                                            disabled={row.isEdit}
                                                            options={previousschools}
                                                            getOptionLabel={(option) => option?.generalmaster_name || ""}
                                                            isOptionEqualToValue={(option, value) =>
                                                                option._id === value?._id
                                                            }
                                                            value={row.previousschool || null}
                                                            onChange={(event, newValue) => {
                                                                handleChange(index, "previousschool", newValue);
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Previousschool"
                                                                    size="small"
                                                                    sx={{
                                                                        "& .MuiInputBase-root": {
                                                                            height: 40,
                                                                        },
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                    </Box>

                                                    {/* Previous School Name */}
                                                    <Box sx={{ minWidth: 200 }}>
                                                        <TextField
                                                            fullWidth
                                                            label="School Name"
                                                            size="small"
                                                            value={row.previousschool_name || ""}
                                                            onChange={(e) =>
                                                                handleChange(index, "previousschool_name", e.target.value)
                                                            }
                                                        />
                                                    </Box>

                                                    {/* Delete */}
                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                        <Button color="error" onClick={() => removeRow(index)}>
                                                            ✕
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>


                                        {/* Add Row */}
                                        <Button variant="outlined" onClick={addRow}>
                                            + Add Item
                                        </Button>
                                    </Box>





                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 2,
                                            mt: 4,
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <Button type="submit" variant="contained">
                                            {isEdit ? "Update" : "Submit"}
                                        </Button>

                                        {isEdit && (
                                            <Button variant="outlined" onClick={cancelEdit}>
                                                Cancel
                                            </Button>
                                        )}
                                    </Box>


                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                )}


                {tab === 1 && (
                    <Box>
                        <Box>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            {/* <TableCell component="th" scope="row"> enquiry</TableCell> */}
                                            <TableCell align="right">Enquiry Code</TableCell>
                                            <TableCell align="right">Enquiry Name</TableCell>
                                            <TableCell align="right">Date</TableCell>
                                            <TableCell align="right">Remarks</TableCell>
                                            <TableCell align="right">Status</TableCell>

                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {studentEnquiry.map((value, i) => (
                                            <TableRow
                                                key={i}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {value.enquiry_code}
                                                </TableCell>
                                                <TableCell component="th" scope="row">
                                                    {value.enquiry_name}
                                                </TableCell>
                                                <TableCell align="right">{dayjs(value.enquiry_date).format("DD-MM-YYYY")}</TableCell>
                                                <TableCell align="right">{value.remarks}</TableCell>
                                                <TableCell align="right">{value.status}</TableCell>
                                                <TableCell align="right">  <Box component={'div'} sx={{ bottom: 0, display: 'flex', justifyContent: "end" }} >


                                                    <Box
                                                        component="div"
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "end",
                                                            gap: 1.5, // 👈 adds space between buttons
                                                        }}
                                                    >
                                                        {(value.status === "valid") && (
                                                            <>
                                                                <Button
                                                                    variant="contained"
                                                                    sx={{ background: "red", color: "#fff" }}
                                                                    onClick={() => handleDelete(value._id)}
                                                                >
                                                                    Delete
                                                                </Button>

                                                                <Button
                                                                    variant="contained"
                                                                    sx={{ background: "gold", color: "#222222" }}
                                                                    onClick={() => handleEdit(value._id)}
                                                                >
                                                                    Edit
                                                                </Button>


                                                            </>
                                                        )}
                                                        <Button
                                                            variant="contained"
                                                            sx={{ background: "green", color: "#fff" }}
                                                            onClick={() => handlePrint(value._id)}
                                                        >
                                                            Print
                                                        </Button>
                                                    </Box>



                                                </Box>
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Box>
                    </Box>
                )}



            </Box>
        </>
    );
}
