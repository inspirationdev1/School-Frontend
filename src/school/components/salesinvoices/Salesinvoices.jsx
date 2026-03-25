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
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { salesinvoiceSchema } from "../../../yupSchema/salesinvoiceSchema";
import SalesinvoicePrint from "./SalesinvoicePrint";

export default function Salesinvoice() {
  const [isDataValid, setIsDataValid] = useState(true);
  const [dataError, setDataError] = useState('');
  const [studentSalesinvoice, setStudentSalesinvoice] = useState([]);
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
  const [feestructure, setFeestructure] = useState([])
  const [selectedFeestructure, setSelectedFeestructure] = useState(null);
  const [allFeestructure, setAllFeestructure] = useState([])
  const [tab, setTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}-${year + 1}`, value: year };
  });

  const [invoiceDetails, setInvoiceDetails] = useState([
    {
      feestructure: null,
      feeFrequency: "",
      feeAmount: 0,
      quantity: 1,
      grossAmount: 0,
      discountType: "none", // ✅ default
      discountMonth: 0,
      discountPer: 0,
      discountAmount: 0,
      netAmount: 0,
      remarks: "",
      isEdit: false
    },
  ]);


  const clearInvoiceDetails = () => {
    setInvoiceDetails([
      {
        feestructure: null,
        feeFrequency: "",
        feeAmount: 0,
        quantity: 1,
        grossAmount: 0,
        discountType: "none", // ✅ default
        discountMonth: 0,
        discountPer: 0,
        discountAmount: 0,
        netAmount: 0,
        remarks: "",
        year: "",
      },
    ])
    console.log("invoiceDetails", invoiceDetails);

  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/salesinvoice/delete/${id}`)
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
    axios.get(`${baseUrl}/salesinvoice/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("siCode", resp.data.data.siCode);
        Formik.setFieldValue(
          "invoiceDate",
          resp.data.data.invoiceDate ? dayjs(resp.data.data.invoiceDate).format("YYYY-MM-DD") : ""
        );
        Formik.setFieldValue("invoiceTime", dayjs().format("YYYY-MM-DD HH:mm:ss"));
        Formik.setFieldValue("class", resp.data.data.class);
        Formik.setFieldValue("section", resp.data.data.section);
        Formik.setFieldValue("student", resp.data.data.student);
        Formik.setFieldValue("paymentStatus", resp.data.data.paymentStatus);
        Formik.setFieldValue("status", resp.data.data.status);
        Formik.setFieldValue("year", resp.data.data.year);

        const matchedYear = years.find(s => s.value === resp.data.data.year);
        setSelectedYear(matchedYear || null);

        Formik.setFieldValue("remarks", resp.data.data.remarks);
        const classId = resp.data.data?.class || resp.data.class;
        const sectionId = resp.data.data?.section || resp.data.section;
        const studentId = resp.data.data?.student || resp.data.student;
        const matchedClass = attendeeClass.find(c => c._id === classId);
        const matchedSection = section.find(s => s._id === sectionId);
        const matchedStudent = students.find(s => s._id === studentId);

        setSelectedClass(matchedClass || null);
        setSelectedSection(matchedSection || null);
        setSelectedStudent(matchedStudent || null);
        setEditId(resp.data.data._id);



        const editInvoiceDetails = resp.data.data.invoiceDetails.map((row) => ({
          ...row,
          feestructure: allFeestructure.find(
            (f) => f._id === row.feestructure
          ) || null,
          isEdit: true
        }));

        setInvoiceDetails(editInvoiceDetails);
        setTab(0); // open Create Receipt tab

      })
      .catch((e) => {
        console.log("Error  in fetching edit data.");
      });
  };

  const handlePrint = async (id) => {
    console.log("Handle  Print is called", id);
    setPrint(true);


    window.open(`/school/SalesinvoicePrint?id=${id}`,
      '_blank');
    setPrint(false);


  };

  const handleReceipt = async (id) => {
    console.log("Handle  Print is called", id);
    setPrint(true);


    window.open(`/school/SalesinvoicePrint?id=${id}`,
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
    setSelectedYear(null);
    setIsDataValid(true);
    // 🔥 reset Autocomplete values
    clearInvoiceDetails();
  };

  const clearForm = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm()
    // 🔥 reset Autocomplete values
    setSelectedClass(null);
    setSelectedSection(null);
    setSelectedStudent(null);
    setSelectedYear(null);
    clearInvoiceDetails();

  };

  //   MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const resetMessage = () => {
    setMessage("");
  };

  

  const initialValues = {

    siCode: "",
    invoiceDate: "",
    invoiceTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    class: "",
    section: "",
    student: "",
    paymentStatus: "pending",
    status: "valid",
    remarks: "",
    year: "",
  };
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: salesinvoiceSchema,
    onSubmit: (values) => {

      if (invoiceDetails.length == 0) {
        setDataError('Invoice Details is missing');
        setIsDataValid(false);
        return;
      }

      let hasInvalidRow = false;

      for (const item of invoiceDetails) {
        if (item.feestructure === undefined || item.feestructure === '' || item.feestructure === null) {
          setDataError('Select feestructure');
          hasInvalidRow = true;
          break; // exit loop when condition met
        }

        if (item.feeFrequency === undefined || item.feeFrequency === '' || item.feeFrequency === null) {
          setDataError('Select feeFrequency');
          hasInvalidRow = true;
          break; // exit loop when condition met
        }

        if (item.discountType === undefined || item.discountType === '' || item.discountType === null) {
          setDataError('Select discountType');
          hasInvalidRow = true;
          break; // exit loop when condition met
        }

        if (item.grossAmount === 0) {
          setDataError('grossAmount must be greater than 0');
          hasInvalidRow = true;
          break; // exit loop when condition met
        }
        if (item.netAmount === 0) {
          setDataError('netAmount must be greater than 0');
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
        invoiceDetails: invoiceDetails.map((row) => ({
          feestructure: row.feestructure?._id, // 👈 convert here
          itemId: row.feestructure?._id, // 👈 convert here
          itemName: row.feestructure?.name, // 👈 convert here
          quantity: row.quantity,
          salesPrice: row.feeAmount,
          feeFrequency: row.feeFrequency,
          feeAmount: row.feeAmount,
          grossAmount: row.grossAmount,
          discountType: row.discountType,
          discountMonth: row.discountMonth,
          discountPer: row.discountPer,
          discountAmount: row.discountAmount,
          netAmount: row.netAmount,
          remarks: '',
          student: values.student,
          year: values.year,
        })),
      };
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/salesinvoice/update/${editId}`, payload)
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
          .post(`${baseUrl}/salesinvoice/create`, payload)
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
  const fetchStudentSalesinvoice = () => {
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

  const fetchstudentssalesinvoice = () => {
    axios
      .get(`${baseUrl}/salesinvoice/fetch-all`)
      .then((resp) => {
        console.log("Fetching data in  Casting Calls  admin.", resp);
        setStudentSalesinvoice(resp.data.data);
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
      const studentsResponse = await axios.get(`${baseUrl}/student/fetch-with-query`, {
        params: {
          student_class: selectedClass?._id,
          section: selectedSection?._id
        }
      }); // Fetch based on class
      setStudents(studentsResponse.data.data);

    } catch (error) {
      console.error('Error fetching students or checking attendance:', error);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      if (!selectedClass?._id) return;
      const feestrucureResponse = await axios.get(`${baseUrl}/feestructure/fetch-with-query`, {
        params: {
          class: selectedClass?._id
        }
      }); // Fetch based on class
      setFeestructure(feestrucureResponse.data.data);

    } catch (error) {
      console.error('Error fetching students or checking attendance:', error);
    }
  };

  const fetchAllFeeStructures = async () => {
    try {
      const allFeestrucureResponse = await axios.get(`${baseUrl}/feestructure/fetch-all`); // Fetch All Feestructures
      setAllFeestructure(allFeestrucureResponse.data.data);
    } catch (error) {
      console.error('Error fetching students or checking attendance:', error);
    }
  };

  useEffect(() => {
    fetchstudentssalesinvoice();
    fetchStudentSalesinvoice();
    fetchClass();
    fetchSection();
    fetchAllFeeStructures();

  }, [message]);

  useEffect(() => {
    if (selectedClass?._id) {
      fetchFeeStructures();
    }

  }, [selectedClass]);

  useEffect(() => {
    fetchStudents();

  }, [selectedClass, selectedSection]);


  useEffect(() => {
    console.log("invoiceDetails:", invoiceDetails);
  }, [invoiceDetails]);

  useEffect(() => {
    console.log("isDataValid:", isDataValid);
  }, [isDataValid]);

  const handleChange = (index, field, value) => {
    const updated = [...invoiceDetails];
    updated[index][field] = value;

    // auto-calculate grossAmount
    // if (field === "quantity" || field === "salesPrice") {
    //   updated[index].grossAmount =
    //     updated[index].quantity * updated[index].salesPrice;
    // }

    if (field === "discountType") {
      updated[index].discountPer = 0;
      updated[index].discountAmount = 0;
      updated[index].discountMonth = 0;
    }

    if (field === "feestructure") {
      updated[index].feeAmount = updated[index].feestructure.amount;
      updated[index].grossAmount = updated[index].feeAmount;

      updated[index].quantity = 1;
      updated[index].discountPer = 0;
      updated[index].discountAmount = 0;
      updated[index].discountMonth = 0;
      updated[index].feeFrequency = "";
    }

    if (field === "feeFrequency") {
      updated[index].discountPer = 0;
      updated[index].discountAmount = 0;
      updated[index].discountMonth = 0;

      if (updated[index].feeFrequency == "annually") {
        updated[index].quantity = 12;
        updated[index].grossAmount = updated[index].feeAmount * updated[index].quantity;
      } else if (updated[index].feeFrequency == "quaterly") {
        updated[index].quantity = 4;
        updated[index].grossAmount = updated[index].feeAmount * updated[index].quantity;
      } else {
        updated[index].quantity = 1;
        updated[index].grossAmount = updated[index].feeAmount * updated[index].quantity;
      }


    }

    if (field === "grossAmount") {
      updated[index].netAmount = updated[index].grossAmount;
    }

    if (field === "discountPer") {
      updated[index].discountAmount = updated[index].grossAmount * updated[index].discountPer / 100;

    }

    if (field === "discountMonth") {
      updated[index].discountAmount = updated[index].feeAmount * updated[index].discountMonth;
    }

    updated[index].netAmount = updated[index].grossAmount - updated[index].discountAmount;

    setInvoiceDetails(updated);
  };

  const addRow = () => {
    setInvoiceDetails([
      ...invoiceDetails,
      {
        feestructure: "", feeFrequency: "",
        feeAmount: 0,
        quantity: 1,
        grossAmount: 0,
        discountType: "none", // ✅ default
        discountMonth: 0,
        discountPer: 0,
        discountAmount: 0,
        netAmount: 0,
        remarks: ""
      },
    ]);
  };

  const removeRow = (index) => {
    setInvoiceDetails(invoiceDetails.filter((_, i) => i !== index));
    console.log(invoiceDetails);
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
            <Tab label={isEdit ? "Edit Fees Invoice" : "Create Fees Invoice"} />
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
                    Edit salesinvoice
                  </Typography>
                ) : (
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "800", textAlign: "center" }}
                  >
                    Add New  Fee Invoice
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
                    {/* Salesinvoice Code */}
                    <Box>
                      <TextField
                        fullWidth
                        label="Invoice Code"
                        variant="outlined"
                        name="siCode"
                        value={Formik.values.siCode}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        disabled={isEdit}
                      />
                      {Formik.touched.siCode && Formik.errors.siCode && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.siCode}
                        </Typography>
                      )}
                    </Box>

                    {/* Invoice Date */}
                    <Box>
                      <TextField
                        name="invoiceDate"
                        label="Date"
                        type="date"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={Formik.values.invoiceDate}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        disabled={isEdit}

                      />
                      {Formik.touched.invoiceDate && Formik.errors.invoiceDate && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.invoiceDate}
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

                    {/* Class */}
                    {attendeeClass.length > 0 && (
                      <Box>

                        <Autocomplete
                          disabled={isEdit}
                          options={attendeeClass}
                          getOptionLabel={(option) => option.class_text}
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
                    )}

                    {/* Section */}
                    {section.length > 0 && (
                      <Box>
                        <Autocomplete
                          disabled={isEdit}
                          options={section}
                          getOptionLabel={(option) => option.section_name}
                          value={selectedSection}
                          onChange={(event, newValue) => {
                            setSelectedSection(newValue);
                            Formik.setFieldValue(
                              "section",
                              newValue ? newValue._id : ""
                            );
                          }}
                          onBlur={() => Formik.setFieldTouched("section", true)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Section"
                              placeholder="Search section..."
                              fullWidth
                              error={Formik.touched.section && Boolean(Formik.errors.section)}
                              helperText={Formik.touched.section && Formik.errors.section}
                            />
                          )}
                        />


                      </Box>
                    )}

                    {/* Student */}
                    {students.length > 0 && (
                      <Box>
                        <Autocomplete
                          disabled={isEdit}
                          options={students}
                          getOptionLabel={(option) => option.name}
                          value={selectedStudent}
                          onChange={(event, newValue) => {
                            setSelectedStudent(newValue);

                            Formik.setFieldValue(
                              "student",
                              newValue ? newValue._id : ""
                            );
                          }}
                          onBlur={() => Formik.setFieldTouched("student", true)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Student"
                              placeholder="Search student..."
                              fullWidth
                              error={Formik.touched.student && Boolean(Formik.errors.student)}
                              helperText={Formik.touched.student && Formik.errors.student}
                            />
                          )}
                        />

                      </Box>
                    )}



                    
                    <Box>

                      <TextField
                        select
                        fullWidth
                        required
                        label="Payment Status"
                        name="paymentStatus"
                        value={Formik.values.paymentStatus}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        disabled
                      >
                        <MenuItem value="">Select Payment Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                      </TextField>
                      {Formik.touched.paymentStatus && Formik.errors.paymentStatus && (
                        <p style={{ color: "red", textTransform: "capitalize" }}>
                          {Formik.errors.paymentStatus}
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

                  {/* InvoiceDetail */}
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
                    {invoiceDetails.map((row, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "3fr 1fr 1fr 1fr 0.5fr",
                          gap: 1,
                          mb: 1,
                        }}
                      >


                        <Box>
                          <Autocomplete
                            disabled={row.isEdit}
                            options={feestructure}
                            getOptionLabel={(option) => option?.name || ""}
                            isOptionEqualToValue={(option, value) =>
                              option._id === value?._id
                            }
                            value={row.feestructure}
                            onChange={(event, newValue) => {
                              handleChange(index, "feestructure", newValue);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Feestructure"
                                placeholder="Search feestructure..."
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
                            label="feeFrequency"
                            name="feeFrequency"
                            // value={Formik.values.feeFrequency}
                            // onChange={Formik.handleChange}
                            value={row.feeFrequency}
                            onChange={(e) =>
                              handleChange(index, "feeFrequency", e.target.value)
                            }
                            // onBlur={Formik.handleBlur}
                            disabled={row.isEdit}
                          >
                            <MenuItem value="">Select feeFrequency</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="quaterly">Quaterly</MenuItem>
                            <MenuItem value="annually">Annually</MenuItem>
                            <MenuItem value="ontime">One-Time</MenuItem>
                            <MenuItem value="termwise">Term-wise</MenuItem>
                          </TextField>
                          {/* {Formik.touched.feeFrequency && Formik.errors.feeFrequency && (
                        <p style={{ color: "red", textTransform: "capitalize" }}>
                          {Formik.errors.feeFrequency}
                        </p>
                      )} */}
                        </Box>



                        {/* feeAmount */}
                        <Box>
                          <TextField
                            fullWidth
                            label="feeAmount"
                            variant="outlined"
                            name="feeAmount"
                            type="number"
                            // value={Formik.values.feeAmount}
                            // onChange={Formik.handleChange}
                            // onBlur={Formik.handleBlur}
                            value={row.feeAmount}
                            onChange={(e) =>
                              handleChange(index, "feeAmount", e.target.value)
                            }
                            disabled
                          />
                          {/* {Formik.touched.feeAmount && Formik.errors.feeAmount && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.feeAmount}
                        </Typography>
                      )} */}
                        </Box>

                        {/* grossAmount */}
                        <Box>
                          <TextField
                            fullWidth
                            label="grossAmount"
                            variant="outlined"
                            name="grossAmount"
                            type="number"
                            // value={Formik.values.grossAmount}
                            // onChange={Formik.handleChange}
                            // onBlur={Formik.handleBlur}
                            value={row.grossAmount}
                            onChange={(e) =>
                              handleChange(index, "grossAmount", e.target.value)
                            }
                            disabled={row.isEdit}
                          />
                          {/* {Formik.touched.grossAmount && Formik.errors.grossAmount && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.grossAmount}
                        </Typography>
                      )} */}
                        </Box>

                        {/* discountType → full width */}
                        <Box>

                          <TextField
                            select
                            fullWidth
                            required
                            label="discountType"
                            name="discountType"
                            value={row.discountType}
                            onChange={(e) =>
                              handleChange(index, "discountType", e.target.value)
                            }
                            disabled={row.isEdit}
                          >
                            <MenuItem value="">Select discountType</MenuItem>
                            <MenuItem value="none">None</MenuItem>
                            <MenuItem value="discountPer">Disc %</MenuItem>
                            <MenuItem value="discountAmount">Disc Amount</MenuItem>
                            <MenuItem value="discountFee">Disc Fee</MenuItem>
                          </TextField>

                        </Box>


                        {row.discountType === "discountFee" && (
                          <Box>
                            <TextField
                              fullWidth
                              label="discountMonth"
                              variant="outlined"
                              name="discountMonth"
                              type="number"
                              value={row.discountMonth}
                              onChange={(e) =>
                                handleChange(index, "discountMonth", e.target.value)
                              }
                              disabled={row.isEdit}
                            />
                          </Box>
                        )}

                        {/* discountPer */}
                        {row.discountType === "discountPer" && (

                          <Box>
                            <TextField
                              fullWidth
                              label="discountPer"
                              variant="outlined"
                              name="discountPer"
                              type="number"
                              value={row.discountPer}
                              onChange={(e) =>
                                handleChange(index, "discountPer", e.target.value)
                              }
                              disabled={row.isEdit}
                            />

                          </Box>
                        )}


                        {/* discountAmount */}


                        <Box>
                          <TextField
                            fullWidth
                            label="discountAmount"
                            variant="outlined"
                            name="discountAmount"
                            type="number"
                            value={row.discountAmount}
                            onChange={(e) =>
                              handleChange(index, "discountAmount", e.target.value)
                            }
                            disabled={row.isEdit || row.discountType === "discountPer"
                              || row.discountType === "discountFee" || row.discountType === "none" || row.discountType === ""}
                          />

                        </Box>



                        {/* netAmount */}
                        <Box>
                          <TextField
                            fullWidth
                            label="netAmount"
                            variant="outlined"
                            name="netAmount"
                            type="number"
                            value={row.netAmount}
                            onChange={(e) =>
                              handleChange(index, "netAmount", e.target.value)
                            }
                            disabled
                          />

                        </Box>

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
                      {/* <TableCell component="th" scope="row"> salesinvoice</TableCell> */}
                      <TableCell align="right">siCode</TableCell>
                      <TableCell align="right">Invoice Date</TableCell>
                      <TableCell align="right">Remarks</TableCell>
                      <TableCell align="right">Status</TableCell>
                      <TableCell align="right">Payment Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentSalesinvoice.map((value, i) => (
                      <TableRow
                        key={i}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {value.siCode}
                        </TableCell>
                        <TableCell align="right">{dayjs(value.invoiceDate).format("DD-MM-YYYY")}</TableCell>
                        <TableCell align="right">{value.remarks}</TableCell>
                        <TableCell align="right">{value.status}</TableCell>
                        <TableCell align="right">{value.paymentStatus}</TableCell>
                        <TableCell align="right">  <Box component={'div'} sx={{ bottom: 0, display: 'flex', justifyContent: "end" }} >


                          <Box
                            component="div"
                            sx={{
                              display: "flex",
                              justifyContent: "end",
                              gap: 1.5, // 👈 adds space between buttons
                            }}
                          >
                            {(value.status === "valid" && value.paymentStatus === "pending") && (
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
