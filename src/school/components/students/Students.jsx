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
} from "@mui/material";
import { useFormik } from "formik";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { studentSchema } from "../../../yupSchema/studentSchema";
import StudentCardAdmin from "../../utility components/student card/StudentCard";

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

  // Handle image file selection
  const addImage = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const [params, setParams] = useState({});
  const handleClass = (e) => {
    setParams((prevParams) => ({
      ...prevParams,
      student_class: e.target.value || undefined,
    }));
  };

  const handleSearch = (e) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: e.target.value || undefined,
    }));
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


        Formik.setValues({
          email: data.email,
          name: data.name,
          student_class: data.student_class._id,
          section: data.section._id,
          parent: data.parent._id,
          gender: data.gender,
          age: data.age,
          guardian: data.guardian,
          guardian_phone: data.guardian_phone,
          password: data.password,
        });
        setImageUrl(data.image); // Assuming response has `image` URL field for preview
        setEditId(data._id);
      })
      .catch(() => console.log("Error in fetching edit data."));
  };

  const cancelEdit = () => {
    setEdit(false);
    Formik.resetForm();
    setSelectedClass(null);
    setSelectedSection(null);
    setSelectedParent(null);
  };

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const resetMessage = () => setMessage("");

  const initialValues = {
    name: "",
    email: "",
    student_class: "",
    section: "",
    parent: "",
    gender: "",
    age: "",
    guardian: "",
    guardian_phone: "",
    password: "",
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


        <Box sx={{ padding: "40px" }}>
          <Paper sx={{ padding: "20px", margin: "10px" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: "800", textAlign: "center" }}
            >
              {isEdit ? "Edit Student" : "Add New Student"}
            </Typography>

            <Box
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={Formik.handleSubmit}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ marginRight: "50px" }} variant="h4">
                  Student Pic
                </Typography>
                <TextField
                  sx={{ marginTop: "10px" }}
                  id="filled-basic"
                  variant="outlined"
                  name="file"
                  type="file"
                  onChange={addImage}
                  inputRef={fileInputRef}
                />

                {imageUrl && (
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      image={imageUrl}
                      height="240px"
                    />
                  </Box>
                )}
              </Box>

              
              {/* Other input fields go here */}
              <TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="email "
                variant="outlined"
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

              <TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="name "
                variant="outlined"
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


              {/* Class */}
              {studentClass.length > 0 && (
                <Box>
                  <Autocomplete
                    options={studentClass}
                    getOptionLabel={(option) => option.class_text}
                    value={selectedClass}
                    // onChange={(event, newValue) => setSelectedClass(newValue)}
                    onChange={(event, newValue) => {
                      setSelectedClass(newValue);
                      
                      Formik.setFieldValue(
                              "student_class",
                              newValue ? newValue._id : ""
                            );
                      
                    }}
                    //  onBlur={Formik.handleBlur}
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
                  {/* {Formik.touched.student_class && Formik.errors.student_class && (
                    <Typography color="error" variant="caption">
                      {Formik.errors.student_class}
                    </Typography>
                  )} */}
                </Box>
              )}

              {/* Section */}
              {section.length > 0 && (
                <Box>
                  <Autocomplete
                    options={section}
                    getOptionLabel={(option) => option.section_name}
                    value={selectedSection}
                    // onChange={(event, newValue) => setSelectedSection(newValue)}
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
                  {/* {Formik.touched.section && Formik.errors.section && (
                    <Typography color="error" variant="caption">
                      {Formik.errors.section}
                    </Typography>
                  )} */}
                </Box>
              )}

              {/* Parent */}
              {parent.length > 0 && (
                <Box>
                  <Autocomplete
                    options={parent}
                    getOptionLabel={(option) => option.name}
                    value={selectedParent}
                    // onChange={(event, newValue) => setSelectedParent(newValue)}
                    onChange={(event, newValue) => {
                      setSelectedParent(newValue);
                      
                      
                      Formik.setFieldValue(
                              "parent",
                              newValue ? newValue._id : ""
                            );
                    }}
                    //  onBlur={Formik.handleBlur}
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
                  {/* {Formik.touched.parent && Formik.errors.parent && (
                    <Typography color="error" variant="caption">
                      {Formik.errors.parent}
                    </Typography>
                  )} */}
                </Box>
              )}

              <br />
              <FormControl sx={{ minWidth: "220px", marginTop: "10px" }}>
                <InputLabel id="demo-simple-select-label">Gender</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Gender"
                  name="gender"
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                  value={Formik.values.gender}
                >
                  <MenuItem value={""}>Select Gender</MenuItem>
                  <MenuItem value={"male"}>Male</MenuItem>
                  <MenuItem value={"female"}>Female</MenuItem>
                  <MenuItem value={"other"}>Other</MenuItem>
                </Select>
              </FormControl>
              {Formik.touched.gender && Formik.errors.gender && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {Formik.errors.gender}
                </p>
              )}

              <TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="Age "
                variant="outlined"
                name="age"
                value={Formik.values.age}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
              />
              {Formik.touched.age && Formik.errors.age && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {Formik.errors.age}
                </p>
              )}

              <TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="Guardian "
                variant="outlined"
                name="guardian"
                value={Formik.values.guardian}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
              />
              {Formik.touched.guardian && Formik.errors.guardian && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {Formik.errors.guardian}
                </p>
              )}

              <TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="Guardian Phone "
                variant="outlined"
                name="guardian_phone"
                value={Formik.values.guardian_phone}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
              />
              {Formik.touched.guardian_phone &&
                Formik.errors.guardian_phone && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.guardian_phone}
                  </p>
                )}

              {!isEdit && (
                <>
                  <TextField
                    fullWidth
                    sx={{ marginTop: "10px" }}
                    id="filled-basic"
                    label="Password "
                    variant="outlined"
                    name="password"
                    value={Formik.values.password}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />
                  {Formik.touched.password && Formik.errors.password && (
                    <p style={{ color: "red", textTransform: "capitalize" }}>
                      {Formik.errors.password}
                    </p>
                  )}
                </>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ marginTop: "10px" }}
              >
                {isEdit ? "Update Student" : "Register Student"}
              </Button>
              {isEdit && (
                <Button
                  fullWidth
                  onClick={cancelEdit}
                  variant="outlined"
                  sx={{ marginTop: "10px" }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Paper>
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
    </>
  );
}
