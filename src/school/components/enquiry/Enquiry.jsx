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

import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState, useContext } from "react";
import axios from "axios";

import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { enquirySchema } from "../../../yupSchema/enquirySchema";
import EnquiryPrint from "./EnquiryPrint";
import { AuthContext } from "../../../context/AuthContext";

import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function Enquiry() {
  const { authenticated, user } = useContext(AuthContext);

  // ============================================================
  // STATE
  // ============================================================

  const [isDataValid, setIsDataValid] = useState(true);
  const [dataError, setDataError] = useState("");

  const [studentEnquiry, setStudentEnquiry] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");

  const [isPrint, setPrint] = useState(false);
  const [printId, setPrintId] = useState(null);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);

  const [previousschools, setPreviousschools] = useState([]);
  const [selectedPreviousschool, setSelectedPreviousschool] = useState(null);

  const [tab, setTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);

  // ============================================================
  // ACADEMIC YEARS
  // ============================================================

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;

    return {
      label: `${year}-${year + 1}`,
      value: year,
    };
  });

  // ============================================================
  // ENQUIRY DETAILS
  // ============================================================

  const createEmptyEnquiryDetail = () => ({
    class: null,
    child_name: "",
    child_dob: dayjs(),
    previousschool: null,
    previousschool_name: "",
    board: null,
    remarks: "",
    isEdit: false,
  });

  const [enquiryDetails, setEnquiryDetails] = useState([
    createEmptyEnquiryDetail(),
  ]);

  // ============================================================
  // MESSAGE
  // ============================================================

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  // ============================================================
  // INITIAL FORM VALUES
  // ============================================================

  const initialValues = {
    enquiry_code: "",
    enquiry_name: "",
    enquiry_date: dayjs().format("YYYY-MM-DD"),
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

  // ============================================================
  // CLEAR ENQUIRY DETAILS
  // ============================================================

  const clearEnquiryDetails = () => {
    setEnquiryDetails([createEmptyEnquiryDetail()]);
  };

  // ============================================================
  // CLEAR FORM
  // ============================================================

  const clearForm = () => {
    setEdit(false);
    setEditId(null);

    Formik.resetForm();

    setSelectedClass(null);
    setSelectedBoard(null);
    setSelectedPreviousschool(null);
    setSelectedYear(null);

    setIsDataValid(true);
    setDataError("");

    clearEnquiryDetails();
  };

  // ============================================================
  // CANCEL EDIT
  // ============================================================

  const cancelEdit = () => {
    clearForm();
    setTab(1);
  };

  // ============================================================
  // FETCH ALL ENQUIRIES
  // ============================================================

  const fetchstudentsenquiry = async () => {
    try {
      const resp = await axios.get(`${baseUrl}/enquiry/fetch-all`);

      console.log("Fetched enquiry data:", resp.data);

      setStudentEnquiry(resp.data.data || []);
    } catch (e) {
      console.log("Error in fetching enquiry data:", e);

      setMessage(e.response?.data?.message || "Error fetching enquiry data");
      setType("error");
    }
  };

  // ============================================================
  // FETCH CLASSES
  // ============================================================

  const fetchClass = async () => {
    try {
      const classData = await axios.get(`${baseUrl}/class/fetch-all`);

      console.log("Classes:", classData.data);

      setClasses(classData.data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  // ============================================================
  // FETCH BOARDS
  // ============================================================

  const fetchBoards = async () => {
    try {
      const params = {
        generalmaster_type: "board",
      };

      const resp = await axios.get(
        `${baseUrl}/generalmaster/fetch-with-query`,
        {
          params,
        },
      );

      console.log("Boards:", resp.data);

      setBoards(resp.data.data || []);
    } catch (e) {
      console.log("Error in fetching boards:", e);
    }
  };

  // ============================================================
  // FETCH PREVIOUS SCHOOLS
  // ============================================================

  const fetchpreviousschool = async () => {
    try {
      const params = {
        generalmaster_type: "previousschool",
      };

      const resp = await axios.get(
        `${baseUrl}/generalmaster/fetch-with-query`,
        {
          params,
        },
      );

      console.log("Previous schools:", resp.data);

      setPreviousschools(resp.data.data || []);
    } catch (e) {
      console.log("Error in fetching previous schools:", e);
    }
  };

  // ============================================================
  // INITIAL DATA FETCH
  // ============================================================

  useEffect(() => {
    fetchstudentsenquiry();
    fetchClass();
    fetchBoards();
    fetchpreviousschool();
  }, []);

  // ============================================================
  // HANDLE DELETE
  // ============================================================

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) {
      return;
    }

    try {
      const resp = await axios.delete(`${baseUrl}/enquiry/delete/${id}`);

      setMessage(resp.data.message);
      setType("success");

      // Refresh enquiry list
      fetchstudentsenquiry();
    } catch (e) {
      setMessage(e.response?.data?.message || "Error deleting enquiry");

      setType("error");

      console.log("Error deleting enquiry:", e);
    }
  };

  // ============================================================
  // HANDLE EDIT
  // ============================================================

  const handleEdit = async (id) => {
    try {
      console.log("Handle Edit called:", id);

      const resp = await axios.get(`${baseUrl}/enquiry/fetch-single/${id}`);

      const data = resp.data.data;

      console.log("Edit enquiry data:", data);

      setEdit(true);
      setEditId(data._id);

      // --------------------------------------------------------
      // MAIN FORM
      // --------------------------------------------------------

      Formik.setFieldValue("enquiry_code", data.enquiry_code || "");

      Formik.setFieldValue("enquiry_name", data.enquiry_name || "");

      Formik.setFieldValue(
        "enquiry_date",
        data.enquiry_date ? dayjs(data.enquiry_date).format("YYYY-MM-DD") : "",
      );

      Formik.setFieldValue(
        "enquiry_time",
        data.enquiry_time || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      );

      Formik.setFieldValue("father_name", data.father_name || "");

      Formik.setFieldValue("father_occupation", data.father_occupation || "");

      Formik.setFieldValue("father_phoneno", data.father_phoneno || "");

      Formik.setFieldValue("father_email", data.father_email || "");

      Formik.setFieldValue("mother_name", data.mother_name || "");

      Formik.setFieldValue("mother_occupation", data.mother_occupation || "");

      Formik.setFieldValue("mother_phoneno", data.mother_phoneno || "");

      Formik.setFieldValue("mother_email", data.mother_email || "");

      Formik.setFieldValue("address", data.address || "");

      Formik.setFieldValue("status", data.status || "valid");

      Formik.setFieldValue("remarks", data.remarks || "");

      Formik.setFieldValue("year", data.year || "");

      // --------------------------------------------------------
      // YEAR AUTOCOMPLETE
      // --------------------------------------------------------

      const matchedYear = years.find((item) => item.value === data.year);

      setSelectedYear(matchedYear || null);

      // --------------------------------------------------------
      // ENQUIRY DETAILS
      // --------------------------------------------------------

      const editEnquiryDetails = (data.enquiryDetails || []).map((row) => ({
        ...row,

        class: row.class && typeof row.class === "object" ? row.class : null,

        board: row.board && typeof row.board === "object" ? row.board : null,

        previousschool:
          row.previousschool && typeof row.previousschool === "object"
            ? row.previousschool
            : null,

        child_name: row.child_name || "",

        child_dob: row.child_dob ? dayjs(row.child_dob) : null,

        previousschool_name: row.previousschool_name || "",

        remarks: row.remarks || "",

        isEdit: true,
      }));

      setEnquiryDetails(editEnquiryDetails);

      setIsDataValid(true);
      setDataError("");

      // Open edit tab
      setTab(0);
    } catch (e) {
      console.log("Error in fetching edit enquiry data:", e);

      setMessage(e.response?.data?.message || "Error fetching enquiry data");

      setType("error");
    }
  };

  // ============================================================
  // HANDLE PRINT
  // ============================================================

  const handlePrint = async (id) => {
    console.log("Handle Print called:", id);

    setPrint(true);
    setPrintId(id);

    if (user?.role === "TEACHER") {
      window.open(`/teacher/EnquiryPrint?id=${id}`, "_blank");
    } else {
      window.open(`/school/EnquiryPrint?id=${id}`, "_blank");
    }

    setPrint(false);
  };

  // ============================================================
  // HANDLE SEARCH
  // ============================================================

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // ============================================================
  // FILTER ENQUIRIES
  // ============================================================

  const studentenquiry = studentEnquiry.filter((value) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      value.enquiry_code?.toLowerCase().includes(searchText) ||
      value.enquiry_name?.toLowerCase().includes(searchText) ||
      value.father_name?.toLowerCase().includes(searchText) ||
      value.father_phoneno?.toLowerCase().includes(searchText) ||
      value.mother_name?.toLowerCase().includes(searchText) ||
      value.mother_phoneno?.toLowerCase().includes(searchText) ||
      value.status?.toLowerCase().includes(searchText) ||
      value.remarks?.toLowerCase().includes(searchText)
    );
  });

  // ============================================================
  // HANDLE DETAIL ROW CHANGE
  // ============================================================

  const handleChange = (index, field, value) => {
    setEnquiryDetails((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  // ============================================================
  // ADD NEW DETAIL ROW
  // ============================================================

  const addRow = () => {
    setEnquiryDetails((previous) => [...previous, createEmptyEnquiryDetail()]);
  };

  // ============================================================
  // REMOVE DETAIL ROW
  // ============================================================

  const removeRow = (index) => {
    setEnquiryDetails((previous) => previous.filter((_, i) => i !== index));
  };

  // ============================================================
  // FORMIK
  // ============================================================

  const Formik = useFormik({
    initialValues,

    validationSchema: enquirySchema,

    onSubmit: async (values) => {
      // --------------------------------------------------------
      // RESET VALIDATION MESSAGE
      // --------------------------------------------------------

      setIsDataValid(true);
      setDataError("");

      // --------------------------------------------------------
      // CHECK DETAIL ROWS
      // --------------------------------------------------------

      if (enquiryDetails.length === 0) {
        setDataError("Enquiry Details is missing");
        setIsDataValid(false);
        return;
      }

      let hasInvalidRow = false;

      for (const item of enquiryDetails) {
        if (
          item.class === undefined ||
          item.class === null ||
          item.class === ""
        ) {
          setDataError("Select class");
          hasInvalidRow = true;
          break;
        }

        if (
          item.child_name === undefined ||
          item.child_name === null ||
          item.child_name.trim() === ""
        ) {
          setDataError("Enter child name");
          hasInvalidRow = true;
          break;
        }

        if (
          item.child_dob === undefined ||
          item.child_dob === null ||
          item.child_dob === ""
        ) {
          setDataError("Select child date of birth");
          hasInvalidRow = true;
          break;
        }

        if (
          item.board === undefined ||
          item.board === null ||
          item.board === ""
        ) {
          setDataError("Select Board");
          hasInvalidRow = true;
          break;
        }

        if (
          item.previousschool === undefined ||
          item.previousschool === null ||
          item.previousschool === ""
        ) {
          setDataError("Select previous school");
          hasInvalidRow = true;
          break;
        }
      }

      if (hasInvalidRow) {
        setIsDataValid(false);
        return;
      }

      // --------------------------------------------------------
      // CHECK DUPLICATE CLASS
      // --------------------------------------------------------

      const classIds = enquiryDetails
        .map((item) => item.class?._id)
        .filter(Boolean);

      const hasDuplicate = new Set(classIds).size !== classIds.length;

      if (hasDuplicate) {
        setIsDataValid(false);
        setDataError("Class selection is duplicated");
        return;
      }

      // --------------------------------------------------------
      // PAYLOAD
      // --------------------------------------------------------

      const payload = {
        ...values,

        enquiryDetails: enquiryDetails.map((row) => ({
          enquiry_date: values.enquiry_date,

          enquiry_time:
            values.enquiry_time || dayjs().format("YYYY-MM-DD HH:mm:ss"),

          class: row.class?._id || null,

          child_name: row.child_name,

          child_dob: row.child_dob
            ? dayjs(row.child_dob).format("YYYY-MM-DD")
            : null,

          previousschool: row.previousschool?._id || null,

          previousschool_name: row.previousschool_name || "",

          board: row.board?._id || null,

          remarks: row.remarks || "",

          year: values.year,
        })),
      };

      console.log("Submitting payload:", payload);

      // --------------------------------------------------------
      // UPDATE
      // --------------------------------------------------------

      if (isEdit) {
        try {
          const resp = await axios.patch(
            `${baseUrl}/enquiry/update/${editId}`,
            payload,
          );

          console.log("Update response:", resp);

          setMessage(resp.data.message);
          setType("success");

          await fetchstudentsenquiry();

          clearForm();

          setTab(1);
        } catch (e) {
          console.log("Error updating enquiry:", e);

          setMessage(e.response?.data?.message || "Error updating enquiry");

          setType("error");
        }

        return;
      }

      // --------------------------------------------------------
      // CREATE
      // --------------------------------------------------------

      try {
        const resp = await axios.post(`${baseUrl}/enquiry/create`, payload);

        console.log("Create response:", resp);

        setMessage(resp.data.message);
        setType("success");

        await fetchstudentsenquiry();

        clearForm();

        setTab(1);
      } catch (e) {
        console.log("Error creating enquiry:", e);

        setMessage(e.response?.data?.message || "Error creating enquiry");

        setType("error");
      }
    },
  });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ======================================================
          MESSAGE
      ====================================================== */}

      {message?.trim() && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      <Box>
        {/* ====================================================
            TABS
        ==================================================== */}

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 2,
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={isEdit ? "Edit Enquiry" : "Create Enquiry"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* ====================================================
            CREATE / EDIT TAB
        ==================================================== */}

        {tab === 0 && (
          <Box>
            <Paper
              sx={{
                padding: "20px",
                margin: "10px",
              }}
            >
              {/* ==================================================
                  TITLE
              ================================================== */}

              <Typography
                variant="h4"
                sx={{
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                {isEdit ? "Edit Enquiry" : "Add New Enquiry"}
              </Typography>

              {/* ==================================================
                  FORM
              ================================================== */}

              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                {/* ==================================================
                    MAIN FORM GRID
                ================================================== */}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1fr 1fr",
                    },
                    gap: 2,
                    mt: 2,
                  }}
                >
                  {/* ==================================================
                      ENQUIRY CODE
                  ================================================== */}

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

                    {Formik.touched.enquiry_code &&
                      Formik.errors.enquiry_code && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.enquiry_code}
                        </Typography>
                      )}
                  </Box>

                  {/* ==================================================
                      ENQUIRY NAME
                  ================================================== */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Enquiry Name"
                      variant="outlined"
                      name="enquiry_name"
                      value={Formik.values.enquiry_name}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.enquiry_name &&
                      Formik.errors.enquiry_name && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.enquiry_name}
                        </Typography>
                      )}
                  </Box>

                  {/* ==================================================
                      ENQUIRY DATE
                  ================================================== */}

                  <Box>
                    <TextField
                      name="enquiry_date"
                      label="Date"
                      type="date"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={Formik.values.enquiry_date}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      disabled={isEdit}
                    />

                    {Formik.touched.enquiry_date &&
                      Formik.errors.enquiry_date && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.enquiry_date}
                        </Typography>
                      )}
                  </Box>

                  {/* ==================================================
                      ACADEMIC YEAR
                  ================================================== */}

                  <Box>
                    <Autocomplete
                      options={years}
                      getOptionLabel={(option) => option?.label || ""}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value?.value
                      }
                      value={selectedYear}
                      onChange={(event, newValue) => {
                        setSelectedYear(newValue);

                        Formik.setFieldValue(
                          "year",
                          newValue ? newValue.value : "",
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
                            Formik.touched.year && Boolean(Formik.errors.year)
                          }
                          helperText={Formik.touched.year && Formik.errors.year}
                        />
                      )}
                    />
                  </Box>

                  {/* ==================================================
                      FATHER NAME
                  ================================================== */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Father Name"
                      variant="outlined"
                      name="father_name"
                      value={Formik.values.father_name}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.father_name &&
                      Formik.errors.father_name && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.father_name}
                        </Typography>
                      )}
                  </Box>

                  {/* ==================================================
                      FATHER OCCUPATION
                  ================================================== */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Father Occupation"
                      variant="outlined"
                      name="father_occupation"
                      value={Formik.values.father_occupation}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.father_occupation &&
                      Formik.errors.father_occupation && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.father_occupation}
                        </Typography>
                      )}
                  </Box>

                  {/* ==================================================
                      FATHER PHONE
                  ================================================== */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Father Phone No"
                      variant="outlined"
                      name="father_phoneno"
                      value={Formik.values.father_phoneno}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.father_phoneno &&
                      Formik.errors.father_phoneno && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.father_phoneno}
                        </Typography>
                      )}
                  </Box>

                  {/* ==================================================
                      FATHER EMAIL
                  ================================================== */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Father Email"
                      variant="outlined"
                      name="father_email"
                      value={Formik.values.father_email}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.father_email &&
                      Formik.errors.father_email && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.father_email}
                        </Typography>
                      )}
                  </Box>

                  {/* ==================================================
                      MOTHER NAME
                  ================================================== */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Mother Name"
                      variant="outlined"
                      name="mother_name"
                      value={Formik.values.mother_name}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.mother_name &&
                      Formik.errors.mother_name && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.mother_name}
                        </Typography>
                      )}
                  </Box>

                  {/* ==================================================
                      MOTHER OCCUPATION
                  ================================================== */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Mother Occupation"
                      variant="outlined"
                      name="mother_occupation"
                      value={Formik.values.mother_occupation}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.mother_occupation &&
                      Formik.errors.mother_occupation && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.mother_occupation}
                        </Typography>
                      )}
                  </Box>

                  {/* ==================================================
                      MOTHER PHONE
                  ================================================== */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Mother Phone No"
                      variant="outlined"
                      name="mother_phoneno"
                      value={Formik.values.mother_phoneno}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.mother_phoneno &&
                      Formik.errors.mother_phoneno && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.mother_phoneno}
                        </Typography>
                      )}
                  </Box>

                  {/* ==================================================
                      MOTHER EMAIL
                  ================================================== */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Mother Email"
                      variant="outlined"
                      name="mother_email"
                      value={Formik.values.mother_email}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.mother_email &&
                      Formik.errors.mother_email && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.mother_email}
                        </Typography>
                      )}
                  </Box>

                  {/* ==================================================
                      ADDRESS
                  ================================================== */}

                  <Box>
                    <TextField
                      fullWidth
                      label="Address"
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

                  {/* ==================================================
                      STATUS
                  ================================================== */}

                  <Box>
                    <FormControl fullWidth disabled>
                      <InputLabel>Status</InputLabel>

                      <Select
                        label="Status"
                        name="status"
                        value={Formik.values.status}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                      >
                        <MenuItem value="">Select Status</MenuItem>

                        <MenuItem value="valid">Valid</MenuItem>

                        <MenuItem value="cancel">Cancel</MenuItem>
                      </Select>
                    </FormControl>

                    {Formik.touched.status && Formik.errors.status && (
                      <Typography color="error" variant="caption">
                        {Formik.errors.status}
                      </Typography>
                    )}
                  </Box>

                  {/* ==================================================
                      REMARKS
                  ================================================== */}

                  <Box
                    sx={{
                      gridColumn: "1 / -1",
                    }}
                  >
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

                {/* ==================================================
                    ENQUIRY DETAILS
                ================================================== */}

                <Box sx={{ mt: 3 }}>
                  {!isDataValid && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {dataError}
                    </Alert>
                  )}

                  {/* ==================================================
                      DETAIL ROWS
                  ================================================== */}

                  <Box
                    sx={{
                      overflowX: "auto",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: "1100px",
                      }}
                    >
                      {enquiryDetails.map((row, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            gap: 1,
                            mb: 2,
                            alignItems: "flex-end",
                          }}
                        >
                          {/* ========================================
                                CLASS
                            ======================================== */}

                          <Box
                            sx={{
                              minWidth: 150,
                            }}
                          >
                            <Autocomplete
                              disabled={row.isEdit}
                              options={classes}
                              getOptionLabel={(option) =>
                                option?.class_name || ""
                              }
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

                          {/* ========================================
                                CHILD NAME
                            ======================================== */}

                          <Box
                            sx={{
                              minWidth: 250,
                            }}
                          >
                            <TextField
                              fullWidth
                              label="Child Name"
                              size="small"
                              value={row.child_name || ""}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "child_name",
                                  e.target.value,
                                )
                              }
                            />
                          </Box>

                          {/* ========================================
                                DATE OF BIRTH
                            ======================================== */}

                          <Box
                            sx={{
                              minWidth: 160,
                            }}
                          >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                              <DatePicker
                                format="DD/MM/YYYY"
                                value={
                                  dayjs.isDayjs(row.child_dob)
                                    ? row.child_dob
                                    : null
                                }
                                onChange={(newValue) => {
                                  handleChange(
                                    index,
                                    "child_dob",
                                    newValue || null,
                                  );
                                }}
                                slotProps={{
                                  textField: {
                                    size: "small",
                                    fullWidth: true,
                                    label: "Date of Birth",
                                  },
                                }}
                              />
                            </LocalizationProvider>
                          </Box>

                          {/* ========================================
                                BOARD
                            ======================================== */}

                          <Box
                            sx={{
                              minWidth: 150,
                            }}
                          >
                            <Autocomplete
                              disabled={row.isEdit}
                              options={boards}
                              getOptionLabel={(option) =>
                                option?.generalmaster_name || ""
                              }
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

                          {/* ========================================
                                PREVIOUS SCHOOL TYPE
                            ======================================== */}

                          <Box
                            sx={{
                              minWidth: 170,
                            }}
                          >
                            <Autocomplete
                              disabled={row.isEdit}
                              options={previousschools}
                              getOptionLabel={(option) =>
                                option?.generalmaster_name || ""
                              }
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
                                  label="Previous School"
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

                          {/* ========================================
                                PREVIOUS SCHOOL NAME
                            ======================================== */}

                          <Box
                            sx={{
                              minWidth: 220,
                            }}
                          >
                            <TextField
                              fullWidth
                              label="School Name"
                              size="small"
                              value={row.previousschool_name || ""}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "previousschool_name",
                                  e.target.value,
                                )
                              }
                            />
                          </Box>

                          {/* ========================================
                                DELETE
                            ======================================== */}

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Button
                              color="error"
                              variant="outlined"
                              onClick={() => removeRow(index)}
                              disabled={enquiryDetails.length === 1}
                            >
                              ✕
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* ==================================================
                      ADD ITEM
                  ================================================== */}

                  <Button variant="outlined" onClick={addRow} sx={{ mt: 1 }}>
                    + Add Item
                  </Button>
                </Box>

                {/* ==================================================
                    SUBMIT BUTTONS
                ================================================== */}

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
        )}

        {/* ====================================================
            VIEW LIST TAB
        ==================================================== */}

        {tab === 1 && (
          <Box>
            {/* ==================================================
                SEARCH
            ================================================== */}

            <Box sx={{ mb: 2 }}>
              <TextField
                label="Search"
                size="small"
                value={search}
                onChange={handleSearch}
                placeholder="Search enquiry, code, parent, phone..."
                sx={{
                  "& .MuiInputBase-root": {
                    height: 42,

                    width: {
                      xs: "100%",
                      sm: 500,
                    },

                    fontSize: "14px",
                  },

                  "& .MuiInputLabel-root": {
                    fontSize: "13px",
                  },
                }}
              />
            </Box>

            {/* ==================================================
                TABLE
            ================================================== */}

            <TableContainer component={Paper}>
              <Table
                sx={{
                  minWidth: 800,
                }}
                aria-label="enquiry table"
              >
                {/* ==================================================
                    TABLE HEAD
                ================================================== */}

                <TableHead>
                  <TableRow>
                    <TableCell>Enquiry Code</TableCell>

                    <TableCell>Enquiry Name</TableCell>
                    <TableCell>Father Name</TableCell>
                    <TableCell>Father PhoneNo</TableCell>
                    <TableCell>Date</TableCell>

                    <TableCell>Status</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                {/* ==================================================
                    TABLE BODY
                ================================================== */}

                <TableBody>
                  {studentenquiry.length > 0 ? (
                    studentenquiry.map((value) => (
                      <TableRow
                        key={value._id}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* ======================================
                              ENQUIRY CODE
                          ====================================== */}

                        <TableCell>{value.enquiry_code || ""}</TableCell>

                        {/* ======================================
                              ENQUIRY NAME
                          ====================================== */}

                        <TableCell>{value.enquiry_name || ""}</TableCell>

                        {/*  ======================================
                              FATHER NAME
                          ====================================== */}

                        <TableCell>{value.father_name || ""}</TableCell>

                        {/*  ======================================
                              FATHER Phone No.
                          ====================================== */}

                        <TableCell>{value.father_phoneno || ""}</TableCell>

                        {/* ======================================
                              DATE
                          ====================================== */}

                        <TableCell>
                          {value.enquiry_date
                            ? dayjs(value.enquiry_date).format("DD-MM-YYYY")
                            : ""}
                        </TableCell>

                        {/* ======================================
                              STATUS
                          ====================================== */}

                        <TableCell
                          sx={{
                            textTransform: "capitalize",
                          }}
                        >
                          {value.status || ""}
                        </TableCell>

                        {/* ======================================
                              ACTION
                          ====================================== */}

                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            {/* DELETE + EDIT */}

                            {value.status === "valid" && (
                              <>
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  onClick={() => handleDelete(value._id)}
                                >
                                  Delete
                                </Button>

                                <Button
                                  variant="contained"
                                  size="small"
                                  sx={{
                                    backgroundColor: "gold",
                                    color: "#222",
                                    "&:hover": {
                                      backgroundColor: "#d4af37",
                                    },
                                  }}
                                  onClick={() => handleEdit(value._id)}
                                >
                                  Edit
                                </Button>
                              </>
                            )}

                            {/* PRINT */}

                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                backgroundColor: "green",
                                color: "#fff",
                                "&:hover": {
                                  backgroundColor: "darkgreen",
                                },
                              }}
                              onClick={() => handlePrint(value._id)}
                            >
                              Print
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No enquiries found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </>
  );
}
