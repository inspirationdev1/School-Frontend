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
import { studentSchema } from "../../../yupSchema/studentSchema";
import StudentCardAdmin from "../../utility components/student card/StudentCard";
import dayjs from "dayjs";

export default function Students() {
  const [studentClass, setStudentClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [section, setSection] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [parent, setParent] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // Independent state for image preview
  const [selectedYear, setSelectedYear] = useState(null);

  const [vaccinatedArray, setVaccinatedArray] = useState([]);
  const [selectedVaccinated, setSelectedVaccinated] = useState(null);

  const [previouslyappliedArray, setPreviouslyappliedArray] = useState([]);
  const [selectedpreviouslyapplied, setSelectedpreviouslyapplied] = useState(null);


  const [dataError, setDataError] = useState('');

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

  const [noofstudents, setNoofstudents] = useState(0);


  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: `${year}-${year + 1}`, value: year };
  });

  const fetchVaccinated = async () => {
    try {
      const fieldData = [{ fieldId: "yes", fieldValue: "Yes" },
      { fieldId: "no", fieldValue: "No" },
      ];

      setVaccinatedArray(fieldData);

    } catch (error) {
      console.error('Error fetching vaccinated:', error);
    }
  };

  const fetchpreviouslyapplied = async () => {
    try {
      const fieldData = [{ fieldId: "yes", fieldValue: "Yes" },
      { fieldId: "no", fieldValue: "No" },
      ];

      setPreviouslyappliedArray(fieldData);

    } catch (error) {
      console.error('Error fetching vaccinated:', error);
    }
  };

  const viewUploadFile = (fileName) => {
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
        const matchedClass = studentClass.find((c) => c._id === classId);
        setSelectedClass(matchedClass || null);

        const sectionId = data?.section?._id || data.section;
        const matchedSection = section.find((c) => c._id === sectionId);
        setSelectedSection(matchedSection || null);

        const parentId = data?.parent?._id || data.parent;
        const matchedParent = parent.find((c) => c._id === parentId);
        setSelectedParent(matchedParent || null);

        // Formik.setFieldValue("year", resp.data.data.year);

        const matchedYear = years.find((s) => s.value === resp.data.data.year);
        setSelectedYear(matchedYear || null);

        const matchedVaccinated = vaccinatedArray.find((s) => s.fieldId === resp.data.data?.vaccinated);
        setSelectedVaccinated(matchedVaccinated || null);

        // Auto calculate age
        const age = calculateAge(data.dOBDate?.split("T")[0] || "");

        setSelectedbloodgroup(data?.bloodgroup || null);
        setSelectednationality(data?.nationality || null);

        setSelectedreligion(data?.religion || null);
        setSelectedmothertongue(data?.mothertongue || null);
        setSelectedmodeoftransport(data?.modeoftransport || null);
        setSelectedfirstlanguage(data?.firstlanguage || null);


        const matchedPreviouslyapplied = previouslyappliedArray.find((s) => s.fieldValue === resp.data.data?.previouslyapplied);
        setSelectedpreviouslyapplied(matchedPreviouslyapplied || null);


        Formik.setValues({
          email: data.email,
          name: data.name,
          student_code: data.student_code || "",
          student_class: data.student_class._id,
          section: data.section._id,
          parent: data.parent._id,
          gender: data.gender,
          age: age,
          guardian: data.guardian,
          guardian_phone: data.guardian_phone,
          pen_no: data?.pen_no,
          aadhar_no: data?.aadhar_no,
          admission_no: data?.admission_no,
          password: data.password,
          year: data.year,
          bloodgroup: data?.bloodgroup?._id || "",
          nationality: data?.nationality?._id || "",
          vaccinated: data?.vaccinated || "",
          religion: data?.religion?._id || "",
          mothertongue: data?.mothertongue?._id || "",
          modeoftransport: data?.modeoftransport?._id || "",
          firstlanguage: data?.firstlanguage?._id || "",

          identificationmark1: data?.identificationmark1 || "",
          identificationmark2: data?.identificationmark2 || "",
          permanentaddress: data?.permanentaddress || "",
          permanentpincode: data?.permanentpincode || "",
          presentaddress: data?.presentaddress || "",
          presentpincode: data?.presentpincode || "",
          nameofpreviousschool: data?.nameofpreviousschool || "",
          classpassed: data?.classpassed || "",
          yearofpassing: data?.yearofpassing || "",
          reasonforleaving: data?.reasonforleaving || "",
          studentexpelledleaving: data?.studentexpelledleaving || "",
          mediumofinstructions: data?.mediumofinstructions || "",

          siblingstudingname: data?.siblingstudingname || "",
          siblingapplyingname: data?.siblingapplyingname || "",
          siblingstudingclass: data?.siblingstudingclass || "",
          siblingapplyingclass: data?.siblingapplyingclass || "",
          previouslyapplied: data?.previouslyapplied || "",
          admissionintoclass: data?.admissionintoclass || "",
          dateofaddmission: data.dateofaddmission?.split("T")[0] || "",


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
    setSelectedbloodgroup(null);
    setSelectednationality(null);
    setSelectedYear(null);
    setSelectedVaccinated(null);

    setSelectedreligion(null);
    setSelectedmothertongue(null);
    setSelectedmodeoftransport(null);
    setSelectedfirstlanguage(null);
  };

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const resetMessage = () => setMessage("");

  const initialValues = {
    name: "",
    student_code: "",
    email: "",
    student_class: "",
    section: "",
    parent: "",
    gender: "",
    age: "",
    guardian: "",
    guardian_phone: "",
    pen_no: "",
    aadhar_no: "",
    admission_no: "",
    password: "",
    year: "",
    dOBDate: "",
    joinDate: "",
    bloodgroup: "",
    nationality: "",
    vaccinated: "",
    religion: "",
    mothertongue: "",
    modeoftransport: "",
    firstlanguage: "",
    identificationmark1: "",
    identificationmark2: "",
    permanentaddress: "",
    permanentpincode: "",
    presentaddress: "",
    presentpincode: "",
    nameofpreviousschool: "",
    classpassed: "",
    yearofpassing: "",
    reasonforleaving: "",
    studentexpelledleaving: "",
    mediumofinstructions: "",
    siblingstudingname: "",
    siblingapplyingname: "",
    siblingstudingclass: "",
    siblingapplyingclass: "",
    previouslyapplied: "",
    admissionintoclass: "",
    dateofaddmission: "",

  };

  const Formik = useFormik({
    initialValues,
    validationSchema: studentSchema,
    onSubmit: (values) => {


      if (!selectedbloodgroup) {
        setMessage("Select Bloodgroup on Tab-2");
        setType("error");
        return;
      }

      if (!selectednationality) {
        setMessage("Select Nationality on Tab-2");
        setType("error");
        return;
      }

      if (!selectedreligion) {
        setMessage("Select religion on Tab-2");
        setType("error");
        return;
      }

      if (!selectedmothertongue) {
        setMessage("Select mothertongue on Tab-2");
        setType("error");
        return;
      }

      if (!selectedmodeoftransport) {
        setMessage("Select modeoftransport on Tab-2");
        setType("error");
        return;
      }

      if (!selectedfirstlanguage) {
        setMessage("Select firstlanguage on Tab-2");
        setType("error");
        return;
      }



      values.student_class = selectedClass?._id;
      values.section = selectedSection?._id;
      values.parent = selectedParent?._id;
      values.bloodgroup = selectedbloodgroup?._id;
      values.vaccinated = selectedVaccinated?.fieldId;
      values.nationality = selectednationality?._id;
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
            setTab(3); // go to View List
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
              cancelEdit();
              setTab(3); // go to View List
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
      console.log("sections", sections);
      setSection(sections.data.data);
    } catch (error) {
      console.error("Error fetching sections or checking sections:", error);
    }
  };

  const fetchParent = async () => {
    try {
      const parents = await axios.get(`${baseUrl}/parent/fetch-all`);
      console.log("parents", parents);
      setParent(parents.data.data);
    } catch (error) {
      console.error("Error fetching parents or checking parents:", error);
    }
  };

  const fetchStudents = () => {
    axios
      .get(`${baseUrl}/student/fetch-with-query`, { params })
      .then((resp) => {
        setStudents(resp.data.data);
        setNoofstudents(resp.data.data.length);
      })
      .catch(() => console.log("Error in fetching students data"));
  };

  const fetchbloodgroups = () => {
    const params = {
      generalmaster_type: "bloodgroup",
    };
    axios
      .get(`${baseUrl}/generalmaster/fetch-with-query`, { params: params })
      .then((resp) => {
        console.log("Fetching data in  generalmaster Calls  admin.", resp);
        setBloodgroups(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching generalmaster calls admin data", e);
      });
  };

  const fetchnationalities = () => {
    const params = {
      generalmaster_type: "nationality",
    };
    axios
      .get(`${baseUrl}/generalmaster/fetch-with-query`, { params: params })
      .then((resp) => {
        console.log("Fetching data in  generalmaster Calls  admin.", resp);
        setNationalities(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching generalmaster calls admin data", e);
      });
  };


  const fetchreligions = () => {
    const params = {
      generalmaster_type: "religion",
    };
    axios
      .get(`${baseUrl}/generalmaster/fetch-with-query`, { params: params })
      .then((resp) => {
        console.log("Fetching data in  generalmaster Calls  admin.", resp);
        setReligions(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching generalmaster calls admin data", e);
      });
  };

  const fetchlanguages = () => {
    const params = {
      generalmaster_type: "language",
    };
    axios
      .get(`${baseUrl}/generalmaster/fetch-with-query`, { params: params })
      .then((resp) => {
        console.log("Fetching data in  generalmaster Calls  admin.", resp);
        setLanguages(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching generalmaster calls admin data", e);
      });
  };

  const fetchmodeoftransports = () => {
    const params = {
      generalmaster_type: "modeoftransport",
    };
    axios
      .get(`${baseUrl}/generalmaster/fetch-with-query`, { params: params })
      .then((resp) => {
        console.log("Fetching data in  generalmaster Calls  admin.", resp);
        setModeoftransports(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching generalmaster calls admin data", e);
      });
  };


  useEffect(() => {
    fetchSection();
    fetchStudents();
    fetchParent();
    fetchStudentClass();
    fetchbloodgroups();
    fetchVaccinated();
    fetchnationalities();
    fetchreligions();
    fetchlanguages();
    fetchmodeoftransports();
    fetchpreviouslyapplied();
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
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            {/* <Tab label="Create Receipt" /> */}
            <Tab label={isEdit ? "Edit Student-1" : "Add New Student-1"} />
            <Tab label={isEdit ? "Edit Student-2" : "Add New Student-2"} />
            <Tab label={isEdit ? "Edit Student-3" : "Add New Student-3"} />
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
                        Formik.setFieldValue(
                          "student_class",
                          newValue?._id || "",
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Class"
                          placeholder="Search class..."
                          fullWidth
                          error={
                            Formik.touched.student_class &&
                            Boolean(Formik.errors.student_class)
                          }
                          helperText={
                            Formik.touched.student_class &&
                            Formik.errors.student_class
                          }
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
                          error={
                            Formik.touched.section &&
                            Boolean(Formik.errors.section)
                          }
                          helperText={
                            Formik.touched.section && Formik.errors.section
                          }
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
                          error={
                            Formik.touched.parent &&
                            Boolean(Formik.errors.parent)
                          }
                          helperText={
                            Formik.touched.parent && Formik.errors.parent
                          }
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
                      disabled={isEdit}
                      options={years}
                      getOptionLabel={(option) => option.label}
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
                    {Formik.touched.guardian_phone &&
                      Formik.errors.guardian_phone && (
                        <p
                          style={{ color: "red", textTransform: "capitalize" }}
                        >
                          {Formik.errors.guardian_phone}
                        </p>
                      )}
                  </Grid>

                  {/* pen_no */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="pen_no"
                      name="pen_no"
                      value={Formik.values.pen_no}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.pen_no && Formik.errors.pen_no && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.pen_no}
                      </p>
                    )} */}
                  </Grid>

                  {/* aadhar_no */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="aadhar_no"
                      name="aadhar_no"
                      value={Formik.values.aadhar_no}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.aadhar_no && Formik.errors.aadhar_no && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.aadhar_no}
                      </p>
                    )} */}
                  </Grid>

                  {/* admission_no */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="admission_no"
                      name="admission_no"
                      value={Formik.values.admission_no}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.admission_no && Formik.errors.admission_no && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.admission_no}
                      </p>
                    )} */}
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
                        <p
                          style={{ color: "red", textTransform: "capitalize" }}
                        >
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
            <Paper sx={{ padding: "20px", margin: "10px" }}>
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                <Grid container spacing={2}>
                  {/* Bloodgroup */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={bloodgroups}
                      getOptionLabel={(option) => option.generalmaster_name}
                      value={selectedbloodgroup}
                      onChange={(e, newValue) => {
                        setSelectedbloodgroup(newValue);
                        Formik.setFieldValue("bloodgroup", newValue?._id || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Bloodgroup"
                          placeholder="Search bloodgroup..."
                          fullWidth
                          error={
                            Formik.touched.bloodgroup &&
                            Boolean(Formik.errors.bloodgroup)
                          }
                          helperText={
                            Formik.touched.bloodgroup && Formik.errors.bloodgroup
                          }
                        />
                      )}
                    />
                  </Grid>

                  {/* Vaccinated */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={vaccinatedArray}
                      getOptionLabel={(option) => option.fieldValue}
                      value={selectedVaccinated}
                      onChange={(event, newValue) => {
                        setSelectedVaccinated(newValue);

                        Formik.setFieldValue(
                          "vaccinated",
                          newValue ? newValue.fieldValue : "",
                        );
                      }}
                      onBlur={() => Formik.setFieldTouched("vaccinated", true)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select vaccinated"
                          placeholder="Search vaccinated..."
                          fullWidth
                        // error={
                        //   Formik.touched.vaccinated && Boolean(Formik.errors.vaccinated)
                        // }
                        // helperText={Formik.touched.vaccinated && Formik.errors.vaccinated}
                        />
                      )}
                    />
                  </Grid>

                  {/* Nationality */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={nationalities}
                      getOptionLabel={(option) => option.generalmaster_name}
                      value={selectednationality}
                      onChange={(e, newValue) => {
                        setSelectednationality(newValue);
                        Formik.setFieldValue("nationality", newValue?._id || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select nationality"
                          placeholder="Search nationality..."
                          fullWidth
                          error={
                            Formik.touched.nationality &&
                            Boolean(Formik.errors.nationality)
                          }
                          helperText={
                            Formik.touched.nationality && Formik.errors.nationality
                          }
                        />
                      )}
                    />
                  </Grid>


                  {/* religion */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={religions}
                      getOptionLabel={(option) => option.generalmaster_name}
                      value={selectedreligion}
                      onChange={(e, newValue) => {
                        setSelectedreligion(newValue);
                        Formik.setFieldValue("religion", newValue?._id || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select religion"
                          placeholder="Search religion..."
                          fullWidth
                          error={
                            Formik.touched.religion &&
                            Boolean(Formik.errors.religion)
                          }
                          helperText={
                            Formik.touched.religion && Formik.errors.religion
                          }
                        />
                      )}
                    />
                  </Grid>

                  {/* mothertongue */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={languages}
                      getOptionLabel={(option) => option.generalmaster_name}
                      value={selectedmothertongue}
                      onChange={(e, newValue) => {
                        setSelectedmothertongue(newValue);
                        Formik.setFieldValue("mothertongue", newValue?._id || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select mothertongue"
                          placeholder="Search mothertongue..."
                          fullWidth
                          error={
                            Formik.touched.mothertongue &&
                            Boolean(Formik.errors.mothertongue)
                          }
                          helperText={
                            Formik.touched.mothertongue && Formik.errors.mothertongue
                          }
                        />
                      )}
                    />
                  </Grid>

                  {/* modeoftransport */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={modeoftransports}
                      getOptionLabel={(option) => option.generalmaster_name}
                      value={selectedmodeoftransport}
                      onChange={(e, newValue) => {
                        setSelectedmodeoftransport(newValue);
                        Formik.setFieldValue("modeoftransport", newValue?._id || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select modeoftransport"
                          placeholder="Search modeoftransport..."
                          fullWidth
                          error={
                            Formik.touched.modeoftransport &&
                            Boolean(Formik.errors.modeoftransport)
                          }
                          helperText={
                            Formik.touched.modeoftransport && Formik.errors.modeoftransport
                          }
                        />
                      )}
                    />
                  </Grid>

                  {/* firstlanguage */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={languages}
                      getOptionLabel={(option) => option.generalmaster_name}
                      value={selectedfirstlanguage}
                      onChange={(e, newValue) => {
                        setSelectedfirstlanguage(newValue);
                        Formik.setFieldValue("firstlanguage", newValue?._id || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select firstlanguage"
                          placeholder="Search firstlanguage..."
                          fullWidth
                          error={
                            Formik.touched.firstlanguage &&
                            Boolean(Formik.errors.firstlanguage)
                          }
                          helperText={
                            Formik.touched.firstlanguage && Formik.errors.firstlanguage
                          }
                        />
                      )}
                    />
                  </Grid>


                  {/* identificationmark1 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="identificationmark1"
                      name="identificationmark1"
                      value={Formik.values.identificationmark1}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.identificationmark1 && Formik.errors.identificationmark1 && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.identificationmark1}
                      </p>
                    )} */}
                  </Grid>

                  {/* identificationmark2 */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="identificationmark2"
                      name="identificationmark2"
                      value={Formik.values.identificationmark2}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.identificationmark2 && Formik.errors.identificationmark2 && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.identificationmark2}
                      </p>
                    )} */}
                  </Grid>

                  {/* permanentaddress */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="permanentaddress"
                      name="permanentaddress"
                      value={Formik.values.permanentaddress}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.permanentaddress && Formik.errors.permanentaddress && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.permanentaddress}
                      </p>
                    )} */}
                  </Grid>

                  {/* permanentpincode */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="permanentpincode"
                      name="permanentpincode"
                      value={Formik.values.permanentpincode}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.permanentpincode && Formik.errors.permanentpincode && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.permanentpincode}
                      </p>
                    )} */}
                  </Grid>

                  {/*   presentaddress */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="presentaddress"
                      name="presentaddress"
                      value={Formik.values.presentaddress}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.presentaddress && Formik.errors.presentaddress && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.presentaddress}
                      </p>
                    )} */}
                  </Grid>

                  {/*   presentpincode */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="presentpincode"
                      name="presentpincode"
                      value={Formik.values.presentpincode}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.presentpincode && Formik.errors.presentpincode && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.presentpincode}
                      </p>
                    )} */}
                  </Grid>

                  {/*   nameofpreviousschool */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="nameofpreviousschool"
                      name="nameofpreviousschool"
                      value={Formik.values.nameofpreviousschool}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.nameofpreviousschool && Formik.errors.nameofpreviousschool && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.nameofpreviousschool}
                      </p>
                    )} */}
                  </Grid>

                  {/*   classpassed */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="classpassed"
                      name="classpassed"
                      value={Formik.values.classpassed}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.classpassed && Formik.errors.classpassed && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.classpassed}
                      </p>
                    )} */}
                  </Grid>

                  {/*   yearofpassing */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="yearofpassing"
                      name="yearofpassing"
                      value={Formik.values.yearofpassing}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.yearofpassing && Formik.errors.yearofpassing && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.yearofpassing}
                      </p>
                    )} */}
                  </Grid>

                  {/*   reasonforleaving */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="reasonforleaving"
                      name="reasonforleaving"
                      value={Formik.values.reasonforleaving}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.reasonforleaving && Formik.errors.reasonforleaving && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.reasonforleaving}
                      </p>
                    )} */}
                  </Grid>

                  {/*   studentexpelledleaving */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="studentexpelled"
                      name="studentexpelledleaving"
                      value={Formik.values.studentexpelledleaving}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.studentexpelledleaving && Formik.errors.studentexpelledleaving && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.studentexpelledleaving}
                      </p>
                    )} */}
                  </Grid>

                  {/*   mediumofinstructions */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="mediumofinstructions"
                      name="mediumofinstructions"
                      value={Formik.values.mediumofinstructions}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.mediumofinstructions && Formik.errors.mediumofinstructions && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.mediumofinstructions}
                      </p>
                    )} */}
                  </Grid>






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

        {tab === 2 && (
          <Box>
            <Paper sx={{ padding: "20px", margin: "10px" }}>
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                <Grid container spacing={2}>







                  {/* siblingstudingname */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="siblingstudingname"
                      name="siblingstudingname"
                      value={Formik.values.siblingstudingname}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.siblingstudingname && Formik.errors.siblingstudingname && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.siblingstudingname}
                      </p>
                    )} */}
                  </Grid>

                  {/* siblingapplyingname */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="siblingapplyingname"
                      name="siblingapplyingname"
                      value={Formik.values.siblingapplyingname}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.siblingapplyingname && Formik.errors.siblingapplyingname && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.siblingapplyingname}
                      </p>
                    )} */}
                  </Grid>

                  {/* siblingstudingclass */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="siblingstudingclass"
                      name="siblingstudingclass"
                      value={Formik.values.siblingstudingclass}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.siblingstudingclass && Formik.errors.siblingstudingclass && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.siblingstudingclass}
                      </p>
                    )} */}
                  </Grid>

                  {/* siblingapplyingclass */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="siblingapplyingclass"
                      name="siblingapplyingclass"
                      value={Formik.values.siblingapplyingclass}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.siblingapplyingclass && Formik.errors.siblingapplyingclass && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.siblingapplyingclass}
                      </p>
                    )} */}
                  </Grid>

                  {/* previouslyapplied */}
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      options={previouslyappliedArray}
                      getOptionLabel={(option) => option.fieldValue}
                      value={selectedpreviouslyapplied}
                      onChange={(event, newValue) => {
                        setSelectedpreviouslyapplied(newValue);

                        Formik.setFieldValue(
                          "previouslyapplied",
                          newValue ? newValue.fieldValue : "",
                        );
                      }}
                      onBlur={() => Formik.setFieldTouched("previouslyapplied", true)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select previouslyapplied"
                          placeholder="Search previouslyapplied..."
                          fullWidth
                        // error={
                        //   Formik.touched.previouslyapplied && Boolean(Formik.errors.previouslyapplied)
                        // }
                        // helperText={Formik.touched.previouslyapplied && Formik.errors.previouslyapplied}
                        />
                      )}
                    />
                  </Grid>


                  {/*   admissionintoclass */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="admissionintoclass"
                      name="admissionintoclass"
                      value={Formik.values.admissionintoclass}
                      onChange={Formik.handleChange}
                    />
                    {/* {Formik.touched.admissionintoclass && Formik.errors.admissionintoclass && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.admissionintoclass}
                      </p>
                    )} */}
                  </Grid>

                  {/* dateofaddmission */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="dateofaddmission"
                      label="dateofaddmission"
                      type="date"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={Formik.values.dateofaddmission}
                      onChange={(e) => {
                        const doa = e.target.value;

                        Formik.setFieldValue("dateofaddmission", doa);


                      }}
                      onBlur={Formik.handleBlur}
                    />
                    {/* {Formik.touched.dateofaddmission && Formik.errors.dateofaddmission && (
                      <Typography color="error" variant="caption">
                        {Formik.errors.dateofaddmission}
                      </Typography>
                    )} */}
                  </Grid>



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

        {tab === 3 && (
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

              {/* No of Students Card */}
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
                Students Count : {noofstudents}
              </Box>
            </Box>



            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Name
                    </TableCell>
                    <TableCell align="right">Email</TableCell>
                    <TableCell align="right">dOBDate</TableCell>
                    <TableCell align="right">JoinDate</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((value, i) => (
                    <TableRow
                      key={i}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {value.name}
                      </TableCell>
                      <TableCell align="right">{value?.email}</TableCell>
                      <TableCell align="right">
                        {dayjs(value?.dOBDate).format("DD/MM/YYYY")}
                      </TableCell>
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

                          <Button
                            variant="contained"
                            sx={{ background: "skyblue", color: "#000" }}
                            onClick={() => viewUploadFile(value?.student_image)}
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
