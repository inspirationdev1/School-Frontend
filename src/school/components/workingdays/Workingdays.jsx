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
import { workingdaysSchema } from "../../../yupSchema/workingdaysSchema";

export default function Workingdays() {
    const [params, setParams] = useState({});
    const [workingdays, setWorkingdays] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [tab, setTab] = useState(0);

    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);

    const years = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { label: `${year}-${year + 1}`, value: year };
    });

    const months = Array.from({ length: 12 }, (_, i) => {
        const monthName = new Date(2025, i).toLocaleString('default', {
            month: 'long'
        });

        return {
            label: monthName,
            value: i + 1
        };
    });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/workingdays/delete/${id}`)
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
        axios.get(`${baseUrl}/workingdays/fetch-single/${id}`)
            .then((resp) => {

                Formik.setFieldValue("month", resp.data.data?.month);
                Formik.setFieldValue("year", resp.data.data?.year);
                Formik.setFieldValue("work_days", resp.data.data?.work_days);
                Formik.setFieldValue("seq", resp.data.data?.seq);

                const matchedYear = years.find(s => s.value === resp.data.data.year);
                setSelectedYear(matchedYear || null);

                Formik.setFieldValue("month", resp.data.data.month);
                Formik.setFieldValue("month_name", resp.data.data?.month_name);
                const matchedMonth = months.find(s => s.value === resp.data.data.month);
                setSelectedMonth(matchedMonth || null);

                setEditId(resp.data.data._id);
                setTab(0); // open Create Workingdays tab
            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const cancelEdit = () => {
        setEdit(false);
        setSelectedYear(null);
        setSelectedMonth(null);
        Formik.resetForm()
    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {

        year: "",
        month: "",
        month_name: "",
        work_days: 0,
        seq:0,
        
    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: workingdaysSchema,
        onSubmit: (values) => {
            if (isEdit) {
                console.log("edit id", editId);
                axios
                    .patch(`${baseUrl}/workingdays/update/${editId}`, {
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
                    .post(`${baseUrl}/workingdays/create`, { ...values })
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

    const [month, setMonth] = useState([]);
    const [year, setYear] = useState([]);

    const [noofworkingdays, setNoofworkingdays] = useState(0);
    const fetchWorkingdays = () => {
        axios
            .get(`${baseUrl}/workingdays/fetch-with-query`, { params })
            .then((resp) => {
                setWorkingdays(resp.data.data);
                setNoofworkingdays(resp.data.data.length);
            })
            .catch(() => console.log("Error in fetching workingdays data"));
        // axios
        //     .get(`${baseUrl}/workingdays/fetch-all`)
        //     .then((resp) => {
        //         console.log("Fetching data in  Casting Calls  admin.", resp);
        //         setWorkingdays(resp.data.data);
        //     })
        //     .catch((e) => {
        //         console.log("Error in fetching casting calls admin data", e);
        //     });

    };
    useEffect(() => {
        fetchWorkingdays();

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
                        <Tab label={isEdit ? "Edit Workingdays" : "Add New Workingdays"} />
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



                                {/* Academic Year */}
                                <Box>
                                    <Autocomplete
                                        disabled={isEdit}
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

                                {/* For Month Of */}
                                <Box>
                                    <Autocomplete
                                        disabled={isEdit}
                                        options={months}
                                        getOptionLabel={(option) => option.label}
                                        value={selectedMonth}
                                        onChange={(event, newValue) => {
                                            setSelectedMonth(newValue);

                                            Formik.setFieldValue(
                                                "month",
                                                newValue ? newValue.value : ""
                                            );
                                            Formik.setFieldValue(
                                                "month_name",
                                                newValue ? newValue.label : ""
                                            );
                                        }}
                                        onBlur={() => Formik.setFieldTouched("month", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select For Month Of"
                                                placeholder="Search For Month Of..."
                                                fullWidth
                                                error={Formik.touched.month && Boolean(Formik.errors.month)}
                                                helperText={Formik.touched.month && Formik.errors.month}
                                            />
                                        )}
                                    />
                                </Box>


                                <Box>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        label="Work Days"
                                        name="work_days"
                                        value={Formik.values.work_days}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />

                                    {Formik.touched.work_days &&
                                        Formik.errors.work_days && (
                                            <p style={{ color: "red" }}>
                                                {Formik.errors.work_days}
                                            </p>
                                        )}
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
                                        <TableCell align="right">Year</TableCell>
                                        <TableCell align="right">Month</TableCell>
                                        <TableCell align="right">Month Name</TableCell>
                                        <TableCell align="right">Work Days</TableCell>
                                        <TableCell align="right">Seq</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {workingdays.map((value, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >


                                            <TableCell align="right">{value?.year}</TableCell>
                                            <TableCell align="right">{value?.month}</TableCell>
                                            <TableCell align="right">{value?.month_name}</TableCell>
                                            <TableCell align="right">{value?.work_days}</TableCell>
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
