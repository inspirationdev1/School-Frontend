/* eslint-disable react-hooks/exhaustive-deps */

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  CardMedia,
  Paper,
  TextField,
  Typography,
  Grid,
  Tabs,
  Tab,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
  Autocomplete,
} from "@mui/material";

import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { parentSchema } from "../../../yupSchema/parentSchema";
import dayjs from "dayjs";

export default function Parents() {
  const [parentClass, setparentClass] = useState([]);
  const [parents, setparents] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [date, setDate] = useState(null);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [tab, setTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);

  const [params, setParams] = useState({});

  // ==============================
  // ACADEMIC YEARS
  // ==============================

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;

    return {
      label: `${year}-${year + 1}`,
      value: year,
    };
  });

  // ==============================
  // VIEW UPLOADED FILE
  // ==============================

  const viewUploadFile = (fileName) => {
    const fileUrl = `${fileName}`;

    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  // ==============================
  // ADD IMAGE
  // ==============================

  const addImage = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setImageUrl(URL.createObjectURL(selectedFile));

    console.log("Image", selectedFile, event.target.value);

    setFile(selectedFile);
  };

  // ==============================
  // SEARCH
  // ==============================

  const handleSearch = (e) => {
    const searchValue = e.target.value;

    let newParam;

    if (searchValue !== "") {
      newParam = {
        ...params,
        search: searchValue,
      };
    } else {
      newParam = {
        ...params,
      };

      delete newParam.search;
    }

    setParams(newParam);
  };

  // ==============================
  // DELETE
  // ==============================

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/parent/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(
            e.response?.data?.message || "Error while deleting parent",
          );

          setType("error");

          console.log("Error, deleting", e);
        });
    }
  };

  // ==============================
  // EDIT
  // ==============================

  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/parent/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        Formik.setFieldValue("email", data.email);

        Formik.setFieldValue("name", data.name);

        Formik.setFieldValue("father_name", data.name);

        Formik.setFieldValue("mother_name", data?.mother_name);

        Formik.setFieldValue("parent_code", data?.parent_code);

        Formik.setFieldValue("qualification", data.qualification);

        Formik.setFieldValue("gender", data.gender);

        Formik.setFieldValue("password", data.password);

        Formik.setFieldValue("year", data.year);

        const matchedYear = years.find((s) => s.value === data.year);

        setSelectedYear(matchedYear || null);

        Formik.setFieldValue("dOBDate", data.dOBDate?.split("T")[0] || "");

        Formik.setFieldValue("joinDate", data.joinDate?.split("T")[0] || "");

        // Calculate age
        const age = calculateAge(data.dOBDate?.split("T")[0] || "");

        Formik.setFieldValue("age", age);

        Formik.setFieldValue("phoneno", data?.phoneno);

        setEditId(data._id);

        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);
      });
  };

  // ==============================
  // CALCULATE AGE
  // ==============================

  const calculateAge = (dob) => {
    if (!dob) return "";

    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // ==============================
  // CANCEL EDIT
  // ==============================

  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);

    Formik.resetForm();

    setSelectedYear(null);
  };

  // ==============================
  // FILE INPUT
  // ==============================

  const fileInputRef = useRef(null);

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setFile(null);
    setImageUrl(null);
  };

  // ==============================
  // MESSAGE
  // ==============================

  const [message, setMessage] = useState("");

  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  // ==============================
  // INITIAL VALUES
  // ==============================

  const initialValues = {
    email: "",
    name: "",
    father_name: "",
    mother_name: "",
    parent_code: "",
    qualification: "",
    gender: "",
    age: "",
    password: "",
    year: "",
    dOBDate: "",
    joinDate: "",
    phoneno: "",
  };

  // ==============================
  // FORMIK
  // ==============================

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: parentSchema,

    onSubmit: (values) => {
      console.log("parent calls admin Formik values", values);

      // ==============================
      // EDIT
      // ==============================

      if (isEdit) {
        const fd = new FormData();

        Object.keys(values).forEach((key) => {
          fd.append(key, values[key]);
        });

        if (file) {
          fd.append("image", file, file.name);
        }

        axios
          .patch(`${baseUrl}/parent/update/${editId}`, fd)
          .then((resp) => {
            setMessage(resp.data.message);

            setType("success");

            handleClearFile();

            cancelEdit();

            setParams({});

            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error while updating parent",
            );

            setType("error");
          });
      }

      // ==============================
      // CREATE
      // ==============================
      else {
        if (file) {
          const fd = new FormData();

          fd.append("image", file, file.name);

          Object.keys(values).forEach((key) => {
            fd.append(key, values[key]);
          });

          axios
            .post(`${baseUrl}/parent/register`, fd)
            .then((resp) => {
              console.log("Response after submitting admin parent", resp);

              setMessage(resp.data.message);

              setType("success");

              handleClearFile();

              setParams({});

              cancelEdit();

              setTab(1);
            })
            .catch((e) => {
              setMessage(
                e.response?.data?.message || "Error while creating parent",
              );

              setType("error");

              console.log("Error, response admin parent calls", e);
            });
        } else {
          setMessage("Please provide image.");

          setType("error");
        }
      }
    },
  });

  // ==============================
  // FETCH PARENTS
  // ==============================

  const fetchparents = () => {
    axios
      .get(`${baseUrl}/parent/fetch-with-query`, {
        params: params,
      })
      .then((resp) => {
        console.log("Fetching data in parent Calls admin.", resp);

        setparents(resp.data.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching parent calls admin data", e);
      });
  };

  // ==============================
  // FETCH DATA
  // ==============================

  useEffect(() => {
    fetchparents();
  }, [message, params]);

  return (
    <>
      {/* ==============================
          SNACKBAR
      ============================== */}

      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      <Box>
        {/* ==============================
            TABS
        ============================== */}

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
            <Tab label={isEdit ? "Edit Parent" : "Add New Parent"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =====================================================
            TAB 0 - ADD / EDIT
        ===================================================== */}

        {tab === 0 && (
          <Box component="div">
            <Paper
              sx={{
                padding: "20px",
                margin: "10px",
              }}
            >
              <Box component="form" onSubmit={Formik.handleSubmit}>
                <Grid container spacing={2}>
                  {/* IMAGE */}

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography variant="h6">Parent Pic</Typography>

                      <TextField
                        type="file"
                        name="file"
                        onChange={addImage}
                        inputRef={fileInputRef}
                      />

                      {file && (
                        <CardMedia
                          component="img"
                          image={imageUrl}
                          sx={{
                            width: 120,
                            height: 120,
                          }}
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* EMAIL */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={Formik.values.email}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.email && Formik.errors.email && (
                      <p
                        style={{
                          color: "red",
                          textTransform: "capitalize",
                        }}
                      >
                        {Formik.errors.email}
                      </p>
                    )}
                  </Grid>

                  {/* FATHER NAME */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Father Name"
                      name="name"
                      value={Formik.values.name}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />

                    {Formik.touched.name && Formik.errors.name && (
                      <p
                        style={{
                          color: "red",
                          textTransform: "capitalize",
                        }}
                      >
                        {Formik.errors.name}
                      </p>
                    )}
                  </Grid>

                  {/* MOTHER NAME */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mother Name"
                      name="mother_name"
                      value={Formik.values.mother_name}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />
                  </Grid>

                  {/* PARENT CODE */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="parent_code"
                      name="parent_code"
                      value={Formik.values.parent_code}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      disabled
                    />
                  </Grid>

                  {/* QUALIFICATION */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Qualification"
                      name="qualification"
                      value={Formik.values.qualification}
                      onChange={Formik.handleChange}
                    />

                    {Formik.touched.qualification &&
                      Formik.errors.qualification && (
                        <p
                          style={{
                            color: "red",
                            textTransform: "capitalize",
                          }}
                        >
                          {Formik.errors.qualification}
                        </p>
                      )}
                  </Grid>

                  {/* GENDER */}

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>

                      <Select
                        name="gender"
                        value={Formik.values.gender}
                        onChange={Formik.handleChange}
                      >
                        <MenuItem value="">Select Gender</MenuItem>

                        <MenuItem value="male">Male</MenuItem>

                        <MenuItem value="female">Female</MenuItem>

                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>

                    {Formik.touched.gender && Formik.errors.gender && (
                      <p
                        style={{
                          color: "red",
                          textTransform: "capitalize",
                        }}
                      >
                        {Formik.errors.gender}
                      </p>
                    )}
                  </Grid>

                  {/* DOB */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="dOBDate"
                      label="Date of Birth"
                      type="date"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={Formik.values.dOBDate}
                      onChange={(e) => {
                        const dob = e.target.value;

                        Formik.setFieldValue("dOBDate", dob);

                        const age = calculateAge(dob);

                        Formik.setFieldValue("age", age);
                      }}
                    />

                    {Formik.touched.dOBDate && Formik.errors.dOBDate && (
                      <p
                        style={{
                          color: "red",
                          textTransform: "capitalize",
                        }}
                      >
                        {Formik.errors.dOBDate}
                      </p>
                    )}
                  </Grid>

                  {/* AGE */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Age"
                      name="age"
                      value={Formik.values.age}
                      disabled
                    />
                  </Grid>

                  {/* JOIN DATE */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="joinDate"
                      label="Join Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={Formik.values.joinDate}
                      onChange={Formik.handleChange}
                    />

                    {Formik.touched.joinDate && Formik.errors.joinDate && (
                      <p
                        style={{
                          color: "red",
                          textTransform: "capitalize",
                        }}
                      >
                        {Formik.errors.joinDate}
                      </p>
                    )}
                  </Grid>

                  {/* PHONE */}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="phoneno"
                      name="phoneno"
                      value={Formik.values.phoneno}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />
                  </Grid>

                  {/* ACADEMIC YEAR */}

                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={years}
                      getOptionLabel={(option) => option.label}
                      value={selectedYear}
                      onChange={(e, newValue) => {
                        setSelectedYear(newValue);

                        Formik.setFieldValue("year", newValue?.value || "");
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
                  </Grid>

                  {/* PASSWORD */}

                  {!isEdit && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        name="password"
                        value={Formik.values.password}
                        onChange={Formik.handleChange}
                      />

                      {Formik.touched.password && Formik.errors.password && (
                        <p
                          style={{
                            color: "red",
                            textTransform: "capitalize",
                          }}
                        >
                          {Formik.errors.password}
                        </p>
                      )}
                    </Grid>
                  )}

                  {/* BUTTONS */}

                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" sx={{ mr: 1 }}>
                      Submit
                    </Button>

                    {isEdit && (
                      <Button variant="outlined" onClick={cancelEdit}>
                        Cancel Edit
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Box>
        )}

        {/* =====================================================
            TAB 1 - VIEW LIST
        ===================================================== */}

        {tab === 1 && (
          <Box>
            {/* ==============================
                SEARCH + TOTAL COUNT
            ============================== */}

            <Box
              sx={{
                padding: "2px",
                minWidth: 120,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                marginBottom: "5px",
              }}
            >
              <TextField
                label="Search Name .."
                size="small"
                value={params.search || ""}
                onChange={handleSearch}
                sx={{
                  "& .MuiInputBase-root": {
                    height: 42,
                    width: 500,
                    fontSize: "14px",
                  },

                  "& .MuiInputLabel-root": {
                    fontSize: "13px",
                  },
                }}
              />

              {/* TOTAL PARENT COUNT */}

              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                Total Parents: {parents.length}
              </Typography>
            </Box>

            {/* ==============================
                TABLE
            ============================== */}

            <TableContainer component={Paper}>
              <Table
                sx={{
                  minWidth: 650,
                }}
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Father Name
                    </TableCell>

                    <TableCell align="right">Mother Name</TableCell>

                    <TableCell align="right">Email</TableCell>

                    <TableCell align="right">JoinDate</TableCell>

                    <TableCell align="right">Phone</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {parents.length > 0 ? (
                    parents.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {value.name}
                        </TableCell>

                        <TableCell component="th" scope="row">
                          {value.mother_name}
                        </TableCell>

                        <TableCell align="right">{value?.email}</TableCell>

                        <TableCell align="right">
                          {dayjs(value?.joinDate).format("DD/MM/YYYY")}
                        </TableCell>

                        <TableCell component="th" scope="row">
                          {value.phoneno}
                        </TableCell>

                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1.5,
                            }}
                          >
                            {/* DELETE */}

                            <Button
                              variant="contained"
                              sx={{
                                background: "red",
                                color: "#fff",
                              }}
                              onClick={() => handleDelete(value._id)}
                            >
                              Delete
                            </Button>

                            {/* EDIT */}

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

                            {/* VIEW PIC */}

                            <Button
                              variant="contained"
                              sx={{
                                background: "skyblue",
                                color: "#000",
                              }}
                              onClick={() =>
                                viewUploadFile(value?.parent_image)
                              }
                            >
                              View Pic
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No parents found
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
