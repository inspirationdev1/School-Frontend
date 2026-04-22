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
import { expenseSchema } from "../../../yupSchema/expenseSchema";
import ExpensePrint from "./ExpensePrint";

export default function Expenses() {
    const [isDataValid, setIsDataValid] = useState(true);
    const [dataError, setDataError] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [date, setDate] = useState(new Date());

    const [isPrint, setPrint] = useState(false);
    const [printId, setPrintId] = useState(null);

    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [loading, setLoading] = useState(true);
    const [attendeeClass, setAttendeeClass] = useState([])
    const [selectedClass, setSelectedClass] = useState(null);
    const [section, setSection] = useState([])
    const [selectedSection, setSelectedSection] = useState(null);


    const [expensetypes, setExpensetypes] = useState([]);
    const [selectedExpensetype, setSelectedExpensetype] = useState(null);
    const [tab, setTab] = useState(0);
    const [selectedYear, setSelectedYear] = useState(null);

    const [expenseAmountTotal, setExpenseAmountTotal] = useState(0);


    const years = Array.from({ length: 10 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { label: `${year}-${year + 1}`, value: year };
    });

    const [expenseDetails, setExpenseDetails] = useState([
        {
            expensetype: null,
            expenseAmount: 0,
            remarks: "",
            isEdit: false
        },
    ]);


    const clearExpenseDetails = () => {
        setExpenseDetails([
            {
                class: null,
                section: null,
                expensetype: null,
                invAmount: 0,
                expenseAmount: 0,
                remarks: "",
            },
        ])
        console.log("expenseDetails", expenseDetails);

    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/expense/delete/${id}`)
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
        axios.get(`${baseUrl}/expense/fetch-single/${id}`)
            .then((resp) => {
                Formik.setFieldValue("expenseCode", resp.data.data.expenseCode);
                Formik.setFieldValue(
                    "expenseDate",
                    resp.data.data.expenseDate ? dayjs(resp.data.data.expenseDate).format("YYYY-MM-DD") : ""
                );
                Formik.setFieldValue("expenseTime", dayjs().format("YYYY-MM-DD HH:mm:ss"));
                Formik.setFieldValue("expenseCode", resp.data.data.expenseCode);
                Formik.setFieldValue("status", resp.data.data.status);
                Formik.setFieldValue("employee", resp.data.data?.employee?._id);
                setSelectedEmployee(resp.data.data.employee);

                Formik.setFieldValue("remarks", resp.data.data.remarks);
                Formik.setFieldValue("year", resp.data.data.year);
                const matchedYear = years.find(s => s.value === resp.data.data.year);
                setSelectedYear(matchedYear || null);

                Formik.setFieldValue("expenseAmount", resp.data.data?.expenseAmount||0)

                setEditId(resp.data.data._id);



                const editExpenseDetails = resp.data.data.expenseDetails.map((row) => ({
                    ...row,
                    isEdit: true
                }));

                setExpenseDetails(editExpenseDetails);
                // const expTotal = calculateTotals();
                // setExpenseAmountTotal(expTotal);
                // Formik.setFieldValue("expenseAmount", expTotal);
                setTab(0); // open Create Expense tab


            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const handlePrint = async (id) => {
        console.log("Handle  Print is called", id);
        setPrint(true);


        window.open(`/school/ExpensePrint?id=${id}`,
            '_blank');
        setPrint(false);


    };

    const handleExpense = async (id) => {
        console.log("Handle  Print is called", id);
        setPrint(true);


        window.open(`/school/ExpensePrint?id=${id}`,
            '_blank');
        setPrint(false);


    };
    const cancelEdit = () => {
        setEdit(false);
        setEditId(null);
        Formik.resetForm()
        // 🔥 reset Autocomplete values
        setSelectedEmployee(null);
        setSelectedExpensetype(null);
        setIsDataValid(true);
        // 🔥 reset Autocomplete values
        clearExpenseDetails();

    };

    const clearForm = () => {
        setEdit(false);
        setEditId(null);
        Formik.resetForm()
        // 🔥 reset Autocomplete values
        clearExpenseDetails();

    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {

        expenseCode: "",
        expenseDate: "",
        expenseTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        employee: null,
        status: "valid",
        remarks: "",
        year: "",
        expenseAmount: 0
    };



    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: expenseSchema,
        onSubmit: (values) => {

            if (expenseDetails.length == 0) {
                setDataError('Expense Details is missing');
                setIsDataValid(false);
                return;
            }




            let hasInvalidRow = false;

            for (const item of expenseDetails) {

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
                expenseDetails: expenseDetails.map((row) => ({
                    expensetype: row.expensetype._id,
                    expensetype_code: row.expensetype.expensetype_code,
                    invAmount: row.invAmount,
                    expenseAmount: row.expenseAmount,
                    remarks: "",
                    employee: values.employee,
                    year: values.year
                })),
            };
            if (isEdit) {
                console.log("edit id", editId);

                axios
                    .patch(`${baseUrl}/expense/update/${editId}`, payload)
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
                    .post(`${baseUrl}/expense/create`, payload)
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


    const fetchexpenses = () => {
        axios
            .get(`${baseUrl}/expense/fetch-all`)
            .then((resp) => {
                console.log("Fetching data in  Casting Calls  admin.", resp);
                setExpenses(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching casting calls admin data", e);
            });
    };


    const fetchEmployees = async () => {
        try {
            const employeesResponse = await axios.get(`${baseUrl}/employee/fetch-with-query`); // Fetch based on class
            setEmployees(employeesResponse.data.data);

        } catch (error) {
            console.error('Error fetching employees or checking attendance:', error);
        }
    };

    const fetchExpensetypes = async () => {
        try {

            const expensetypesResponse = await axios.get(`${baseUrl}/expensetype/fetch-all`); // Fetch based on Student
            setExpensetypes(expensetypesResponse.data.data);

        } catch (error) {
            setExpensetypes([]);
            console.error('Error fetching employees or checking attendance:', error);
        }
    };



    useEffect(() => {
        fetchexpenses();
        fetchEmployees();
        fetchExpensetypes();
    }, [message]);






    useEffect(() => {
        console.log("expenseDetails:", expenseDetails);
    }, [expenseDetails]);

    useEffect(() => {
        console.log("isDataValid:", isDataValid);
    }, [isDataValid]);


    const calculateTotals = () => {
        let expAmountTotal = 0;

        for (const item of expenseDetails) {
            expAmountTotal += item?.expenseAmount || 0;
        }
        return expAmountTotal;
    }

    const handleChange = (index, field, value) => {
        const updated = [...expenseDetails];
        updated[index][field] = value;

        // if (field === "expensetype") {
        //      const invBal = ((updated[index].expensetype.totalNetAmount || 0) - (updated[index].expensetype.totalPaidAmount || 0))
        //     updated[index].invAmount = invBal;
        //     updated[index].expenseAmount = 0;

        // }

        // if (field === "expenseAmount") {

        // }



        setExpenseDetails(updated);
    };

    const addRow = () => {
        setExpenseDetails([
            ...expenseDetails,
            {
                expensetype: null,
                expenseAmount: 0,
                remarks: "",
            },
        ]);
    };

    const removeRow = (index) => {
        setExpenseDetails(expenseDetails.filter((_, i) => i !== index));
        console.log(expenseDetails);
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

                        <Tab label={isEdit ? "Edit Expense" : "Create Expense"} />
                        <Tab label="View List" />
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Box>
                        {/* Create Expense */}


                        <Box component={"div"} sx={{}}>
                            <Paper
                                sx={{ padding: '20px', margin: "10px" }}
                            >
                                {isEdit ? (
                                    <Typography
                                        variant="h4"
                                        sx={{ fontWeight: "800", textAlign: "center" }}
                                    >
                                        Edit expense
                                    </Typography>
                                ) : (
                                    <Typography
                                        variant="h4"
                                        sx={{ fontWeight: "800", textAlign: "center" }}
                                    >
                                        Add New expense
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
                                        {/* Expense Code */}
                                        <Box>
                                            <TextField
                                                fullWidth
                                                label="Expense Code"
                                                variant="outlined"
                                                name="expenseCode"
                                                value={Formik.values.expenseCode}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled={isEdit}
                                            />
                                            {Formik.touched.expenseCode && Formik.errors.expenseCode && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.expenseCode}
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Expense Date */}
                                        <Box>
                                            <TextField
                                                name="expenseDate"
                                                label="Date"
                                                type="date"
                                                variant="outlined"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                value={Formik.values.expenseDate}
                                                onChange={Formik.handleChange}
                                                onBlur={Formik.handleBlur}
                                                disabled={isEdit}

                                            />
                                            {Formik.touched.expenseDate && Formik.errors.expenseDate && (
                                                <Typography color="error" variant="caption">
                                                    {Formik.errors.expenseDate}
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


                                        {/* Employees */}

                                        <Box>
                                            <Autocomplete
                                                disabled={isEdit}
                                                options={employees}
                                                getOptionLabel={(option) => option.employee_name}
                                                value={selectedEmployee}
                                                onChange={(event, newValue) => {
                                                    setSelectedEmployee(newValue);
                                                    Formik.setFieldValue(
                                                        "employee",
                                                        newValue ? newValue._id : ""
                                                    );

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

                                        {/* expenseAmount */}
                                        <Box>
                                            <TextField
                                                disabled
                                                fullWidth
                                                label="expenseAmount"
                                                variant="outlined"
                                                name="expenseAmount"
                                                type="number"
                                                value={Formik.values.expenseAmount}
                                                inputProps={{ min: 0 }}   // 👈 prevents negative via arrows


                                            />
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

                                    {/* ExpenseDetail */}
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
                                        {expenseDetails.map((row, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: "3fr 1fr 1fr 1fr 0.5fr",
                                                    gap: 1,
                                                    mb: 1,
                                                }}
                                            >






                                                {/* Expensetypes */}


                                                <Autocomplete
                                                    disabled={row.isEdit}
                                                    options={Array.isArray(expensetypes) ? expensetypes : []}
                                                    getOptionLabel={(option) => option?.expensetype_name || ""}
                                                    value={row.expensetype}
                                                    isOptionEqualToValue={(option, value) =>
                                                        option?._id === value?._id
                                                    }
                                                    onChange={(event, newValue) => {
                                                        setSelectedExpensetype(newValue);
                                                        handleChange(index, "expensetype", newValue);
                                                        const expTotal = calculateTotals();
                                                        setExpenseAmountTotal(expTotal);
                                                        Formik.setFieldValue("expenseAmount", expTotal);
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Select Expensetype"
                                                            placeholder="Search expensetype..."
                                                            fullWidth
                                                        />
                                                    )}
                                                />


                                                {/* expenseAmount */}
                                                <TextField
                                                    fullWidth
                                                    label="expenseAmount"
                                                    variant="outlined"
                                                    name="expenseAmount"
                                                    type="number"
                                                    value={row.expenseAmount}
                                                    inputProps={{ min: 0 }}   // 👈 prevents negative via arrows
                                                    onChange={(e) => {
                                                        const value = Math.max(0, Number(e.target.value || 0));
                                                        handleChange(index, "expenseAmount", value);
                                                        const expTotal = calculateTotals();
                                                        setExpenseAmountTotal(expTotal);
                                                        Formik.setFieldValue("expenseAmount", expTotal);

                                                    }}

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
                                            + Add Expense
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
                                            {/* <TableCell component="th" scope="row"> expense</TableCell> */}
                                            <TableCell align="right">expenseCode</TableCell>
                                            <TableCell align="right">Expense Date</TableCell>
                                            <TableCell align="right">Expense Amount</TableCell>
                                            <TableCell align="right">Remarks</TableCell>
                                            <TableCell align="right">Status</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {expenses.map((value, i) => (
                                            <TableRow
                                                key={i}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {value.expenseCode}
                                                </TableCell>
                                                <TableCell align="right">{dayjs(value.expenseDate).format("DD-MM-YYYY")}</TableCell>
                                                <TableCell align="right">{value.expenseAmount}</TableCell>
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
