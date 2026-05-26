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
    Tabs,
    Tab,
    Autocomplete
} from "@mui/material";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { classsubjectSchema } from "../../../yupSchema/classsubjectSchema";

export default function Classsubject() {
    const [params, setParams] = useState({});
    const [classsubject, setClasssubject] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [tab, setTab] = useState(0);

    const [classes, setClasses] = useState([])
    const [selectedClass, setSelectedClass] = useState(null);

    const [subjects, setSubjects] = useState([])
    const [selectedSubject, setSelectedSubject] = useState(null);

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/classsubject/delete/${id}`)
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
    const handleEdit = (id) => {
        console.log("Handle  Edit is called", id);
        setEdit(true);
        axios.get(`${baseUrl}/classsubject/fetch-single/${id}`)
            .then((resp) => {

                Formik.setFieldValue("class", resp.data.data?.class?._id);
                Formik.setFieldValue("subject", resp.data.data?.subject?._id);
                Formik.setFieldValue("seq", resp.data.data?.seq);

                setSelectedClass(resp.data.data?.class);
                setSelectedSubject(resp.data.data?.subject);

                setEditId(resp.data.data._id);
                setTab(0); // open Create Classsubject tab
            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const cancelEdit = () => {
        setEdit(false);
        setSelectedClass(null);
        setSelectedSubject(null);
        Formik.resetForm()
    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {

        class: "",
        class_name:"",
        subject: "",
        subject_name:"",
        seq: 0,

    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: classsubjectSchema,
        onSubmit: (values) => {

            values.class=selectedClass?._id;
            values.subject=selectedSubject?._id;
            values.class_name=selectedClass?.class_name;
            values.subject_name=selectedSubject?.subject_name;

            if (isEdit) {
                console.log("edit id", editId);
                axios
                    .patch(`${baseUrl}/classsubject/update/${editId}`, {
                        ...values,
                    })
                    .then((resp) => {
                        console.log("Edit submit", resp);
                        setMessage(resp.data.message);
                        setType("success");
                        cancelEdit();
                        setParams({});
                        setTab(1); // go to View List
                    })
                    .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");
                        console.log("Error, edit casting submit", e);
                    });
            } else {

                axios
                    .post(`${baseUrl}/classsubject/create`, { ...values })
                    .then((resp) => {
                        console.log("Response after submitting admin casting", resp);
                        setMessage(resp.data.message);
                        setType("success");
                        cancelEdit();
                        setParams({});
                        setTab(1); // go to View List
                    })
                    .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");
                        console.log("Error, response admin casting calls", e);
                    });
                Formik.resetForm();

            }
        },
    });


    const [noofclasssubject, setNoofclasssubject] = useState(0);
    const fetchClasssubject = () => {
        axios
            .get(`${baseUrl}/classsubject/fetch-with-query`, { params })
            .then((resp) => {
                setClasssubject(resp.data.data);
                setNoofclasssubject(resp.data.data.length);
            })
            .catch(() => console.log("Error in fetching classsubject data"));
       

    };

    const fetchClasses = async () => {
        try {
            const classes = await axios.get(`${baseUrl}/class/fetch-all`);
            console.log("classes", classes)
            setClasses(classes.data.data);

        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const subjects = await axios.get(`${baseUrl}/subject/fetch-all`);
            console.log("subjects", subjects)
            setSubjects(subjects.data.data);

        } catch (error) {
            console.error('Error fetching Subjects:', error);
        }
    };

    useEffect(() => {
        fetchClasses();
        fetchSubjects();
        fetchClasssubject();

    }, [message, params]);

    const handleSearch = (e) => {
        let newParam;
        if (e.target.value !== "") {
            newParam = { ...params, search: e.target.value };
        } else {
            newParam = { ...params };
            delete newParam["search"];
        }

        setParams(newParam);
    };
    return (
        <>
            {message && (
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
                        <Tab label={isEdit ? "Edit Classsubject" : "Add New Classsubject"} />
                        <Tab label="View List" />
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Box>
                        <Paper sx={{ p: 3, m: 1 }}>
                            <Box
                                component="form"
                                noValidate
                                autoComplete="off"
                                onSubmit={Formik.handleSubmit}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2, // ✅ equal spacing between all items
                                }}
                            >


                                {/* Class */}
                                <Box>
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


                                </Box>

                                {/* Subject */}
                                <Box>
                                    <Autocomplete
                                        disabled={isEdit}
                                        options={subjects}
                                        getOptionLabel={(option) => option.subject_name}
                                        value={selectedSubject}
                                        onChange={(event, newValue) => {
                                            setSelectedSubject(newValue);
                                            Formik.setFieldValue(
                                                "subject",
                                                newValue ? newValue._id : ""
                                            );
                                        }}
                                        onBlur={() => Formik.setFieldTouched("subject", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Subject"
                                                placeholder="Search subject..."
                                                fullWidth
                                                error={Formik.touched.subject && Boolean(Formik.errors.subject)}
                                                helperText={Formik.touched.subject && Formik.errors.subject}
                                            />
                                        )}
                                    />


                                </Box>


                                

                                <Box>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        label="Seq"
                                        name="seq"
                                        value={Formik.values.seq}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />

                                    {Formik.touched.seq &&
                                        Formik.errors.seq && (
                                            <p style={{ color: "red" }}>
                                                {Formik.errors.seq}
                                            </p>
                                        )}
                                </Box>






                                <Box>
                                    <Button
                                        type="submit"
                                        sx={{ mr: 1 }}
                                        variant="contained"
                                    >
                                        Submit
                                    </Button>

                                    {isEdit && (
                                        <Button
                                            variant="outlined"
                                            onClick={cancelEdit}
                                        >
                                            Cancel Edit
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                )}


                {tab === 1 && (
                    <Box>
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: "center",
                                mb: 2,
                            }}
                        >
                            {/* Search */}
                            <TextField
                                label="Search .."
                                size="small"
                                onChange={handleSearch}
                                fullWidth
                                sx={{
                                    flex: 2,
                                    "& .MuiInputBase-root": {
                                        height: 42,
                                        fontSize: "14px",
                                    },
                                }}
                            />


                        </Box>

                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="right">Class</TableCell>
                                        <TableCell align="right">Subject</TableCell>
                                        <TableCell align="right">Seq</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {classsubject.map((value, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >


                                            <TableCell align="right">{value?.class?.class_name}</TableCell>
                                            <TableCell align="right">{value?.subject?.subject_name}</TableCell>
                                            <TableCell align="right">{value?.seq}</TableCell>
                                            <TableCell align="right">

                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "flex-end",
                                                        gap: 1.5, // 👈 space between buttons
                                                    }}
                                                >
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
                                                </Box>
                                            </TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                    </Box>
                )}
            </Box>
        </>
    );
}
