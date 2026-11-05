import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  CardMedia,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Autocomplete,
  Grid,
  Tabs,
  Tab,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
} from "@mui/material";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { supplierSchema } from "../../../yupSchema/supplierSchema";
// import SupplierCardAdmin from "../../utility components/supplier card/SupplierCard";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadIcon from "@mui/icons-material/Upload";

export default function Suppliers() {
  const [supplierClass, setSupplierClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [section, setSection] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [parent, setParent] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // Independent state for image preview
  const [selectedYear, setSelectedYear] = useState(null);

  const [vaccinatedArray, setVaccinatedArray] = useState([]);
  const [selectedVaccinated, setSelectedVaccinated] = useState(null);

  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [previouslyappliedArray, setPreviouslyappliedArray] = useState([]);
  const [selectedpreviouslyapplied, setSelectedpreviouslyapplied] =
    useState(null);

  const [attachmenttypes, setAttachmenttypes] = useState([]);
  const [attachmentstatuses, setAttachmentstatuses] = useState([]);

  const [dataError, setDataError] = useState("");

  const [tab, setTab] = useState(0);
  const [bloodgroups, setBloodgroups] = useState([]);
  const [selectedbloodgroup, setSelectedbloodgroup] = useState(null);

  const [nationalities, setNationalities] = useState([]);
  const [selectednationality, setSelectednationality] = useState(null);

  const [religions, setReligions] = useState([]);
  const [selectedreligion, setSelectedreligion] = useState(null);

  const [languages, setLanguages] = useState([]);
  const [selectedmothertongue, setSelectedmothertongue] = useState(null);
  const [selectedfirstlanguage, setSelectedfirstlanguage] = useState(null);

  const [modeoftransports, setModeoftransports] = useState([]);
  const [selectedmodeoftransport, setSelectedmodeoftransport] = useState(null);

  const [noofsuppliers, setNoofsuppliers] = useState(0);
  const [isDataValid, setIsDataValid] = useState(true);

  const [accountledgers, setAccountledgers] = useState([]);
  const [selectedAccountledger, setSelectedAccountledger] = useState(null);

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}-${year + 1}`, value: year };
  });

  const fetchStatuses = async () => {
    try {
      const supplierStatuses = [
        {
          value: "active",
          label: "Active",
          meaning: "Currently Active",
        },
        {
          value: "inactive",
          label: "Inactive",
          meaning: "Temporarily inactive",
        },
      ];

      setStatuses(supplierStatuses);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const fetchVaccinated = async () => {
    try {
      const fieldData = [
        { fieldId: "yes", fieldValue: "Yes" },
        { fieldId: "no", fieldValue: "No" },
      ];

      setVaccinatedArray(fieldData);
    } catch (error) {
      console.error("Error fetching vaccinated:", error);
    }
  };

  const fetchpreviouslyapplied = async () => {
    try {
      const fieldData = [
        { fieldId: "yes", fieldValue: "Yes" },
        { fieldId: "no", fieldValue: "No" },
      ];

      setPreviouslyappliedArray(fieldData);
    } catch (error) {
      console.error("Error fetching vaccinated:", error);
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...documentAttachments];
    updated[index][field] = value;

    if (field === "attachment_file") {
      addImageDocument(value);
      // updated[index].attachment_image = value.name || "";
    }

    setDocumentAttachments(updated);
  };

  const viewUploadFile = (fileName) => {
    const fileUrl = `${fileName}`;
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const view_DocumentAttachment_File = (fileName) => {
    const fileUrl = `${fileName}`;
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  // Handle image file selection
  const addImage = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Handle image file selection
  const addImageDocument = (event) => {
    const selectedFile = event;
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const [params, setParams] = useState({});

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

  const [documentAttachments, setDocumentAttachments] = useState([
    {
      attachmenttype: null,
      attachmentstatus: null,
      attachment_image: "",
      attachment_file: "",
      isEdit: false,
    },
  ]);

  const clearDocumentAttachments = () => {
    setDocumentAttachments([
      {
        attachmenttype: null,
        attachmentstatus: null,
        attachment_image: "",
        attachment_file: "",
        isEdit: false,
      },
    ]);
  };

  const addRow = () => {
    setDocumentAttachments([
      ...documentAttachments,
      {
        attachmenttype: null,
        attachmentstatus: null,
        attachment_image: "",
        attachment_file: "",
        isEdit: false,
      },
    ]);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/supplier/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(e.response.data.message);
          setType("error");
        });
    }
  };

  const handleEdit = (id) => {
    setEdit(true);
    axios
      .get(`${baseUrl}/supplier/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;
        // const classId = data?.supplier_class?._id || data.supplier_class;
        // const matchedClass = supplierClass.find((c) => c._id === classId);
        // setSelectedClass(matchedClass || null);

        // const sectionId = data?.section?._id || data.section;
        // const matchedSection = section.find((c) => c._id === sectionId);
        // setSelectedSection(matchedSection || null);

        // const parentId = data?.parent?._id || data.parent;
        // const matchedParent = parent.find((c) => c._id === parentId);
        // setSelectedParent(matchedParent || null);

        // Formik.setFieldValue("year", resp.data.data.year);

        // const matchedYear = years.find((s) => s.value === resp.data.data.year);
        // setSelectedYear(matchedYear || null);

        // const matchedVaccinated = vaccinatedArray.find(
        //   (s) => s.fieldId === resp.data.data?.vaccinated,
        // );
        // setSelectedVaccinated(matchedVaccinated || null);

        const matchedStatus = statuses.find(
          (s) => s.value === resp.data.data?.status,
        );
        setSelectedStatus(matchedStatus || null);

        // Auto calculate age
        // const age = calculateAge(data.dOBDate?.split("T")[0] || "");

        // setSelectedbloodgroup(data?.bloodgroup || null);
        // setSelectednationality(data?.nationality || null);

        // setSelectedreligion(data?.religion || null);
        // setSelectedmothertongue(data?.mothertongue || null);
        // setSelectedmodeoftransport(data?.modeoftransport || null);
        // setSelectedfirstlanguage(data?.firstlanguage || null);

        // const matchedPreviouslyapplied = previouslyappliedArray.find(
        //   (s) => s.fieldValue === resp.data.data?.previouslyapplied,
        // );
        // setSelectedpreviouslyapplied(matchedPreviouslyapplied || null);

        Formik.setValues({
          email: data.email,
          name: data.name,
          supplier_code: data.supplier_code || "",
          phone_no: data.phone_no,
          registration_no: data.registration_no,
          zipcode: data?.zipcode || "",
          address: data?.address || "",
          joinDate: data.joinDate?.split("T")[0] || "",
          password: data.password,
        });
        setImageUrl(data.image); // Assuming response has `image` URL field for preview

        if (resp.data?.documentAttachments.length > 0) {
          setDocumentAttachments(resp.data?.documentAttachments);
        } else {
          clearDocumentAttachments();
        }

        setEditId(data._id);
        setTab(0); // open Create Receipt tab
      })
      .catch((e) => {
        console.log(e.message);
        console.log("Error in fetching edit data.");
      });
    // .catch(() => console.log("Error in fetching edit data."));
  };

  const cancelEdit = () => {
    setEdit(false);
    Formik.resetForm();
    setSelectedClass(null);
    setSelectedSection(null);
    setSelectedParent(null);
    setSelectedbloodgroup(null);
    setSelectednationality(null);
    setSelectedYear(null);
    setSelectedVaccinated(null);
    setSelectedStatus(null);

    setSelectedreligion(null);
    setSelectedmothertongue(null);
    setSelectedmodeoftransport(null);
    setSelectedfirstlanguage(null);
    setSelectedAccountledger(null);

    clearDocumentAttachments();
  };

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const resetMessage = () => setMessage("");

  const initialValues = {
    name: "",
    supplier_code: "",
    email: "",
    phone_no: "",
    registration_no: "",
    zipcode: "",
    address: "",
    status: "",
    joinDate: "",
    password: "12345678",
  };

  const Formik = useFormik({
    initialValues,
    validationSchema: supplierSchema,
    onSubmit: (values) => {
      values.status = selectedStatus?.value;

      if (isEdit) {
        const fd = new FormData();
        // Object.keys(values).forEach((key) => fd.append(key, values[key]));
        Object.keys(values).forEach((key) => {
          fd.append(key, values[key]);
        });
        if (file) {
          fd.append("image", file, file.name);
        }

        axios
          .patch(`${baseUrl}/supplier/update/${editId}`, fd)
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            handleClearFile();

            cancelEdit();
            setParams({});
            setTab(1); // go to View List
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
          });
      } else {
        // if (file) {
        const fd = new FormData();
        if (file) {
          fd.append("image", file, file.name);
        }

        Object.keys(values).forEach((key) => fd.append(key, values[key]));

        axios
          .post(`${baseUrl}/supplier/register`, fd)
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            Formik.resetForm();
            handleClearFile();

            setParams({});
            cancelEdit();
            setTab(1); // go to View List
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
          });
        // } else {
        //   setMessage("Please provide an image.");
        //   setType("error");
        // }
      }
    },
  });

  const calculateAge = (dob) => {
    if (!dob) return "";

    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const fetchSuppliers = () => {
    axios
      .get(`${baseUrl}/supplier/fetch-with-query`, { params })
      .then((resp) => {
        setSuppliers(resp.data.data);
        setNoofsuppliers(resp.data.data.length);
      })
      .catch(() => console.log("Error in fetching suppliers data"));
  };

  const fetchAttachmenttypes = () => {
    const params = {
      generalmaster_type: "attachmenttype",
    };
    axios
      .get(`${baseUrl}/generalmaster/fetch-with-query`, { params: params })
      .then((resp) => {
        console.log("Fetching data in  generalmaster Calls  admin.", resp);
        setAttachmenttypes(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching generalmaster calls admin data", e);
      });
  };

  const fetchAttachmentstatuses = () => {
    const params = {
      generalmaster_type: "attachmentstatus",
    };
    axios
      .get(`${baseUrl}/generalmaster/fetch-with-query`, { params: params })
      .then((resp) => {
        console.log("Fetching data in  generalmaster Calls  admin.", resp);
        setAttachmentstatuses(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching generalmaster calls admin data", e);
      });
  };

  const saveDocumentAttachment = async (values) => {
    // .post(`${baseUrl}/supplier/register`, fd)
    // .patch(`${baseUrl}/supplier/update/${editId}`, fd)
    values.attachmenttype = values.attachmenttype?._id;
    values.attachmentstatus = values.attachmentstatus?._id;

    const fd = new FormData();
    fd.append("image", file, file.name);
    Object.keys(values).forEach((key) => fd.append(key, values[key]));
    axios
      .post(`${baseUrl}/supplier/document-attachment/${editId}`, fd)
      .then((resp) => {
        console.log("Response after submitting", resp);
        setMessage(resp.data.message);
        setType("success");
      })
      .catch((e) => {
        setMessage(e.response.data.message);
        setType("error");
        console.log("Error, response admin casting calls", e);
      });
  };

  const deleteDocumentAttachment = async (id, index) => {
    axios
      .delete(`${baseUrl}/supplier/delete-document-attachment/${id}`)
      .then((resp) => {
        removeRow(index);
        setMessage(resp.data.message);
        setType("success");
      })
      .catch((e) => {
        setMessage(e.response.data.message);
        setType("error");
        console.log("Error, response admin casting calls", e);
      });
  };

  useEffect(() => {
    fetchSuppliers();

    fetchStatuses();
    fetchAttachmenttypes();

    fetchAttachmentstatuses();
  }, [message, params]);

  //   CLEARING IMAGE FILE REFENCE FROM INPUT
  const fileInputRef = useRef(null);
  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    setFile(null); // Reset the file state
    setImageUrl(null); // Clear the image preview
  };

  const removeRow = (index) => {
    setDocumentAttachments(documentAttachments.filter((_, i) => i !== index));
    console.log(documentAttachments);
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
            <Tab label={isEdit ? "Edit Supplier-1" : "Add New Supplier-1"} />
            {/* <Tab label={isEdit ? "Edit Supplier-2" : "Add New Supplier-2"} /> */}
            <Tab label="View List" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Box>
            <Paper sx={{ padding: "20px", margin: "10px" }}>
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                <Grid container spacing={2}>
                  {/* Supplier Image Full Row */}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="h6">Supplier Pic</Typography>

                      <TextField
                        type="file"
                        name="file"
                        onChange={addImage}
                        inputRef={fileInputRef}
                      />

                      {imageUrl && (
                        <CardMedia
                          component="img"
                          image={imageUrl}
                          sx={{ width: 120, height: 120 }}
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      disabled={isEdit}
                      fullWidth
                      label="Email"
                      name="email"
                      value={Formik.values.email}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />
                    {Formik.touched.email && Formik.errors.email && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.email}
                      </p>
                    )}
                  </Grid>

                  {/* Name */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      disabled
                      fullWidth
                      label="supplier_code"
                      name="supplier_code"
                      value={Formik.values.supplier_code}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />
                  </Grid>

                  {/* Name */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={Formik.values.name}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />
                    {Formik.touched.name && Formik.errors.name && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.name}
                      </p>
                    )}
                  </Grid>

                  {/* joinDate */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="joinDate"
                      label="Join Date"
                      type="date"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={Formik.values.joinDate}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />
                    {Formik.touched.age && Formik.errors.age && (
                      <Typography color="error" variant="caption">
                        {Formik.errors.age}
                      </Typography>
                    )}
                  </Grid>

                  {/* Status */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={statuses}
                      getOptionLabel={(option) =>
                        option.meaning + "(" + option.label + ")"
                      }
                      value={selectedStatus}
                      onChange={(event, newValue) => {
                        setSelectedStatus(newValue);

                        Formik.setFieldValue(
                          "status",
                          newValue ? newValue.value : "",
                        );
                      }}
                      onBlur={() => Formik.setFieldTouched("status", true)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select status"
                          placeholder="Search status..."
                          fullWidth
                          error={
                            Formik.touched.status &&
                            Boolean(Formik.errors.status)
                          }
                          helperText={
                            Formik.touched.status && Formik.errors.status
                          }
                        />
                      )}
                    />
                  </Grid>

                  {/* Phone No*/}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone #"
                      name="phone_no"
                      value={Formik.values.phone_no}
                      onChange={Formik.handleChange}
                    />
                    {Formik.touched.phone_no && Formik.errors.phone_no && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.phone_no}
                      </p>
                    )}
                  </Grid>

                  {/* registration_no */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="registration_no"
                      name="registration_no"
                      value={Formik.values.registration_no}
                      onChange={Formik.handleChange}
                    />
                  </Grid>

                  {/* address */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="address"
                      name="address"
                      value={Formik.values.address}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.address && Formik.errors.address && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.address}
                      </p>
                    )} */}
                  </Grid>

                  {/* zipcode */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="zip code"
                      name="zipcode"
                      value={Formik.values.zipcode}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.zipcode && Formik.errors.zipcode && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.zipcode}
                      </p>
                    )} */}
                  </Grid>

                  {/* Password */}
                  {!isEdit && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        type="password"
                        fullWidth
                        label="Password"
                        name="password"
                        value={Formik.values.password}
                        onChange={Formik.handleChange}
                      />
                      {Formik.touched.password && Formik.errors.password && (
                        <p
                          style={{ color: "red", textTransform: "capitalize" }}
                        >
                          {Formik.errors.password}
                        </p>
                      )}
                    </Grid>
                  )}

                  {/* Document Attachments */}
                  {isEdit && (
                    <Box sx={{ mt: 4 }}>
                      {/* Error */}
                      {!isDataValid && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {dataError}
                        </Alert>
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" fontWeight={700}>
                          Document Attachments
                        </Typography>

                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={addRow}
                        >
                          Add Attachment
                        </Button>
                      </Box>

                      {/* Attachment Rows */}
                      {documentAttachments.map((row, index) => (
                        <Paper
                          key={index}
                          elevation={2}
                          sx={{
                            p: 2,
                            mb: 2,
                            borderRadius: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 1fr",
                                md: "280px 280px 1fr auto",
                              },
                              gap: 2,
                              alignItems: "center",
                            }}
                          >
                            {/* Attachment Type */}
                            <Autocomplete
                              disabled={row.isEdit}
                              options={attachmenttypes}
                              getOptionLabel={(option) =>
                                option?.generalmaster_name || ""
                              }
                              isOptionEqualToValue={(option, value) =>
                                option._id === value?._id
                              }
                              value={row.attachmenttype || null}
                              onChange={(event, newValue) => {
                                handleChange(index, "attachmenttype", newValue);
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Attachment Type"
                                  size="small"
                                  fullWidth
                                />
                              )}
                            />

                            {/* Attachment Status */}
                            <Autocomplete
                              disabled={row.isEdit}
                              options={attachmentstatuses}
                              getOptionLabel={(option) =>
                                option?.generalmaster_name || ""
                              }
                              isOptionEqualToValue={(option, value) =>
                                option._id === value?._id
                              }
                              value={row.attachmentstatus || null}
                              onChange={(event, newValue) => {
                                handleChange(
                                  index,
                                  "attachmentstatus",
                                  newValue,
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Attachment Status"
                                  size="small"
                                  fullWidth
                                />
                              )}
                            />

                            {/* Attachment Image / URL */}

                            <TextField
                              type="file"
                              name="attachment_file"
                              fullWidth
                              size="small"
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "attachment_file",
                                  e.target.files[0], // ✅ use file object
                                )
                              }
                              inputRef={fileInputRef}
                              InputProps={{
                                startAdornment: (
                                  <AttachFileIcon
                                    sx={{ mr: 1, color: "text.secondary" }}
                                  />
                                ),
                              }}
                            />

                            {/* Action Buttons */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                minWidth: "90px",
                              }}
                            >
                              {/* Upload */}
                              <IconButton
                                color="primary"
                                onClick={() => {
                                  if (row?.attachment_file) {
                                    saveDocumentAttachment(row);
                                  } else {
                                    setMessage("Choose the file");
                                    setType("error");
                                  }
                                }}
                              >
                                <UploadIcon />
                              </IconButton>

                              {/* View */}
                              <IconButton
                                color="primary"
                                onClick={() => {
                                  // view logic
                                  if (row?.attachment_image) {
                                    view_DocumentAttachment_File(
                                      row?.attachment_image,
                                    );
                                  } else {
                                    setMessage("File is not attached/upload");
                                    setType("error");
                                  }
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>

                              {/* Delete */}
                              <IconButton
                                color="error"
                                onClick={() => {
                                  if (row?._id) {
                                    deleteDocumentAttachment(row?._id, index);
                                  } else {
                                    removeRow(index);
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {/* Buttons Full Row */}
                  <Grid item xs={12}>
                    <Button type="submit" fullWidth variant="contained">
                      {isEdit ? "Update Supplier" : "Register Supplier"}
                    </Button>

                    {isEdit && (
                      <Button
                        fullWidth
                        onClick={cancelEdit}
                        variant="outlined"
                        sx={{ mt: 1 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Grid>
                </Grid>
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

              {/* No of Suppliers Card */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: { xs: "100%", sm: 160 },
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "14px",
                  boxShadow: 2,
                }}
              >
                Suppliers Count : {noofsuppliers}
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Name
                    </TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Email</TableCell>
                    <TableCell align="right">JoinDate</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suppliers.map((value, i) => (
                    <TableRow
                      key={i}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {value.name}
                      </TableCell>

                      <TableCell align="right">{value?.status}</TableCell>

                      <TableCell align="right">{value?.email}</TableCell>

                      <TableCell align="right">
                        {dayjs(value?.joinDate).format("DD/MM/YYYY")}
                      </TableCell>
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

                          {value?.supplier_image && (
                            <Button
                              variant="contained"
                              sx={{ background: "skyblue", color: "#000" }}
                              onClick={() =>
                                viewUploadFile(value?.supplier_image)
                              }
                            >
                              View Pic
                            </Button>
                          )}
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
