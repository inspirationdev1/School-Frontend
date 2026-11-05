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
  Select,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Autocomplete,
  Tabs,
  Tab,
} from "@mui/material";
// import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem, Alert, FormControl, InputLabel, Autocomplete, TextField, Box } from '@mui/material';
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { purchaseinvoiceSchema } from "../../../yupSchema/purchaseinvoiceSchema";
import PurchaseinvoicePrint from "./PurchaseinvoicePrint";

export default function Purchaseinvoice() {
  const [isDataValid, setIsDataValid] = useState(true);
  const [dataError, setDataError] = useState("");
  const [purchaseinvoices, setPurchaseinvoices] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [date, setDate] = useState(new Date());

  const [isPrint, setPrint] = useState(false);
  const [printId, setPrintId] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [appsettings, setAppsettings] = useState([]);
  const [selectedAppsetting, setSelectedAppsetting] = useState(null);

  const [loading, setLoading] = useState(true);
  const [attendeeClass, setAttendeeClass] = useState([]);
  const [geolocation, setGeolocation] = useState([]);
  const [selectedGeolocation, setSelectedGeolocation] = useState(null);
  const [item, setItem] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [allItem, setAllItem] = useState([]);
  const [tab, setTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [params, setParams] = useState({});

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}-${year + 1}`, value: year };
  });

  const months = Array.from({ length: 12 }, (_, i) => {
    const monthName = new Date(2025, i).toLocaleString("default", {
      month: "long",
    });

    return {
      label: monthName,
      value: i + 1,
    };
  });

  const [invoiceDetails, setInvoiceDetails] = useState([
    {
      item: null,
      purchase_price: 0,
      quantity: 1,
      grossAmount: 0,
      discountType: "none", // ✅ default
      discountMonth: 0,
      discountPer: 0,
      discountAmount: 0,
      netAmount: 0,
      taxrate: null,
      taxtype: "",
      tax_percent: 0,
      tax_amount: 0,
      taxable_amount: 0,
      remarks: "",
      isEdit: false,
    },
  ]);

  const clearInvoiceDetails = () => {
    setInvoiceDetails([
      {
        item: null,
        purchase_price: 0,
        quantity: 1,
        grossAmount: 0,
        discountType: "none", // ✅ default
        discountMonth: 0,
        discountPer: 0,
        discountAmount: 0,
        netAmount: 0,
        taxrate: null,
        taxtype: "",
        tax_percent: 0,
        tax_amount: 0,
        taxable_amount: 0,
        remarks: "",
        year: "",
      },
    ]);
    console.log("invoiceDetails", invoiceDetails);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/purchaseinvoice/delete/${id}`)
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
    axios
      .get(`${baseUrl}/purchaseinvoice/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("piCode", resp.data.data.piCode);
        Formik.setFieldValue(
          "invoiceDate",
          resp.data.data.invoiceDate
            ? dayjs(resp.data.data.invoiceDate).format("YYYY-MM-DD")
            : "",
        );
        Formik.setFieldValue(
          "invoiceTime",
          dayjs().format("YYYY-MM-DD HH:mm:ss"),
        );
        // Formik.setFieldValue("geolocation", resp.data.data.geolocation);
        Formik.setFieldValue("supplier", resp.data.data.supplier);
        Formik.setFieldValue("supplier_name", resp.data.data?.supplier_name);
        Formik.setFieldValue("status", resp.data.data.status);
        Formik.setFieldValue("year", resp.data.data.year);

        const matchedYear = years.find((s) => s.value === resp.data.data.year);
        setSelectedYear(matchedYear || null);

        Formik.setFieldValue("month", resp.data.data?.month || 1);
        Formik.setFieldValue(
          "monthname",
          resp.data.data?.monthname || "January",
        );
        const matchedMonth = months.find(
          (s) => s.value === resp.data.data?.month || 1,
        );
        setSelectedMonth(matchedMonth || null);

        Formik.setFieldValue("remarks", resp.data.data.remarks);
        // const geolocationId =
        //   resp.data.data?.geolocation || resp.data.geolocation;
        const supplierId = resp.data.data?.supplier || resp.data.supplier;
        // const matchedGeolocation = geolocation.find(
        //   (s) => s._id === geolocationId,
        // );
        const matchedSupplier = suppliers.find((s) => s._id === supplierId);

        // setSelectedGeolocation(matchedGeolocation || null);
        setSelectedSupplier(matchedSupplier || null);
        setEditId(resp.data.data._id);

        const editInvoiceDetails = resp.data.data.invoiceDetails.map((row) => ({
          ...row,
          item: allItem.find((f) => f._id === row.item) || null,
          isEdit: true,
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

    const data = {
      id: id,
    };

    window.open(
      `/company/PurchaseinvoicePrint?data=${encodeURIComponent(JSON.stringify(data))}`,
      "_blank",
    );

    // window.open(`/company/PurchaseinvoicePrint?id=${id}`,
    //   '_blank');
    setPrint(false);
  };

  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
    // 🔥 reset Autocomplete values
    // setSelectedGeolocation(null);
    setSelectedSupplier(null);
    setIsDataValid(true);
    // 🔥 reset Autocomplete values
    clearInvoiceDetails();
  };

  const clearForm = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
    // 🔥 reset Autocomplete values
    // setSelectedGeolocation(null);
    setSelectedSupplier(null);
    clearInvoiceDetails();
  };

  //   MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const resetMessage = () => {
    setMessage("");
  };

  const initialValues = {
    piCode: "",
    invoiceDate: "",
    invoiceTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    geolocation: null,
    supplier: "",
    supplier_name: "",
    status: "valid",
    remarks: "",
    month: "",
    monthname: "",
    year: "",
  };
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: purchaseinvoiceSchema,
    onSubmit: (values) => {
      if (invoiceDetails.length == 0) {
        setDataError("Invoice Details is missing");
        setIsDataValid(false);
        return;
      }

      let hasInvalidRow = false;

      for (const item of invoiceDetails) {
        if (item.item === undefined || item.item === "" || item.item === null) {
          setDataError("Select item");
          hasInvalidRow = true;
          break; // exit loop when condition met
        }

        if (
          item.discountType === undefined ||
          item.discountType === "" ||
          item.discountType === null
        ) {
          setDataError("Select discountType");
          hasInvalidRow = true;
          break; // exit loop when condition met
        }

        if (item.grossAmount === 0) {
          setDataError("grossAmount must be greater than 0");
          hasInvalidRow = true;
          break; // exit loop when condition met
        }

        if (item.discountAmount > 0) {
          console.log("selectedAppsetting", selectedAppsetting);
          const grossAmount = item?.grossAmount || 0;
          const discountAmount = item?.discountAmount || 0;
          const discPer = Math.round((discountAmount * 100) / grossAmount);
          const discPerAllowed = selectedAppsetting?.discPerAllowed || 100;
          if (discPer > discPerAllowed) {
            setDataError("grossPer cannot be greater than discPerAllowed");
            hasInvalidRow = true;
            break; // exit loop when condition met
          }
        }

        const netAmount = item?.netAmount || 0;
        const tax_percent = item?.tax_percent || 0;
        const taxable_amount = Number(
          (netAmount / (1 + tax_percent / 100)).toFixed(0),
        );
        const tax_amount = Number((netAmount - taxable_amount).toFixed(0));
        item.tax_amount = tax_amount;
        item.taxable_amount = taxable_amount;

        console.log(item);
      }

      if (hasInvalidRow) {
        // setDataError('Invoice Details is missing');
        setIsDataValid(false);
        return;
      }

      const hasDuplicate =
        new Set(invoiceDetails.map((d) => d.item?._id.toString())).size !==
        invoiceDetails.length;
      console.log(hasDuplicate); // true
      if (hasDuplicate) {
        setIsDataValid(false);
        setDataError("Fee Item selection is duplicated");
        return;
      }

      setIsDataValid(true);

      const payload = {
        ...values,
        invoiceDetails: invoiceDetails.map((row) => ({
          item: row.item?._id, // 👈 convert here
          item_name: row.item?.item?.name, // 👈 convert here
          quantity: row?.quantity || 1,
          purchase_price: row?.purchase_price,
          grossAmount: row.grossAmount,
          discountType: row.discountType,
          discountMonth: row.discountMonth,
          discountPer: row.discountPer,
          discountAmount: row.discountAmount,
          netAmount: row.netAmount,
          taxtype: row?.taxtype || "inclusive",
          tax_percent: row?.tax_percent || 0,
          tax_amount: row?.tax_amount || 0,
          taxable_amount: row?.taxable_amount || 0,
          taxrate: row?.taxrate || null,
          remarks: "",
          supplier: values.supplier,
          year: values.year,
          month: values?.month || 1,
          monthname: values?.monthname || "January",
        })),
      };
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/purchaseinvoice/update/${editId}`, payload)
          .then((resp) => {
            console.log("Edit submit", resp);
            setMessage(resp.data.message);
            setType("success");
            setParams({});
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
          .post(`${baseUrl}/purchaseinvoice/create`, payload)
          .then((resp) => {
            console.log("Response after submitting admin casting", resp);
            setMessage(resp.data.message);
            setType("success");
            setParams({});
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

  const fetchpurchaseinvoice = () => {
    axios
      .get(`${baseUrl}/purchaseinvoice/fetch-with-query`, { params })
      .then((resp) => {
        setPurchaseinvoices(resp.data.data);
      })
      .catch(() => console.log("Error in fetching purchaseinvoices data"));
  };
  const fetchAppsettings = () => {
    axios
      .get(`${baseUrl}/appsetting/fetch-all`)
      .then((resp) => {
        console.log("Fetching data in  Casting Calls  admin.", resp);
        setAppsettings(resp.data.data);
        const id = resp.data.data[0]._id;
        setSelectedAppsetting(resp.data.data[0]);
        console.log("selectedAppseting", selectedAppsetting);
      })
      .catch((e) => {
        console.log("Error in fetching casting calls admin data", e);
      });
  };

  // const fetchGeolocation = async () => {
  //   try {
  //     const geolocations = await axios.get(`${baseUrl}/geolocation/fetch-all`);
  //     console.log("geolocations", geolocations);
  //     setGeolocation(geolocations.data.data);
  //   } catch (error) {
  //     console.error("Error fetching suppliers or checking attendance:", error);
  //   }
  // };

  const fetchSuppliers = async () => {
    try {
      const suppliersResponse = await axios.get(
        `${baseUrl}/supplier/fetch-with-query`,
        {
          params: {},
        },
      );
      setSuppliers(suppliersResponse.data.data);
    } catch (error) {
      console.error("Error fetching suppliers or checking attendance:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const itemResponse = await axios.get(`${baseUrl}/item/fetch-with-query`, {
        params: {},
      });
      setItem(itemResponse.data.data);
    } catch (error) {
      console.error("Error fetching suppliers or checking attendance:", error);
    }
  };

  const fetchAllItems = async () => {
    try {
      const allItemResponse = await axios.get(`${baseUrl}/item/fetch-all`); // Fetch All Items
      setAllItem(allItemResponse.data.data);
    } catch (error) {
      console.error("Error fetching suppliers or checking attendance:", error);
    }
  };

  useEffect(() => {
    fetchAppsettings();
    fetchpurchaseinvoice();

    // fetchGeolocation();
    fetchAllItems();
  }, [message, params]);

  useEffect(() => {
    fetchSuppliers();
  }, [selectedGeolocation]);

  useEffect(() => {
    console.log("invoiceDetails:", invoiceDetails);
  }, [invoiceDetails]);

  useEffect(() => {
    console.log("isDataValid:", isDataValid);
  }, [isDataValid]);

  const handleChange = (index, field, value) => {
    try {
      const updated = [...invoiceDetails];
      const row = { ...updated[index] };

      // Update the changed field
      row[field] = value;

      // Convert numeric fields to numbers
      if (
        [
          "quantity",
          "purchase_price",
          "grossAmount",
          "discountPer",
          "discountAmount",
        ].includes(field)
      ) {
        row[field] = value === "" ? 0 : Number(value);
      }

      // When selecting an item
      if (field === "item") {
        if (value) {
          row.item = value;
          row.purchase_price = Number(value.purchase_price) || 0;
          row.quantity = 1;

          row.taxrate = value.taxrate || null;
          row.taxtype = value.taxtype || "inclusive";
          row.tax_percent = Number(value.tax_percent) || 0;
        } else {
          row.item = null;
          row.purchase_price = 0;
          row.quantity = 1;
          row.taxrate = null;
          row.taxtype = "";
          row.tax_percent = 0;
        }

        row.discountPer = 0;
        row.discountAmount = 0;
        row.discountMonth = 0;
        row.discountType = "none";
      }

      // Calculate Gross Amount = Quantity × Price
      if (
        field === "quantity" ||
        field === "purchase_price" ||
        field === "item"
      ) {
        row.grossAmount = Number(
          (
            (Number(row.quantity) || 0) * (Number(row.purchase_price) || 0)
          ).toFixed(2),
        );
      }

      // Calculate discount amount from percentage
      if (field === "discountPer") {
        row.discountAmount = Number(
          ((Number(row.grossAmount) * Number(row.discountPer)) / 100).toFixed(
            2,
          ),
        );
      }

      // Calculate discount percentage from amount
      if (field === "discountAmount") {
        row.discountPer =
          Number(row.grossAmount) > 0
            ? Number(
                (
                  (Number(row.discountAmount) / Number(row.grossAmount)) *
                  100
                ).toFixed(2),
              )
            : 0;
      }

      // Reset discount when discount type changes
      if (field === "discountType") {
        row.discountPer = 0;
        row.discountAmount = 0;
        row.discountMonth = 0;
      }

      // Ensure discount is within the gross amount
      row.discountAmount = Math.min(
        Math.max(Number(row.discountAmount) || 0, 0),
        Number(row.grossAmount) || 0,
      );

      // Calculate Net Amount before tax
      const amountAfterDiscount =
        (Number(row.grossAmount) || 0) - (Number(row.discountAmount) || 0);

      const taxPercent = Number(row.tax_percent) || 0;
      const taxType = row.taxtype || "inclusive";

      let taxableAmount = amountAfterDiscount;
      let taxAmount = 0;
      let netAmount = amountAfterDiscount;

      if (taxType === "inclusive") {
        taxableAmount = Number(
          (amountAfterDiscount / (1 + taxPercent / 100)).toFixed(2),
        );

        taxAmount = Number((amountAfterDiscount - taxableAmount).toFixed(2));
      } else if (taxType === "exclusive") {
        taxableAmount = amountAfterDiscount;

        taxAmount = Number(((taxableAmount * taxPercent) / 100).toFixed(2));

        netAmount = Number((taxableAmount + taxAmount).toFixed(2));
      }

      row.taxable_amount = taxableAmount;
      row.tax_amount = taxAmount;
      row.netAmount = Number(netAmount.toFixed(2));

      updated[index] = row;
      setInvoiceDetails(updated);
    } catch (error) {
      console.error("Error in handleChange:", error);
    }
  };

  const addRow = () => {
    setInvoiceDetails([
      ...invoiceDetails,
      {
        item: null,
        purchase_price: 0,
        quantity: 1,
        grossAmount: 0,
        discountType: "none", // ✅ default
        discountMonth: 0,
        discountPer: 0,
        discountAmount: 0,
        netAmount: 0,
        taxrate: null,
        taxtype: "",
        tax_percent: 0,
        tax_amount: 0,
        taxable_amount: 0,
        remarks: "",
      },
    ]);
  };

  const removeRow = (index) => {
    setInvoiceDetails(invoiceDetails.filter((_, i) => i !== index));
    console.log(invoiceDetails);
  };

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
            <Tab
              label={
                isEdit ? "Edit Purchase Invoice" : "Create Purchase Invoice"
              }
            />
            <Tab label="View List" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Box>
            <Box component={"div"} sx={{}}>
              <Paper sx={{ padding: "20px", margin: "10px" }}>
                {isEdit ? (
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "800", textAlign: "center" }}
                  >
                    Edit Purchase Inovoice
                  </Typography>
                ) : (
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "800", textAlign: "center" }}
                  >
                    Add Purchase Invoice
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
                    {/* Purchaseinvoice Code */}
                    <Box>
                      <TextField
                        fullWidth
                        label="Invoice Code"
                        variant="outlined"
                        name="piCode"
                        value={Formik.values.piCode}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        disabled
                      />
                      {/* {Formik.touched.piCode && Formik.errors.piCode && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.piCode}
                        </Typography>
                      )} */}
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
                      {Formik.touched.invoiceDate &&
                        Formik.errors.invoiceDate && (
                          <Typography color="error" variant="caption">
                            {Formik.errors.invoiceDate}
                          </Typography>
                        )}
                    </Box>

                    {/* geolocation */}

                    {/* <Box>
                      <Autocomplete
                        disabled={isEdit}
                        options={geolocation}
                        getOptionLabel={(option) => option.geolocation_name}
                        value={selectedGeolocation}
                        onChange={(event, newValue) => {
                          setSelectedGeolocation(newValue);
                          Formik.setFieldValue(
                            "geolocation",
                            newValue ? newValue._id : "",
                          );
                        }}
                        onBlur={() =>
                          Formik.setFieldTouched("geolocation", true)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Geolocation"
                            placeholder="Search geolocation..."
                            fullWidth
                            error={
                              Formik.touched.geolocation &&
                              Boolean(Formik.errors.geolocation)
                            }
                            helperText={
                              Formik.touched.geolocation &&
                              Formik.errors.geolocation
                            }
                          />
                        )}
                      />
                    </Box> */}

                    {/* Supplier */}

                    <Box>
                      <Autocomplete
                        disabled={isEdit}
                        options={suppliers}
                        getOptionLabel={(option) => option.name}
                        value={selectedSupplier}
                        onChange={(event, newValue) => {
                          setSelectedSupplier(newValue);

                          Formik.setFieldValue(
                            "supplier",
                            newValue ? newValue._id : "",
                          );
                          Formik.setFieldValue(
                            "supplier_name",
                            newValue ? newValue.name : "",
                          );
                        }}
                        onBlur={() => Formik.setFieldTouched("supplier", true)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Supplier"
                            placeholder="Search supplier..."
                            fullWidth
                            error={
                              Formik.touched.supplier &&
                              Boolean(Formik.errors.supplier)
                            }
                            helperText={
                              Formik.touched.supplier && Formik.errors.supplier
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
                          style={{ color: "red", textTransform: "capitalize" }}
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
                    ></Box>

                    {/* Rows */}
                    {invoiceDetails.map((row, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            "2.5fr 1fr 1fr 1fr 1fr 1fr 1fr 0.5fr",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Autocomplete
                            disabled={row.isEdit}
                            options={allItem}
                            getOptionLabel={(option) => option?.name || ""}
                            isOptionEqualToValue={(option, value) =>
                              option._id === value?._id
                            }
                            value={row.item}
                            onChange={(event, newValue) => {
                              handleChange(index, "item", newValue);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Item"
                                placeholder="Search Item..."
                                fullWidth
                              />
                            )}
                          />
                        </Box>

                        {/* quantity */}
                        <Box>
                          <TextField
                            fullWidth
                            label="Qty"
                            variant="outlined"
                            name="quantity"
                            type="number"
                            value={row.quantity}
                            onChange={(e) =>
                              handleChange(index, "quantity", e.target.value)
                            }
                          />
                        </Box>

                        {/* purchase_price */}
                        <Box>
                          <TextField
                            fullWidth
                            label="Price"
                            variant="outlined"
                            name="purchase_price"
                            type="number"
                            value={row.purchase_price}
                            onChange={(e) =>
                              handleChange(
                                index,
                                "purchase_price",
                                e.target.value,
                              )
                            }
                          />
                        </Box>

                        {/* grossAmount */}
                        <TextField
                          fullWidth
                          label="Gross Amount"
                          variant="outlined"
                          name="grossAmount"
                          type="number"
                          value={row.grossAmount}
                          InputProps={{ readOnly: true }}
                        />

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
                              handleChange(
                                index,
                                "discountType",
                                e.target.value,
                              )
                            }
                            disabled={row.isEdit}
                          >
                            <MenuItem value="">Select discountType</MenuItem>
                            <MenuItem value="none">None</MenuItem>
                            <MenuItem value="discountPer">Disc %</MenuItem>
                            <MenuItem value="discountAmount">
                              Disc Amount
                            </MenuItem>
                          </TextField>
                        </Box>

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
                                handleChange(
                                  index,
                                  "discountPer",
                                  e.target.value,
                                )
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
                              handleChange(
                                index,
                                "discountAmount",
                                e.target.value,
                              )
                            }
                            disabled={
                              row.isEdit ||
                              row.discountType === "discountPer" ||
                              row.discountType === "none" ||
                              row.discountType === ""
                            }
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
                label="Search Name .."
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
            <Box>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      {/* <TableCell component="th" scope="row"> purchaseinvoice</TableCell> */}
                      <TableCell align="right">Invoice Code</TableCell>
                      <TableCell align="right">Invoice Date</TableCell>
                      <TableCell align="right">Supplier</TableCell>
                      <TableCell align="right">Remarks</TableCell>
                      <TableCell align="right">Status</TableCell>
                      {/* <TableCell align="right">Payment Status</TableCell> */}
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseinvoices.map((value, i) => (
                      <TableRow
                        key={i}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {value.piCode}
                        </TableCell>
                        <TableCell align="right">
                          {dayjs(value.invoiceDate).format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell align="right">
                          {value?.supplier?.name}
                        </TableCell>
                        <TableCell align="right">{value.remarks}</TableCell>
                        <TableCell align="right">{value.status}</TableCell>
                        {/* <TableCell align="right">{value.paymentStatus}</TableCell> */}
                        <TableCell align="right">
                          {" "}
                          <Box
                            component={"div"}
                            sx={{
                              bottom: 0,
                              display: "flex",
                              justifyContent: "end",
                            }}
                          >
                            <Box
                              component="div"
                              sx={{
                                display: "flex",
                                justifyContent: "end",
                                gap: 1.5, // 👈 adds space between buttons
                              }}
                            >
                              {value.status === "valid" && (
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
                                    sx={{
                                      background: "gold",
                                      color: "#222222",
                                    }}
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
