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
    Tabs, Tab
} from "@mui/material";
// import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem, Alert, FormControl, InputLabel, Autocomplete, TextField, Box } from '@mui/material';
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { receiptSchema } from "../../../yupSchema/receiptSchema";
import ReceiptPrint from "./ReceiptPrint";

export default function Receipts() {
    const [isDataValid, setIsDataValid] = useState(true);
    const [dataError, setDataError] = useState('');
    const [studentReceipt, setStudentReceipt] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [date, setDate] = useState(new Date());

    const [isPrint, setPrint] = useState(false);
    const [printId, setPrintId] = useState(null);

    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [loading, setLoading] = useState(true);
    const [attendeeClass, setAttendeeClass] = useState([])
    const [selectedClass, setSelectedClass] = useState(null);
    const [section, setSection] = useState([])
    const [selectedSection, setSelectedSection] = useState(null);


    const [salesinvoices, setSalesinvoices] = useState([]);
    const [selectedSalesinvoice, setSelectedSalesinvoice] = useState(null);
    const [tab, setTab] = useState(0);

    const [receiptDetails, setReceiptDetails] = useState([
        {
            class: null,
            section: null,
            student: null,
            siId: null,
            invAmount: 0,
            paidAmount: 0,
            remarks: "",
            isEdit: false
        },
    ]);


    const clearReceiptDetails = () => {
        setReceiptDetails([
            {
                class: null,
                section: null,
                student: null,
                siId: null,
                invAmount: 0,
                paidAmount: 0,
                remarks: "",
            },
        ])
        console.log("receiptDetails", receiptDetails);

    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/receipt/delete/${id}`)
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
        axios.get(`${baseUrl}/receipt/fetch-single/${id}`)
            .then((resp) => {
                Formik.setFieldValue("receiptCode", resp.data.data.receiptCode);
                Formik.setFieldValue(
                    "receiptDate",
                    resp.data.data.receiptDate ? dayjs(resp.data.data.receiptDate).format("YYYY-MM-DD") : ""
                );
                Formik.setFieldValue("receiptTime", dayjs().format("YYYY-MM-DD HH:mm:ss"));
                Formik.setFieldValue("receiptCode", resp.data.data.receiptCode);
                Formik.setFieldValue("paymentMethod", resp.data.data.paymentMethod);
                Formik.setFieldValue("status", resp.data.data.status);


                Formik.setFieldValue("remarks", resp.data.data.remarks);
                
                setEditId(resp.data.data._id);



                const editReceiptDetails = resp.data.data.receiptDetails.map((row) => ({
                    ...row,
                    isEdit: true
                }));

                setReceiptDetails(editReceiptDetails);
                setTab(0); // open Create Receipt tab


            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const handlePrint = async (id) => {
        console.log("Handle  Print is called", id);
        setPrint(true);


        window.open(`/school/ReceiptPrint?id=${id}`,
            '_blank');
        setPrint(false);


    };

    const handleReceipt = async (id) => {
        console.log("Handle  Print is called", id);
        setPrint(true);


        window.open(`/school/ReceiptPrint?id=${id}`,
            '_blank');
        setPrint(false);


    };
    const cancelEdit = () => {
        setEdit(false);
        setEditId(null);
        Formik.resetForm()
        // 🔥 reset Autocomplete values
        setSelectedClass(null);
        setSelectedSection(null);
        setSelectedStudent(null);
        setSelectedSalesinvoice(null);
        setIsDataValid(true);
        // 🔥 reset Autocomplete values
        clearReceiptDetails();

    };

    const clearForm = () => {
        setEdit(false);
        setEditId(null);
        Formik.resetForm()
        // 🔥 reset Autocomplete values
        clearReceiptDetails();

    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {

        receiptCode: "",
        receiptDate: "",
        receiptTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        paymentMethod: "",
        status: "valid",
        remarks: ""
    };

    const hasDuplicateInvoice = (receiptDetails) => {
        const seen = new Set();

        for (const row of receiptDetails) {
            if (!row.siId?._id) continue; // skip empty rows

            if (seen.has(row.siId._id)) {
                return true; // duplicate found
            }

            seen.add(row.siId._id);
        }

        return false;
    };

    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: receiptSchema,
        onSubmit: (values) => {

            if (receiptDetails.length == 0) {
                setDataError('Receipt Details is missing');
                setIsDataValid(false);
                return;
            }

            if (hasDuplicateInvoice(receiptDetails)) {
                setDataError("Duplicate invoice selected. Please remove duplicates.");
                setIsDataValid(false);
                return;
            }


            let hasInvalidRow = false;

            for (const item of receiptDetails) {

                if (item.invAmount === 0) {
                    setDataError('invAmount must be greater than 0');
                    hasInvalidRow = true;
                    break; // exit loop when condition met
                }

                console.log(item);

            }
            if (hasInvalidRow) {
                setIsDataValid(false);
                return;
            }

            setIsDataValid(true);

            const payload = {
                ...values,
                receiptDetails: receiptDetails.map((row) => ({
                    class: row.class,
                    section: row.section,
                    student: row.student._id,
                    siId: row.siId._id,
                    siCode: row.siId.siCode,
                    invAmount: row.invAmount,
                    paidAmount: row.paidAmount,
                    remarks: "",
                })),
            };
            if (isEdit) {
                console.log("edit id", editId);

                axios
                    .patch(`${baseUrl}/receipt/update/${editId}`, payload)
                    .then((resp) => {
                        console.log("Edit submit", resp);
                        setMessage(resp.data.message);
                        setType("success");
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
                    .post(`${baseUrl}/receipt/create`, payload)
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
    const fetchStudentReceipt = () => {
        // axios
        //   .get(`${baseUrl}/casting/get-month-year`)
        //   .then((resp) => {
        //     console.log("Fetching month and year.", resp);
        //     setMonth(resp.data.month);
        //     setYear(resp.data.year);
        //   })
        //   .catch((e) => {
        //     console.log("Error in fetching month and year", e);
        //   });
    };

    const fetchstudentsreceipt = () => {
        axios
            .get(`${baseUrl}/receipt/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setStudentReceipt(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };
    const fetchClass = async () => {
        try {
            const attendee = await axios.get(`${baseUrl}/class/fetch-all`);
            console.log("attendee", attendee)
            setAttendeeClass(attendee.data.data);

        } catch (error) {
            console.error('Error fetching students or checking attendance:', error);
        }
    };
    const fetchSection = async () => {
        try {
            const sections = await axios.get(`${baseUrl}/section/fetch-all`);
            console.log("sections", sections)
            setSection(sections.data.data);

        } catch (error) {
            console.error('Error fetching students or checking attendance:', error);
        }
    };


    const fetchStudents = async () => {
        try {
            const studentsResponse = await axios.get(`${baseUrl}/student/fetch-with-query`); // Fetch based on class
            setStudents(studentsResponse.data.data);

        } catch (error) {
            console.error('Error fetching students or checking attendance:', error);
        }
    };

    const fetchSalesInvoices = async () => {
        try {
            if (!selectedStudent?._id) return;
            const invoicesResponse = await axios.get(`${baseUrl}/salesinvoice/fetch-student-invoice`, {
                params: {
                    student: selectedStudent?._id,
                }
            }); // Fetch based on Student
            setSalesinvoices(invoicesResponse.data.data);

        } catch (error) {
            setSalesinvoices([]);
            console.error('Error fetching students or checking attendance:', error);
        }
    };



    useEffect(() => {
        fetchstudentsreceipt();
        fetchStudentReceipt();
        fetchClass();
        fetchSection();
        fetchStudents();

    }, [message]);






    useEffect(() => {
        console.log("receiptDetails:", receiptDetails);
    }, [receiptDetails]);

    useEffect(() => {
        console.log("isDataValid:", isDataValid);
    }, [isDataValid]);

    useEffect(() => {
        fetchSalesInvoices();

    }, [selectedStudent]);


    const handleChange = (index, field, value) => {
        const updated = [...receiptDetails];
        updated[index][field] = value;

        

        if (field === "student") {
            updated[index].siId = null;       // 👈 clears invoice
            updated[index].invAmount = 0;
            updated[index].paidAmount = 0;
            setSalesinvoices([]);             // 👈 clear old invoices
            setSelectedSalesinvoice(null);    // 👈 clear Autocomplete text
        }

        if (field === "siId") {
            updated[index].class = updated[index].siId.class || null;
            updated[index].section = updated[index].siId.section || null;
            const invBal = ((updated[index].siId.totalNetAmount || 0) - (updated[index].siId.totalPaidAmount || 0))
            updated[index].invAmount = invBal;
            updated[index].paidAmount = 0;

        }

        if (field === "paidAmount") {
            if (updated[index].paidAmount > updated[index].invAmount) {
                updated[index].paidAmount = 0;
            }
        }





        setReceiptDetails(updated);
    };

    const addRow = () => {
        setReceiptDetails([
            ...receiptDetails,
            {
                class: null,
                section: null,
                student: null,
                siId: null,
                invAmount: 0,
                paidAmount: 0,
                remarks: "",
            },
        ]);
    };

    const removeRow = (index) => {
        setReceiptDetails(receiptDetails.filter((_, i) => i !== index));
        console.log(receiptDetails);
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
                        
                        <Tab label={isEdit ? "Edit Receipt" : "Create Receipt"} />
                        <Tab label="View List" />
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Box>
                        {/* Create Receipt */}
                       

                        <Box component={"div"} sx={{}}>
                            <Paper
                                sx={{ padding: '20px', margin: "10px" }}
                            >
                                {isEdit ? (
                                    <Typography
                                        variant="h4"
                                        sx={{ fontWeight: "800", textAlign: "center" }}
                                    >
                                        Edit receipt
                                    </Typography>
                                ) : (
                                    <Typography
                                        variant="h4"
                                        sx={{ fontWeight: "800", textAlign: "center" }}
                                    >
                                        Add New receipt
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
                                        {/* Receipt Code */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="Receipt Code"
                                                variant="outlined"
                                                name="receiptCode"
                                                value={Formik.values.receiptCode}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled={isEdit}
                                            />
                                            {Formik.touched.receiptCode && Formik.errors.receiptCode && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.receiptCode}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Receipt Date */}
                                        <Box>
                                            <TextField
                                                name="receiptDate"
                                                label="Date"
                                                type="date"
                                                variant="outlined"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={Formik.values.receiptDate}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled={isEdit}

                                            />
                                            {Formik.touched.receiptDate && Formik.errors.receiptDate && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.receiptDate}
                                                </Typography>
                                            )}
                                        </Box>




                                        <Box>

                                            <TextField
                                                select
                                                fullWidth
                                                required
                                                label="Payment Method"
                                                name="paymentMethod"
                                                value={Formik.values.paymentMethod}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled={isEdit}
                                            >
                                                <MenuItem value="">Select Payment Method</MenuItem>
                                                <MenuItem value="cash">Cash</MenuItem>
                                                <MenuItem value="bank">Bank</MenuItem>
                                                <MenuItem value="upi">UPI</MenuItem>
                                            </TextField>
                                            {Formik.touched.paymentMethod && Formik.errors.paymentMethod && (
                                                <p style={{ color: "red", textTransform: "capitalize" }}>
                                                    {Formik.errors.paymentMethod}
                                                </p>
                                            )}
                                        </Box>



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

                                    {/* ReceiptDetail */}
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
                                        {receiptDetails.map((row, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: "3fr 1fr 1fr 1fr 0.5fr",
                                                    gap: 1,
                                                    mb: 1,
                                                }}
                                            >




                                                {/* Student */}
                                                {students.length > 0 && (
                                                    <Box>
                                                        <Autocomplete
                                                            disabled={row.isEdit}
                                                            options={students}
                                                            getOptionLabel={(option) => option.name}
                                                            value={row.student}
                                                            onChange={(event, newValue) => {
                                                                setSelectedStudent(newValue);
                                                                handleChange(index, "student", newValue);
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Select Student"
                                                                    placeholder="Search student..."
                                                                    fullWidth

                                                                />
                                                            )}
                                                        />

                                                    </Box>
                                                )}

                                                {/* Salesinvoices */}


                                                <Autocomplete
                                                    disabled={row.isEdit}
                                                    options={Array.isArray(salesinvoices) ? salesinvoices : []}
                                                    getOptionLabel={(option) => option?.siCode || ""}
                                                    value={row.siId}
                                                    isOptionEqualToValue={(option, value) =>
                                                        option?._id === value?._id
                                                    }
                                                    onChange={(event, newValue) => {
                                                        setSelectedSalesinvoice(newValue);
                                                        handleChange(index, "siId", newValue);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Select Invoice"
                                                            placeholder="Search Invoice..."
                                                            fullWidth
                                                        />
                                                    )}
                                                />







                                                {/* invAmount */}
                                                <Box>
                                                    <TextField
                                                        fullWidth
                                                        label="invAmount"
                                                        variant="outlined"
                                                        name="invAmount"
                                                        type="number"
                                                        value={row.invAmount}
                                                        onChange={(e) =>
                                                            handleChange(index, "invAmount", e.target.value)
                                                        }
                                                        disabled
                                                    />

                                                </Box>

                                                {/* paidAmount */}
                                                {/* <Box>
                                            <TextField
                                                fullWidth
                                                label="paidAmount"
                                                variant="outlined"
                                                name="paidAmount"
                                                type="number"
                                                value={row.paidAmount}
                                                onChange={(e) =>
                                                    handleChange(index, "paidAmount", e.target.value)
                                                }
                                                disabled={row.isEdit}
                                            />

                                        </Box> */}
                                                <TextField
                                                    fullWidth
                                                    label="paidAmount"
                                                    variant="outlined"
                                                    name="paidAmount"
                                                    type="number"
                                                    value={row.paidAmount}
                                                    inputProps={{ min: 0 }}   // 👈 prevents negative via arrows
                                                    onChange={(e) => {
                                                        const value = Math.max(0, Number(e.target.value || 0));
                                                        handleChange(index, "paidAmount", value);
                                                    }}
                                                    disabled={row.isEdit}
                                                />





                                                <Box>
                                                    <Button
                                                        color="error"
                                                        onClick={() => removeRow(index)}
                                                    >
                                                        ✕
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))}

                                        {/* Add Row */}
                                        <Button variant="outlined" onClick={addRow}>
                                            + Add Invoice
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
                        {/* View List             */}
                        <Box>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            {/* <TableCell component="th" scope="row"> receipt</TableCell> */}
                                            <TableCell align="right">receiptCode</TableCell>
                                            <TableCell align="right">Receipt Date</TableCell>
                                            <TableCell align="right">Remarks</TableCell>
                                            <TableCell align="right">Status</TableCell>
                                            <TableCell align="right">Payment Method</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {studentReceipt.map((value, i) => (
                                            <TableRow
                                                key={i}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {value.receiptCode}
                                                </TableCell>
                                                <TableCell align="right">{dayjs(value.receiptDate).format("DD-MM-YYYY")}</TableCell>
                                                <TableCell align="right">{value.remarks}</TableCell>
                                                <TableCell align="right">{value.status}</TableCell>
                                                <TableCell align="right">{value.paymentMethod}</TableCell>
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
