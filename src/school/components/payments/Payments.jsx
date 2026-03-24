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
import { paymentSchema } from "../../../yupSchema/paymentSchema";
import PaymentPrint from "./PaymentPrint";

export default function Payments() {
    const [isDataValid, setIsDataValid] = useState(true);
    const [dataError, setDataError] = useState('');
    const [employeePayment, setEmployeePayment] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [date, setDate] = useState(new Date());

    const [isPrint, setPrint] = useState(false);
    const [printId, setPrintId] = useState(null);

    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [loading, setLoading] = useState(true);



    const [expenses, setExpenses] = useState([]);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [tab, setTab] = useState(0);
    const [selectedYear, setSelectedYear] = useState(null);

    const years = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { label: `${year}-${year + 1}`, value: year };
    });

    const [paymentDetails, setPaymentDetails] = useState([
        {
            employee: null,
            expenseId: null,
            expenseAmount: 0,
            paidAmount: 0,
            remarks: "",
            year: "",
            isEdit: false
        },
    ]);


    const clearPaymentDetails = () => {
        setPaymentDetails([
            {
                employee: null,
                expenseId: null,
                expenseAmount: 0,
                paidAmount: 0,
                remarks: "",
                year: "",
                isEdit: false
            },
        ])
        console.log("paymentDetails", paymentDetails);

    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/payment/delete/${id}`)
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
        axios.get(`${baseUrl}/payment/fetch-single/${id}`)
            .then((resp) => {
                Formik.setFieldValue("paymentCode", resp.data.data.paymentCode);
                Formik.setFieldValue(
                    "paymentDate",
                    resp.data.data.paymentDate ? dayjs(resp.data.data.paymentDate).format("YYYY-MM-DD") : ""
                );
                Formik.setFieldValue("paymentTime", dayjs().format("YYYY-MM-DD HH:mm:ss"));
                Formik.setFieldValue("paymentCode", resp.data.data.paymentCode);
                Formik.setFieldValue("paymentMethod", resp.data.data.paymentMethod);
                Formik.setFieldValue("status", resp.data.data.status);


                Formik.setFieldValue("remarks", resp.data.data.remarks);
                Formik.setFieldValue("year", resp.data.data.year);

                const matchedYear = years.find(s => s.value === resp.data.data.year);
                setSelectedYear(matchedYear || null);

                setEditId(resp.data.data._id);



                const editPaymentDetails = resp.data.data.paymentDetails.map((row) => ({
                    ...row,
                    isEdit: true
                }));

                setPaymentDetails(editPaymentDetails);
                setTab(0); // open Create Payment tab


            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    // const handlePrint = async (id) => {
    //     console.log("Handle  Print is called", id);
    //     setPrint(true);


    //     window.open(`/school/PaymentPrint?id=${id}`,
    //         '_blank');
    //     setPrint(false);


    // };

    const handlePrint = (id) => {
        setPrint(true);
        const url = `${window.location.origin}/school/PaymentPrint?id=${id}`;
        window.open(url, '_blank');
        setPrint(false);
    };



    const cancelEdit = () => {
        setEdit(false);
        setEditId(null);
        Formik.resetForm()
        // 🔥 reset Autocomplete values
        setSelectedEmployee(null);
        setSelectedExpense(null);
        setSelectedYear(null);
        setIsDataValid(true);
        // 🔥 reset Autocomplete values
        clearPaymentDetails();

    };

    const clearForm = () => {
        setEdit(false);
        setEditId(null);
        Formik.resetForm()
        // 🔥 reset Autocomplete values
        clearPaymentDetails();

    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {

        paymentCode: "",
        paymentDate: "",
        paymentTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        paymentMethod: "",
        status: "valid",
        remarks: "",
        year: "",
    };

    const hasDuplicateInvoice = (paymentDetails) => {
        const seen = new Set();

        for (const row of paymentDetails) {
            if (!row.expenseId?._id) continue; // skip empty rows

            if (seen.has(row.expenseId._id)) {
                return true; // duplicate found
            }

            seen.add(row.expenseId._id);
        }

        return false;
    };

    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: paymentSchema,
        onSubmit: (values) => {

            if (paymentDetails.length == 0) {
                setDataError('Payment Details is missing');
                setIsDataValid(false);
                return;
            }

            if (hasDuplicateInvoice(paymentDetails)) {
                setDataError("Duplicate Expense selected. Please remove duplicates.");
                setIsDataValid(false);
                return;
            }


            let hasInvalidRow = false;

            for (const item of paymentDetails) {

                if (item.expenseAmount === 0) {
                    setDataError('expenseAmount must be greater than 0');
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
                paymentDetails: paymentDetails.map((row) => ({
                    employee: row.employee._id,
                    expenseId: row.expenseId._id,
                    expenseCode: row.expenseId.expenseCode,
                    expenseAmount: row.expenseAmount,
                    paidAmount: row.paidAmount,
                    remarks: "",
                    year: values.year,
                })),
            };
            if (isEdit) {
                console.log("edit id", editId);

                axios
                    .patch(`${baseUrl}/payment/update/${editId}`, payload)
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
                    .post(`${baseUrl}/payment/create`, payload)
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
    const fetchPayment = () => {
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

    const fetchemployeespayment = () => {
        axios
            .get(`${baseUrl}/payment/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setEmployeePayment(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };



    const fetchEmployees = async () => {
        try {
            const employeesResponse = await axios.get(`${baseUrl}/employee/fetch-with-query`); // Fetch All Employees
            setEmployees(employeesResponse.data.data);

        } catch (error) {
            console.error('Error fetching employees or checking attendance:', error);
        }
    };

    const fetchExpenses = async () => {
        try {
            if (!selectedEmployee?._id) return;
            
            const expensesResponse = await axios.get(`${baseUrl}/expense/fetch-employee-expense`, {
                params: {
                    employee: selectedEmployee?._id,
                }
            }); // Fetch based on Employee
            setExpenses(expensesResponse.data.data);

        } catch (error) {
            setExpenses([]);
            console.error('Error fetching employees or checking attendance:', error);
        }
    };



    useEffect(() => {
        fetchemployeespayment();
        fetchPayment();

        fetchEmployees();

    }, [message]);






    useEffect(() => {
        console.log("paymentDetails:", paymentDetails);
    }, [paymentDetails]);

    useEffect(() => {
        console.log("isDataValid:", isDataValid);
    }, [isDataValid]);

    useEffect(() => {
        fetchExpenses();

    }, [selectedEmployee]);


    const handleChange = (index, field, value) => {
        const updated = [...paymentDetails];
        updated[index][field] = value;



        if (field === "employee") {
            updated[index].expenseId = null;       // 👈 clears invoice
            updated[index].expenseAmount = 0;
            updated[index].paidAmount = 0;
            setExpenses([]);             // 👈 clear old expenses
            setSelectedExpense(null);    // 👈 clear Autocomplete text
        }

        if (field === "expenseId") {
            const invBal = ((updated[index].expenseId.totalExpenseAmount || 0) - (updated[index].expenseId.totalPaidAmount || 0))
            updated[index].expenseAmount = invBal;
            updated[index].paidAmount = 0;

        }

        if (field === "paidAmount") {
            if (updated[index].paidAmount > updated[index].expenseAmount) {
                updated[index].paidAmount = 0;
            }
        }
        setPaymentDetails(updated);
    };

    const addRow = () => {
        setPaymentDetails([
            ...paymentDetails,
            {
                employee: null,
                expenseId: null,
                expenseAmount: 0,
                paidAmount: 0,
                remarks: "",
                year: "",
            },
        ]);
    };

    const removeRow = (index) => {
        setPaymentDetails(paymentDetails.filter((_, i) => i !== index));
        console.log(paymentDetails);
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

                        <Tab label={isEdit ? "Edit Payment" : "Create Payment"} />
                        <Tab label="View List" />
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Box>
                        {/* Create Payment */}


                        <Box component={"div"} sx={{}}>
                            <Paper
                                sx={{ padding: '20px', margin: "10px" }}
                            >
                                {isEdit ? (
                                    <Typography
                                        variant="h4"
                                        sx={{ fontWeight: "800", textAlign: "center" }}
                                    >
                                        Edit payment
                                    </Typography>
                                ) : (
                                    <Typography
                                        variant="h4"
                                        sx={{ fontWeight: "800", textAlign: "center" }}
                                    >
                                        Add New payment
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
                                        {/* Payment Code */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="Payment Code"
                                                variant="outlined"
                                                name="paymentCode"
                                                value={Formik.values.paymentCode}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled={isEdit}
                                            />
                                            {Formik.touched.paymentCode && Formik.errors.paymentCode && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.paymentCode}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Payment Date */}
                                        <Box>
                                            <TextField
                                                name="paymentDate"
                                                label="Date"
                                                type="date"
                                                variant="outlined"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={Formik.values.paymentDate}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled={isEdit}

                                            />
                                            {Formik.touched.paymentDate && Formik.errors.paymentDate && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.paymentDate}
                                                </Typography>
                                            )}
                                        </Box>


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

                                    {/* PaymentDetail */}
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
                                        {paymentDetails.map((row, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: "3fr 1fr 1fr 1fr 0.5fr",
                                                    gap: 1,
                                                    mb: 1,
                                                }}
                                            >




                                                {/* Employee */}
                                                <Box>
                                                    <Autocomplete
                                                        disabled={row.isEdit}
                                                        options={employees}
                                                        getOptionLabel={(option) => option.employee_name}
                                                        value={row.employee}
                                                        onChange={(event, newValue) => {
                                                            setSelectedEmployee(newValue);
                                                            handleChange(index, "employee", newValue);
                                                        }}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Select Employee"
                                                                placeholder="Search employee..."
                                                                fullWidth

                                                            />
                                                        )}
                                                    />

                                                </Box>


                                                {/* Expenses */}


                                                <Autocomplete
                                                    disabled={row.isEdit}
                                                    options={Array.isArray(expenses) ? expenses : []}
                                                    getOptionLabel={(option) => option?.expenseCode || ""}
                                                    value={row.expenseId}
                                                    isOptionEqualToValue={(option, value) =>
                                                        option?._id === value?._id
                                                    }
                                                    onChange={(event, newValue) => {
                                                        setSelectedExpense(newValue);
                                                        handleChange(index, "expenseId", newValue);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Select Expense"
                                                            placeholder="Search Expense..."
                                                            fullWidth
                                                        />
                                                    )}
                                                />







                                                {/* expenseAmount */}
                                                <Box>
                                                    <TextField
                                                        fullWidth
                                                        label="expenseAmount"
                                                        variant="outlined"
                                                        name="expenseAmount"
                                                        type="number"
                                                        value={row.expenseAmount}
                                                        onChange={(e) =>
                                                            handleChange(index, "expenseAmount", e.target.value)
                                                        }
                                                        disabled
                                                    />

                                                </Box>

                                                {/* paidAmount */}
                                                
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
                                            {/* <TableCell component="th" scope="row"> payment</TableCell> */}
                                            <TableCell align="right">paymentCode</TableCell>
                                            <TableCell align="right">Payment Date</TableCell>
                                            <TableCell align="right">Remarks</TableCell>
                                            <TableCell align="right">Status</TableCell>
                                            <TableCell align="right">Payment Method</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {employeePayment.map((value, i) => (
                                            <TableRow
                                                key={i}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {value.paymentCode}
                                                </TableCell>
                                                <TableCell align="right">{dayjs(value.paymentDate).format("DD-MM-YYYY")}</TableCell>
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
