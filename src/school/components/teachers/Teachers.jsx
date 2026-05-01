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
  Tabs,
  Tab,
  Autocomplete,
  Grid,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
} from "@mui/material";

import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { teacherSchema } from "../../../yupSchema/teacherSchemal";
import TeacherCardAdmin from "../../utility components/teacher card/TeacherCard";
import dayjs from "dayjs";

export default function Teachers() {
  const [teacherClass, setteacherClass] = useState([]);
  const [teachers, setteachers] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [date, setDate] = useState(null);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [tab, setTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);

  const addImage = (event) => {
    const file = event.target.files[0];
    setImageUrl(URL.createObjectURL(file));
    console.log("Image", file, event.target.value);
    setFile(file);
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

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/teacher/delete/${id}`)
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
    axios
      .get(`${baseUrl}/teacher/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("email", resp.data.data.email);
        Formik.setFieldValue("name", resp.data.data.name);
        Formik.setFieldValue("teacher_code", resp.data.data?.teacher_code);
        Formik.setFieldValue("qualification", resp.data.data.qualification)
        Formik.setFieldValue("gender", resp.data.data.gender)
        // Formik.setFieldValue("age", resp.data.data.age);
        Formik.setFieldValue("password", resp.data.data.password)

        Formik.setFieldValue("year", resp.data.data.year)
        const matchedYear = years.find(s => s.value === resp.data.data.year);
        setSelectedYear(matchedYear || null);

        Formik.setFieldValue("dOBDate", resp.data.data.dOBDate?.split("T")[0] || "")
        Formik.setFieldValue("joinDate", resp.data.data.joinDate?.split("T")[0] || "")


        // Auto calculate age
        const age = calculateAge(resp.data.data.dOBDate?.split("T")[0] || "");
        Formik.setFieldValue("age", age);
        Formik.setFieldValue("phoneno", resp.data.data?.phoneno)


        setEditId(resp.data.data._id);
        setTab(0); // open Create Receipt tab
      })
      .catch((e) => {
        console.log("Error  in fetching edit data.");
      });
  };

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

  const cancelEdit = () => {
    setEdit(false);
    setSelectedYear(null);
    Formik.resetForm()
  };

  //   CLEARING IMAGE FILE REFENCE FROM INPUT
  const fileInputRef = useRef(null);
  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    setFile(null); // Reset the file state
    setImageUrl(null); // Clear the image preview
  };


  //   MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const resetMessage = () => {
    setMessage("");
  };

  const initialValues = {
    email: "",
    name: "",
    teacher_code: "",
    qualification: "",
    gender: "",
    age: "",
    password: "",
    year: "",
    dOBDate: "",
    joinDate: "",
    phoneno: "",
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: teacherSchema,
    onSubmit: (values) => {
      console.log("teacher calls admin Formik values", values);
      if (isEdit) {

        const fd = new FormData();
        Object.keys(values).forEach((key) => fd.append(key, values[key]));
        if (file) {
          fd.append("image", file, file.name);
        }

        axios
          .patch(`${baseUrl}/teacher/update/${editId}`, fd)
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
        if (file) {
          
          const fd = new FormData();
          fd.append("image", file, file.name);
          Object.keys(values).forEach((key) => fd.append(key, values[key]));

          axios
            .post(`${baseUrl}/teacher/register`, fd)
            .then((resp) => {
              console.log("Response after submitting admin teacher", resp);
              setMessage(resp.data.message);
              setType("success");
              handleClearFile()
              cancelEdit();
              setTab(1); // go to View List
            })
            .catch((e) => {
              setMessage(e.response.data.message);
              setType("error");
              console.log("Error, response admin teacher calls", e);
            });
          Formik.resetForm();
          setFile(null);
        } else {
          setMessage("Please provide image.");
          setType("error");
        }
      }
    },
  });

  const [month, setMonth] = useState([]);
  const [year, setYear] = useState([]);



  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}-${year + 1}`, value: year };
  });

  const viewUploadFile = (fileName) => {

    const fileUrl = `${fileName}`;
    window.open(fileUrl, "_blank", "noopener,noreferrer");


  };

  const fetchteachers = () => {
    axios
      .get(`${baseUrl}/teacher/fetch-with-query`, { params: params })
      .then((resp) => {
        console.log("Fetching data in  teacher Calls  admin.", resp);
        setteachers(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching teacher calls admin data", e);
      });
  };
  useEffect(() => {
    fetchteachers();

  }, [message, params]);
  return (
    <>
      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      <Box

      >

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            {/* <Tab label="Create Receipt" /> */}
            <Tab label={isEdit ? "Edit Teacher" : "Add New Teacher"} />
            <Tab label="View List" />
          </Tabs>
        </Box>


        {tab === 0 && (
          <Box component={"div"}>
            <Paper
              sx={{ padding: "20px", margin: "10px" }}
            >

              <Box component="form" onSubmit={Formik.handleSubmit}>
                <Grid container spacing={2}>

                  {/* IMAGE FULL WIDTH */}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="h6">Teacher Pic</Typography>

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
                          sx={{ width: 120, height: 120 }}
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* EMAIL */}
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

                  {/* NAME */}
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


                   {/* teacher_code */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      disabled={isEdit}
                      fullWidth
                      label="teacher_code"
                      name="teacher_code"
                      value={Formik.values.teacher_code}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />
                    {Formik.touched.teacher_code && Formik.errors.teacher_code && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.teacher_code}
                      </p>
                    )}
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
                    {Formik.touched.qualification && Formik.errors.qualification && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
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
                      <p style={{ color: "red", textTransform: "capitalize" }}>
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
                      InputLabelProps={{ shrink: true }}
                      value={Formik.values.dOBDate}
                      onChange={(e) => {
                        const dob = e.target.value;
                        Formik.setFieldValue("dOBDate", dob);

                        const age = calculateAge(dob);
                        Formik.setFieldValue("age", age);
                      }}
                    />

                    {Formik.touched.dOBDate && Formik.errors.dOBDate && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
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
                    {Formik.touched.age && Formik.errors.age && (
                      <Typography color="error" variant="caption">
                        {Formik.errors.age}
                      </Typography>
                    )}
                  </Grid>

                  {/* JOIN DATE */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="joinDate"
                      label="Join Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={Formik.values.joinDate}
                      onChange={Formik.handleChange}
                    />
                    {Formik.touched.joinDate && Formik.errors.joinDate && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.joinDate}
                      </p>
                    )}
                  </Grid>

                  {/* phoneno */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="phoneno"
                      name="phoneno"
                      value={Formik.values.phoneno}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />
                    {/* {Formik.touched.phoneno && Formik.errors.phoneno && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.phoneno}
                      </p>
                    )} */}
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
                          error={Formik.touched.year && Boolean(Formik.errors.year)}
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
                        <p style={{ color: "red", textTransform: "capitalize" }}>
                          {Formik.errors.password}
                        </p>
                      )}
                    </Grid>
                  )}

                  {/* BUTTONS FULL WIDTH */}
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

        

        {tab === 1 && (
          <Box>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row">Name</TableCell>
                    <TableCell align="right">Code</TableCell>
                    <TableCell align="right">Email</TableCell>
                    <TableCell align="right">dOBDate</TableCell>
                    <TableCell align="right">JoinDate</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teachers.map((value, i) => (
                    <TableRow
                      key={i}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {value.name}
                      </TableCell>
                      <TableCell align="right">{value?.teacher_code}</TableCell>
                      <TableCell align="right">{value?.email}</TableCell>
                      <TableCell align="right">{dayjs(value?.dOBDate).format("DD/MM/YYYY")}</TableCell>
                      <TableCell align="right">{dayjs(value?.joinDate).format("DD/MM/YYYY")}</TableCell>
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

                          <Button
                            variant="contained"
                            sx={{ background: "skyblue", color: "#000" }}
                            onClick={() => viewUploadFile(value?.teacher_image)}
                          >
                            View Pic
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
