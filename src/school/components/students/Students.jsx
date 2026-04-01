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
  Tabs, Tab,
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
import { studentSchema } from "../../../yupSchema/studentSchema";
import StudentCardAdmin from "../../utility components/student card/StudentCard";
import dayjs from "dayjs";

export default function Students() {
  const [studentClass, setStudentClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [section, setSection] = useState([])
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [parent, setParent] = useState([])
  const [selectedParent, setSelectedParent] = useState(null);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // Independent state for image preview
  const [selectedYear, setSelectedYear] = useState(null);

  const [tab, setTab] = useState(0);


  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}-${year + 1}`, value: year };
  });

  // Handle image file selection
  const addImage = (event) => {
    const selectedFile = event.target.files[0];
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

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/student/delete/${id}`)
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
      .get(`${baseUrl}/student/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;
        const classId = data?.student_class?._id || data.student_class;
        const matchedClass = studentClass.find(c => c._id === classId);
        setSelectedClass(matchedClass || null);

        const sectionId = data?.section?._id || data.section;
        const matchedSection = section.find(c => c._id === sectionId);
        setSelectedSection(matchedSection || null);

        const parentId = data?.parent?._id || data.parent;
        const matchedParent = parent.find(c => c._id === parentId);
        setSelectedParent(matchedParent || null);


        // Formik.setFieldValue("year", resp.data.data.year);

        const matchedYear = years.find(s => s.value === resp.data.data.year);
        setSelectedYear(matchedYear || null);

        // Auto calculate age
        const age = calculateAge(data.dOBDate?.split("T")[0] || "");
        

        Formik.setValues({
          email: data.email,
          name: data.name,
          student_code: data.student_code||"",
          student_class: data.student_class._id,
          section: data.section._id,
          parent: data.parent._id,
          gender: data.gender,
          age: age,
          guardian: data.guardian,
          guardian_phone: data.guardian_phone,
          password: data.password,
          year: data.year,
          dOBDate: data.dOBDate?.split("T")[0] || "",
          joinDate: data.joinDate?.split("T")[0] || "",
          password: data.password,

        });
        setImageUrl(data.image); // Assuming response has `image` URL field for preview
        setEditId(data._id);
        setTab(0); // open Create Receipt tab
      })
      .catch((e) => {
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
    setSelectedYear(null);
  };

  const handleNumberSeq = (id) => {
    setEdit(true);
    axios
      .get(`${baseUrl}/numberseq/fetch-sequence/${id}`)
      .then((resp) => {
        const data = resp.data.data;
        const classId = data?.student_class?._id || data.student_class;
        const matchedClass = studentClass.find(c => c._id === classId);
        setSelectedClass(matchedClass || null);

        const sectionId = data?.section?._id || data.section;
        const matchedSection = section.find(c => c._id === sectionId);
        setSelectedSection(matchedSection || null);

        const parentId = data?.parent?._id || data.parent;
        const matchedParent = parent.find(c => c._id === parentId);
        setSelectedParent(matchedParent || null);


        // Formik.setFieldValue("year", resp.data.data.year);

        const matchedYear = years.find(s => s.value === resp.data.data.year);
        setSelectedYear(matchedYear || null);

        // Auto calculate age
        const age = calculateAge(data.dOBDate?.split("T")[0] || "");
        

        Formik.setValues({
          email: data.email,
          name: data.name,
          student_class: data.student_class._id,
          section: data.section._id,
          parent: data.parent._id,
          gender: data.gender,
          age: age,
          guardian: data.guardian,
          guardian_phone: data.guardian_phone,
          password: data.password,
          year: data.year,
          dOBDate: data.dOBDate?.split("T")[0] || "",
          joinDate: data.joinDate?.split("T")[0] || "",
          password: data.password,

        });
        setImageUrl(data.image); // Assuming response has `image` URL field for preview
        setEditId(data._id);
        setTab(0); // open Create Receipt tab
      })
      .catch((e) => {
        console.log("Error in fetching edit data.");

      });
    // .catch(() => console.log("Error in fetching edit data."));

  };

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const resetMessage = () => setMessage("");

  const initialValues = {
    name: "",
    student_code:"",
    email: "",
    student_class: "",
    section: "",
    parent: "",
    gender: "",
    age: "",
    guardian: "",
    guardian_phone: "",
    password: "",
    year: "",
    dOBDate: "",
    joinDate: "",
  };

  const Formik = useFormik({
    initialValues,
    validationSchema: studentSchema,
    onSubmit: (values) => {
      values.student_class = selectedClass?._id;
      values.section = selectedSection?._id;
      values.parent = selectedParent?._id;
      if (isEdit) {
        const fd = new FormData();
        Object.keys(values).forEach((key) => fd.append(key, values[key]));
        if (file) {
          fd.append("image", file, file.name);
        }

        axios
          .patch(`${baseUrl}/student/update/${editId}`, fd)
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
            .post(`${baseUrl}/student/register`, fd)
            .then((resp) => {
              setMessage(resp.data.message);
              setType("success");
              Formik.resetForm();
              handleClearFile();
              setParams({});
              setTab(1); // go to View List
            })
            .catch((e) => {
              setMessage(e.response.data.message);
              setType("error");
            });
        } else {
          setMessage("Please provide an image.");
          setType("error");
        }
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


  const fetchStudentClass = () => {
    axios
      .get(`${baseUrl}/class/fetch-all`)
      .then((resp) => {
        setStudentClass(resp.data.data);
      })
      .catch(() => console.log("Error in fetching student Class"));
  };

  const fetchSection = async () => {
    try {
      const sections = await axios.get(`${baseUrl}/section/fetch-all`);
      console.log("sections", sections)
      setSection(sections.data.data);

    } catch (error) {
      console.error('Error fetching sections or checking sections:', error);
    }
  };

  const fetchParent = async () => {
    try {
      const parents = await axios.get(`${baseUrl}/parent/fetch-all`);
      console.log("parents", parents)
      setParent(parents.data.data);

    } catch (error) {
      console.error('Error fetching parents or checking parents:', error);
    }
  };


  const fetchStudents = () => {
    axios
      .get(`${baseUrl}/student/fetch-with-query`, { params })
      .then((resp) => {
        setStudents(resp.data.data);
      })
      .catch(() => console.log("Error in fetching students data"));
  };

  useEffect(() => {
    fetchSection();
    fetchStudents();
    fetchParent();
    fetchStudentClass();
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
  return (
    <>
      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}
      <Box sx={{ padding: "40px 10px 20px 10px" }}>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            {/* <Tab label="Create Receipt" /> */}
            <Tab label={isEdit ? "Edit Student" : "Add New Student"} />
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

                  {/* Student Image Full Row */}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="h6">Student Pic</Typography>

                      <TextField
                        type="file"
                        name="file"
                        onChange={addImage}
                        inputRef={fileInputRef}
                      />

                      {imageUrl && (
                        <CardMedia component="img" image={imageUrl} sx={{ width: 120, height: 120 }} />
                      )}
                    </Box>
                  </Grid>

                  {/* Email */}
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
                      label="student_code"
                      name="student_code"
                      value={Formik.values.student_code}
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

                  {/* Class */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={studentClass}
                      getOptionLabel={(option) => option.class_name}
                      value={selectedClass}
                      onChange={(e, newValue) => {
                        setSelectedClass(newValue);
                        Formik.setFieldValue("student_class", newValue?._id || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Class"
                          placeholder="Search class..."
                          fullWidth
                          error={Formik.touched.student_class && Boolean(Formik.errors.student_class)}
                          helperText={Formik.touched.student_class && Formik.errors.student_class}
                        />
                      )}

                    />

                  </Grid>

                  {/* Section */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={section}
                      getOptionLabel={(option) => option.section_name}
                      value={selectedSection}
                      onChange={(e, newValue) => {
                        setSelectedSection(newValue);
                        Formik.setFieldValue("section", newValue?._id || "");
                      }}
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
                  </Grid>

                  {/* Parent */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={parent}
                      getOptionLabel={(option) => option.name}
                      value={selectedParent}
                      onChange={(e, newValue) => {
                        setSelectedParent(newValue);
                        Formik.setFieldValue("parent", newValue?._id || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Parent"
                          placeholder="Search parent..."
                          fullWidth
                          error={Formik.touched.parent && Boolean(Formik.errors.parent)}
                          helperText={Formik.touched.parent && Formik.errors.parent}
                        />
                      )}
                    />
                  </Grid>

                  {/* Gender */}
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

                  {/* dOBDate */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="dOBDate"
                      label="dOBDate"
                      type="date"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={Formik.values.dOBDate}
                      // onChange={Formik.handleChange}
                      onChange={(e) => {
                        const dob = e.target.value;

                        Formik.setFieldValue("dOBDate", dob);

                        // Auto calculate age
                        const age = calculateAge(dob);
                        Formik.setFieldValue("age", age);
                      }}
                      onBlur={Formik.handleBlur}


                    />
                    {Formik.touched.dOBDate && Formik.errors.dOBDate && (
                      <Typography color="error" variant="caption">
                        {Formik.errors.dOBDate}
                      </Typography>
                    )}
                  </Grid>



                  {/* Age */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Age"
                      name="age"
                      value={Formik.values.age}
                      onChange={Formik.handleChange}
                      disabled
                    />

                    {Formik.touched.age && Formik.errors.age && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.age}
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

                  {/* Academic Year */}
                  <Grid item xs={12} md={6}>
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
                  </Grid>

                  {/* Guardian */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Guardian"
                      name="guardian"
                      value={Formik.values.guardian}
                      onChange={Formik.handleChange}
                    />
                    {Formik.touched.guardian && Formik.errors.guardian && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.guardian}
                      </p>
                    )}
                  </Grid>

                  {/* Guardian Phone */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Guardian Phone"
                      name="guardian_phone"
                      value={Formik.values.guardian_phone}
                      onChange={Formik.handleChange}
                    />
                    {Formik.touched.guardian_phone && Formik.errors.guardian_phone && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.guardian_phone}
                      </p>
                    )}
                  </Grid>

                  {/* Password */}
                  {!isEdit && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Password"
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

                  {/* Buttons Full Row */}
                  <Grid item xs={12}>
                    <Button type="submit" fullWidth variant="contained">
                      {isEdit ? "Update Student" : "Register Student"}
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
                padding: "5px",
                minWidth: 120,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >



              <TextField
                id=""
                label="Search Name  .. "
                onChange={handleSearch}
              />
            </Box>

            <Box sx={{ padding: "40px", display: "flex", flexWrap: "wrap" }}>
              {students.length > 0 &&
                students.map((value, i) => (
                  <StudentCardAdmin
                    key={i}
                    student={value}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                  />
                ))}
            </Box>
          </Box>
        )}




      </Box>
    </>
  );
}
