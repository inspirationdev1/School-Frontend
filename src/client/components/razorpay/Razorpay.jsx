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
  Select,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Autocomplete,
  Tabs,
  Tab,
} from "@mui/material";

import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { receiptSchema } from "../../../yupSchema/receiptSchema";
import { AuthContext } from "../../../context/AuthContext";
import { useLocation } from "react-router-dom";
export default function Razorpay() {
  const { authenticated, user } = useContext(AuthContext);
  console.log("user", user);
  const [appsettings, setAppsettings] = useState([]);
  const [selectedAppsetting, setSelectedAppsetting] = useState(null);

  const [isDataValid, setIsDataValid] = useState(true);
  const [isPaymentDone, setIsPaymentDone] = useState(false);

  const [dataError, setDataError] = useState("");
  const [studentReceipt, setStudentReceipt] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [date, setDate] = useState(new Date());

  const [isPrint, setPrint] = useState(false);
  const [printId, setPrintId] = useState("");

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedpayment, setSelectedpayment] = useState("");
  const [selectedyear, setSelectedyear] = useState("");

  const [loading, setLoading] = useState(true);
  const [attendeeClass, setAttendeeClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [section, setSection] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [salesinvoices, setSalesinvoices] = useState([]);
  const [selectedSalesinvoice, setSelectedSalesinvoice] = useState(null);

  const [tab, setTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState({
    label: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    value: new Date().getFullYear(),
  });

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}-${year + 1}`, value: year };
  });

  const location = useLocation();

  const paramsList = new URLSearchParams(location.search);
  const encryptedData = paramsList.get("invoiceList");
  console.log(encryptedData);
  const invoiceList = encryptedData;
  const [receiptDetails, setReceiptDetails] = useState([]);

  const clearReceiptDetails = () => {
    setReceiptDetails([
      {
        class: null,
        section: null,
        student: null,
        student_name: "",
        parent: null,
        parent_name: "",
        parent_email: "",
        parent_phoneno: "",
        parent_address: "",
        siId: null,
        invAmount: 0,
        paidAmount: 0,
        remarks: "",
        year: "",
        month: "",
        monthname: "",
        isEdit: false,
      },
    ]);
    console.log("receiptDetails", receiptDetails);
  };

  const handlePrint = async () => {
    if (!printId) {
      setMessage("Receipt is not found");
      setType("error");
      return;
    }
    const id = printId;
    console.log("Handle  Print is called", id);
    setPrint(true);

    const data = {
      id: id,
      school: receiptDetails[0].school,
    };

    window.open(
      `/RazorPrint?data=${encodeURIComponent(JSON.stringify(data))}`,
      "_blank",
    );

    setPrint(false);
  };

  // const handlePrint = (id) => {
  //   setPrint(true);
  //   const url = `${window.location.origin}/school/ReceiptPrint_MMS?id=${id}`;
  //   window.open(url, "_blank");
  //   setPrint(false);
  // };

  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
    // 🔥 reset Autocomplete values
    setSelectedClass(null);
    setSelectedSection(null);
    setSelectedStudent(null);
    setSelectedSalesinvoice(null);
    setSelectedYear(null);
    setIsDataValid(true);

    // 🔥 reset Autocomplete values
    clearReceiptDetails();
  };

  const clearForm = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
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
    receiptDate: new Date().toISOString().split("T")[0],
    receiptNumber: "",
    receiptTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    paymentMethod: "upi",
    status: "valid",
    remarks: "",
    year: new Date().getFullYear(),
    academicyear: "",
    school: "",
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
    onSubmit: async (values) => {
      setIsPaymentDone(false);
      if (receiptDetails.length == 0) {
        setDataError("Receipt Details is missing");
        setIsDataValid(false);
        return;
      }

      if (hasDuplicateInvoice(receiptDetails)) {
        setDataError("Duplicate invoice selected. Please remove duplicates.");
        setIsDataValid(false);
        return;
      }

      let hasInvalidRow = false;
      let student_name = "";
      let paidAmount = 0;
      for (const item of receiptDetails) {
        if (item.invAmount === 0 || item.paidAmount === 0) {
          setDataError("invAmount and paidAmount must be greater than 0");
          hasInvalidRow = true;
          break; // exit loop when condition met
        }
        if (student_name) {
          student_name = student_name + "," + item.student_name;
        } else {
          student_name = item.student_name;
        }

        console.log(item);
        paidAmount += item?.paidAmount ?? 0;
      }
      if (hasInvalidRow) {
        setIsDataValid(false);
        return;
      }

      setIsDataValid(true);

      const payload = {
        ...values,
        student_name: student_name,
        paidAmount: paidAmount,
        method: values?.paymentMethod ?? "upi",
        receiptDetails: receiptDetails.map((row) => ({
          school: row.school,
          school_name: row.school_name,
          school_url: row.school_url,
          class: row.class,
          section: row.section,
          student: row.student,
          parent: row.parent,
          parent_name: row.parent_name,
          parent_phoneno: row.parent_phoneno,
          parent_email: row.parent_email,
          parent_address: row.parent_address,
          siId: row.siId,
          siCode: row.siCode,
          invAmount: row.invAmount,
          paidAmount: row.paidAmount,
          remarks: "",
          year: values.year,
          month: row?.month,
          monthname: row?.monthname,
        })),
      };

      if (values?.paymentMethod != "cash") {
        const parent_name = receiptDetails[0].parent_name;
        const parent_phoneno = receiptDetails[0]?.parent_phoneno ?? "99999999";
        const parent_email =
          receiptDetails[0]?.parent_email ?? "parent@gmail.com";
        const parent_address =
          receiptDetails[0]?.parent_address ?? "parent_address";

        axios
          .post(`${baseUrl}/razorpay/razororder`, payload)
          .then((respOrder) => {
            console.log("Response after submitting admin casting", respOrder);
            payload.order_id = respOrder.data?.data?.id ?? null;
            payload.payment_id = respOrder.data?.data?.id ?? null;

            var options = {
              key: respOrder.data?.data?.RAZORPAY_KEY_ID, //"rzp_test_TtDwiBiRGLDzbB", // Enter the Key ID generated from the Dashboard
              amount: payload.paidAmount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
              currency: "INR",
              name: respOrder.data?.data?.name, //"Acme Corp", //your business name
              description: respOrder.data?.data?.description, //"Test Transaction",
              image: respOrder.data?.data?.image, //"https://example.com/your_logo",
              order_id: payload.order_id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
              handler: async function (response) {
                const body = {
                  ...response,
                  school: receiptDetails[0].school,
                };

                axios
                  .post(`${baseUrl}/razorpay/razorvalidate`, body)
                  .then((validateRes) => {
                    console.log(
                      "Response after submitting admin casting",
                      validateRes,
                    );
                    payload.order_id = validateRes?.data?.orderId ?? null;
                    payload.payment_id = validateRes?.data?.paymentId ?? null;

                    axios
                      .post(`${baseUrl}/razorpay/create`, payload)
                      .then((resp) => {
                        console.log(
                          "Response after submitting admin casting",
                          resp,
                        );
                        setPrintId(resp.data.data?._id);
                        clearForm();
                        cancelEdit();
                        setMessage(resp.data.message);
                        setType("success");
                        setIsPaymentDone(true);
                      })
                      .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");

                        console.log("Error, response admin casting calls", e);
                      });
                  })
                  .catch((e) => {
                    setMessage(e.response.data.message);
                    setType("error");
                    console.log("Error, response admin casting calls", e);
                  });
              },
              prefill: {
                //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
                name: parent_name, //"Inspiration Innovations", //your customer's name
                email: parent_email, //"webdevmatrix@example.com",
                contact: parent_phoneno, //"9000000000", //Provide the customer's phone number for better conversion rates
              },
              notes: {
                address: parent_address, // "Razorpay Corporate Office",
              },
              theme: {
                color: "#3399cc",
              },
            };
            var rzp1 = new window.Razorpay(options);
            rzp1.on("payment.failed", function (response) {
              alert(response.error.code);
              alert(response.error.description);
              alert(response.error.source);
              alert(response.error.step);
              alert(response.error.reason);
              alert(response.error.metadata.order_id);
              alert(response.error.metadata.payment_id);
            });
            rzp1.open();
            // e.preventDefault();
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin casting calls", e);
          });
      }
    },
  });

  const [month, setMonth] = useState([]);
  const [year, setYear] = useState([]);

  const dycryptData = async () => {
    try {
      const payload = {
        invoiceList: invoiceList,
      };
      await axios
        .post(`${baseUrl}/razorpay/decryptdata`, payload)
        .then((resp) => {
          console.log("Response after submitting admin casting", resp);

          Formik.setFieldValue("receiptCode", "");
          Formik.setFieldValue("receiptNumber", resp.data.data[0].uniqueId);
          Formik.setFieldValue("year", resp.data.data[0].year);
          const matchedYear = years.find(
            (s) => s.value === resp.data.data[0].year,
          );
          setSelectedYear(matchedYear || null);

          Formik.setFieldValue(
            "paymentMethod",
            resp.data.data[0].paymentMethod,
          );
          Formik.setFieldValue("school", resp.data.data[0].school);
          setReceiptDetails(resp.data?.data ?? []);
        })
        .catch((e) => {
          setMessage(e.response.data.message);
          setType("error");
          console.log("Error, response admin casting calls", e);
        });
    } catch (error) {
      console.error("Error fetching students or checking attendance:", error);
    }
  };

  useEffect(() => {
    dycryptData();
  }, [message]);

  useEffect(() => {
    console.log("receiptDetails:", receiptDetails);
  }, [receiptDetails]);

  useEffect(() => {
    console.log("isDataValid:", isDataValid);
  }, [isDataValid]);

  const handleChange = (index, field, value) => {
    const updated = [...receiptDetails];
    updated[index][field] = value;

    if (field === "student") {
      updated[index].siId = null; // 👈 clears invoice
      updated[index].siCode = ""; // 👈 clears invoice
      updated[index].month = ""; // 👈 clears invoice
      updated[index].monthname = ""; // 👈 clears invoice
      updated[index].invAmount = 0;
      updated[index].paidAmount = 0;
      updated[index].parent = value?.parent?._id;
      setSalesinvoices([]); // 👈 clear old invoices
      setSelectedSalesinvoice(null); // 👈 clear Autocomplete text
    }

    if (field === "siId") {
      updated[index].class = updated[index].siId.class || null;
      updated[index].section = updated[index].siId.section || null;
      updated[index].month = updated[index].siId?.month || "";
      updated[index].monthname = updated[index].siId?.monthname || "";
      const invBal =
        (updated[index].siId.totalNetAmount || 0) -
        (updated[index].siId.totalPaidAmount || 0);
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
        {/* <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={isEdit ? "Edit Receipt" : "Create Receipt"} />
          </Tabs>
        </Box> */}

        <>
          {!isPaymentDone ? (
            <Box>
              {/* Create Receipt */}

              <Box component={"div"} sx={{}}>
                <Paper sx={{ padding: "20px", margin: "10px" }}>
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
                      Fees Payment
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
                          xs: "1fr", // mobile
                          md: "1fr 1fr", // desktop → 2 columns
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
                          disabled
                        />
                        {Formik.touched.receiptCode &&
                          Formik.errors.receiptCode && (
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
                          disabled
                        />
                        {Formik.touched.receiptDate &&
                          Formik.errors.receiptDate && (
                            <Typography color="error" variant="caption">
                              {Formik.errors.receiptDate}
                            </Typography>
                          )}
                      </Box>

                      {/* Receipt Number */}
                      <Box>
                        <TextField
                          fullWidth
                          label="Receipt Number"
                          variant="outlined"
                          name="receiptNumber"
                          value={Formik.values.receiptNumber}
                          onChange={Formik.handleChange}
                          onBlur={Formik.handleBlur}
                          disabled
                        />
                        {Formik.touched.receiptNumber &&
                          Formik.errors.receiptNumber && (
                            <Typography color="error" variant="caption">
                              {Formik.errors.receiptNumber}
                            </Typography>
                          )}
                      </Box>

                      {/* Academic Year */}
                      <Box>
                        <Autocomplete
                          disabled
                          options={years}
                          getOptionLabel={(option) => option.label}
                          value={selectedYear}
                          onChange={(event, newValue) => {
                            setSelectedYear(newValue);

                            Formik.setFieldValue(
                              "year",
                              newValue ? newValue.value : "",
                            );
                            Formik.setFieldValue(
                              "academicyear",
                              newValue ? newValue.label : "",
                            );
                          }}
                          onBlur={() => Formik.setFieldTouched("year", true)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Academic Year"
                              placeholder="Search year..."
                              fullWidth
                              error={
                                Formik.touched.year &&
                                Boolean(Formik.errors.year)
                              }
                              helperText={
                                Formik.touched.year && Formik.errors.year
                              }
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
                          disabled
                        >
                          <MenuItem value="">Select Payment Method</MenuItem>
                          <MenuItem value="netbanking">Net Banking</MenuItem>
                          <MenuItem value="card">Card</MenuItem>
                          <MenuItem value="upi">UPI</MenuItem>
                        </TextField>
                        {Formik.touched.paymentMethod &&
                          Formik.errors.paymentMethod && (
                            <p
                              style={{
                                color: "red",
                                textTransform: "capitalize",
                              }}
                            >
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
                          <p
                            style={{
                              color: "red",
                              textTransform: "capitalize",
                            }}
                          >
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
                      ></Box>

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

                          <Box>
                            <TextField
                              fullWidth
                              label="Student Name"
                              variant="outlined"
                              name="student_name"
                              value={row?.student_name}
                              disabled
                            />
                          </Box>

                          <Box>
                            <TextField
                              fullWidth
                              label="SI Code"
                              variant="outlined"
                              name="siCode"
                              value={row?.siCode}
                              disabled
                            />
                          </Box>

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
                          <TextField
                            fullWidth
                            label="paidAmount"
                            variant="outlined"
                            name="paidAmount"
                            type="number"
                            value={row.paidAmount}
                            inputProps={{ min: 0 }} // 👈 prevents negative via arrows
                            onChange={(e) => {
                              const value = Math.max(
                                0,
                                Number(e.target.value || 0),
                              );
                              handleChange(index, "paidAmount", value);
                            }}
                            disabled
                          />
                        </Box>
                      ))}
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
                        Pay Now
                      </Button>

                      <Button variant="outlined" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                minHeight: "300px",
                textAlign: "center",
              }}
            >
              <Typography variant="h4" color="success.main" fontWeight="bold">
                Payment Done
              </Typography>

              <Typography variant="body1" sx={{ mt: 2 }}>
                Your payment has been successfully completed.
              </Typography>
              <Button variant="outlined" onClick={handlePrint}>
                Print
              </Button>
            </Box>
          )}
        </>
      </Box>
    </>
  );
}
