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
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { classsubjectSchema } from "../../../yupSchema/classsubjectSchema";
import ClasssubjectPrint from "./ClasssubjectPrint";
import { AuthContext } from "../../../context/AuthContext";

export default function Classsubject() {
  const { authenticated, user } = useContext(AuthContext);
  const [isDataValid, setIsDataValid] = useState(true);
  const [dataError, setDataError] = useState("");
  const [studentClasssubject, setStudentClasssubject] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [date, setDate] = useState(new Date());

  const [isPrint, setPrint] = useState(false);
  const [printId, setPrintId] = useState(null);

  const [params, setParams] = useState({});

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [subjects, setSubjects] = useState([]);

  const [tab, setTab] = useState(0);

  const [classsubjectDetails, setClasssubjectDetails] = useState([
    {
      subject: null,
      seq: 0,
      remarks: "",
      isEdit: false,
    },
  ]);

  const clearClasssubjectDetails = () => {
    setClasssubjectDetails([
      {
        subject: null,
        subject_name: "",
        seq: 0,
        remarks: "",
        isEdit: false,
      },
    ]);
    console.log("classsubjectDetails", classsubjectDetails);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/classsubject/delete/${id}`)
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
      .get(`${baseUrl}/classsubject/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue(
          "classsubject_code",
          resp.data.data?.classsubject_code,
        );
        Formik.setFieldValue(
          "classsubject_name",
          resp.data.data?.classsubject_name,
        );
        Formik.setFieldValue("class", resp.data.data?.class._id);
        Formik.setFieldValue("class_name", resp.data.data?.class?.class_name);

        Formik.setFieldValue("remarks", resp.data.data?.remarks);

        setSelectedClass(resp.data.data?.class || null);

        setEditId(resp.data.data._id);

        const editClasssubjectDetails = resp.data.data?.classsubjectDetails.map(
          (row) => ({
            ...row,
            subject: subjects.find((f) => f._id === row.subject) || null,
            isEdit: true,
          }),
        );

        setClasssubjectDetails(editClasssubjectDetails);
        setTab(0); // open Create Receipt tab
      })
      .catch((e) => {
        console.log("Error  in fetching edit data.");
      });
  };

  const handlePrint = async (id) => {
    console.log("Handle  Print is called", id);
    setPrint(true);

    if (user?.role === "TEACHER") {
      window.open(`/teacher/ClasssubjectPrint?id=${id}`, "_blank");
    } else {
      window.open(`/school/ClasssubjectPrint?id=${id}`, "_blank");
    }

    setPrint(false);
  };

  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
    // 🔥 reset Autocomplete values
    setSelectedClass(null);

    setIsDataValid(true);
    // 🔥 reset Autocomplete values
    clearClasssubjectDetails();
  };

  const clearForm = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
    // 🔥 reset Autocomplete values
    setSelectedClass(null);

    clearClasssubjectDetails();
  };

  //   MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const resetMessage = () => {
    setMessage("");
  };

  const initialValues = {
    classsubject_code: "",
    classsubject_name: "",
    class: "",
    class_name: "",
    seq: 0,
    status: "valid",
    remarks: "",
  };
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: classsubjectSchema,
    onSubmit: (values) => {
      if (classsubjectDetails.length == 0) {
        setDataError("Invoice Details is missing");
        setIsDataValid(false);
        return;
      }

      let hasInvalidRow = false;

      for (const item of classsubjectDetails) {
        if (
          item.subject === undefined ||
          item.subject === "" ||
          item.subject === null
        ) {
          setDataError("Select Subject");
          hasInvalidRow = true;
          break; // exit loop when condition met
        }

        console.log(item);
      }
      if (hasInvalidRow) {
        setIsDataValid(false);
        return;
      }

      const hasDuplicate =
        new Set(classsubjectDetails.map((d) => d.subject?._id.toString()))
          .size !== classsubjectDetails.length;
      console.log(hasDuplicate); // true
      if (hasDuplicate) {
        setIsDataValid(false);
        setDataError("Subject selection is duplicated");
        return;
      }

      //    const isValidTeacher =  validateTeacher();
      //     if (!isValidTeacher){
      //         return;
      //     }
      setIsDataValid(true);

      const payload = {
        ...values,
        classsubjectDetails: classsubjectDetails.map((row) => ({
          class: values?.class,

          subject: row?.subject?._id, // 👈 convert here
          subject_name: row?.subject?.subject_name,
          seq: row?.seq,
          remarks: "",
        })),
      };
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/classsubject/update/${editId}`, payload)
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
          .post(`${baseUrl}/classsubject/create`, payload)
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

  const fetchstudentsclasssubject = () => {
    axios
      .get(`${baseUrl}/classsubject/fetch-with-query`, { params })
      .then((resp) => {
        setStudentClasssubject(resp.data.data);
      })
      .catch(() => console.log("Error in fetching salesinvoices data"));
  };
  const fetchClass = async () => {
    try {
      const classData = await axios.get(`${baseUrl}/class/fetch-all`);
      console.log("class", classData);
      setClasses(classData.data.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubject = async () => {
    try {
      const subjectsData = await axios.get(`${baseUrl}/subject/fetch-all`);
      setSubjects(subjectsData.data.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  useEffect(() => {
    fetchstudentsclasssubject();

    fetchClass();

    fetchSubject();
  }, [message, params]);

  useEffect(() => {
    console.log("classsubjectDetails:", classsubjectDetails);
  }, [classsubjectDetails]);

  useEffect(() => {
    console.log("isDataValid:", isDataValid);
  }, [isDataValid]);

  const handleChange = (index, field, value) => {
    const updated = [...classsubjectDetails];
    updated[index][field] = value;

    if (field === "marks") {
      const marksLimit = Formik.values.marksLimit || 0;
      if (updated[index].marks > marksLimit) {
        updated[index].marks = 0;
      }
    }
    if (field === "subject") {
      updated[index].subject_name = value?.subject_name;
    }

    setClasssubjectDetails(updated);
  };

  const addRow = () => {
    setClasssubjectDetails([
      ...classsubjectDetails,
      {
        subject: "",
        seq: 0,
        remarks: "",
      },
    ]);
  };

  const removeRow = (index) => {
    setClasssubjectDetails(classsubjectDetails.filter((_, i) => i !== index));
    console.log(classsubjectDetails);
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
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                minHeight: 48,
                fontSize: {
                  xs: "13px",
                  sm: "14px",
                  md: "15px",
                },
                fontWeight: 600,
              },
            }}
          >
            <Tab
              label={isEdit ? "Edit Class Subject" : "Create Class Subject"}
            />
            <Tab label="View List" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Box>
            <Box component={"div"} sx={{}}>
              <Paper
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                    md: 3,
                  },
                  m: {
                    xs: 0.5,
                    sm: 1,
                    md: 2,
                  },
                  borderRadius: {
                    xs: 1,
                    md: 2,
                  },
                }}
              >
                {isEdit ? (
                  <Typography
                    sx={{
                      fontWeight: 800,
                      textAlign: "center",
                      fontSize: {
                        xs: "1.35rem",
                        sm: "1.6rem",
                        md: "2.125rem",
                      },
                      mb: 2,
                    }}
                  >
                    Edit classsubject
                  </Typography>
                ) : (
                  <Typography
                    sx={{
                      fontWeight: 800,
                      textAlign: "center",
                      fontSize: {
                        xs: "1.35rem",
                        sm: "1.6rem",
                        md: "2.125rem",
                      },
                      mb: 2,
                    }}
                  >
                    Add New Class Subject
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
                      gap: {
                        xs: 1.5,
                        sm: 2,
                        md: 2,
                      },
                      mt: 2,
                    }}
                  >
                    {/* Classsubject Code */}
                    <Box>
                      <TextField
                        fullWidth
                        label="Code"
                        variant="outlined"
                        name="classsubject_code"
                        value={Formik.values.classsubject_code}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        // disabled
                      />
                    </Box>

                    {/* Classsubject Name */}
                    <Box>
                      <TextField
                        fullWidth
                        label="name"
                        variant="outlined"
                        name="classsubject_name"
                        value={Formik.values.classsubject_name}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                      />
                      {Formik.touched.classsubject_name &&
                        Formik.errors.classsubject_name && (
                          <Typography color="error" variant="caption">
                            {Formik.errors.classsubject_name}
                          </Typography>
                        )}
                    </Box>

                    {/* Class */}

                    <Box>
                      <Autocomplete
                        disabled={isEdit}
                        options={classes}
                        getOptionLabel={(option) => option.class_name}
                        value={selectedClass}
                        onChange={(event, newValue) => {
                          setSelectedClass(newValue);

                          Formik.setFieldValue(
                            "class",
                            newValue ? newValue._id : "",
                          );

                          Formik.setFieldValue("seq", 0);
                        }}
                        onBlur={() => Formik.setFieldTouched("class", true)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Class"
                            placeholder="Search class..."
                            fullWidth
                            error={
                              Formik.touched.class &&
                              Boolean(Formik.errors.class)
                            }
                            helperText={
                              Formik.touched.class && Formik.errors.class
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

                  {/* Classsubject Details */}
                  <Box sx={{ mt: 3 }}>
                    {!isDataValid && (
                      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                        {dataError}
                      </Alert>
                    )}

                    {classsubjectDetails.map((row, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "grid",

                          // Desktop
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "minmax(0, 1fr)",
                            md: "minmax(0, 3fr) minmax(120px, 1fr) 50px",
                          },

                          gap: { xs: 1.5, sm: 1, md: 1 },
                          mb: 2,
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        {/* Subject */}
                        <Box sx={{ width: "100%", minWidth: 0 }}>
                          <Autocomplete
                            disabled={row.isEdit}
                            options={subjects}
                            getOptionLabel={(option) =>
                              option?.subject_name || ""
                            }
                            isOptionEqualToValue={(option, value) =>
                              option._id === value?._id
                            }
                            value={row.subject}
                            onChange={(event, newValue) => {
                              handleChange(index, "subject", newValue);
                            }}
                            fullWidth
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select Subject"
                                placeholder="Search subject..."
                                fullWidth
                                sx={{
                                  width: "100%",

                                  "& .MuiInputBase-root": {
                                    minHeight: {
                                      xs: 52,
                                      sm: 52,
                                      md: 56,
                                    },
                                    fontSize: {
                                      xs: "15px",
                                      sm: "15px",
                                      md: "16px",
                                    },
                                  },

                                  "& .MuiInputBase-input": {
                                    padding: {
                                      xs: "14px 14px",
                                      md: "16px 14px",
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                        </Box>

                        {/* Seq */}
                        <Box
                          sx={{
                            width: "100%",
                            minWidth: {
                              xs: 0,
                              sm: 120,
                              md: 120,
                            },
                          }}
                        >
                          <TextField
                            fullWidth
                            label="Seq"
                            variant="outlined"
                            name="seq"
                            type="number"
                            value={row.seq}
                            slotProps={{
                              htmlInput: {
                                min: 0,
                                step: 1,
                              },
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "-" || e.key === "e") {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value;

                              if (value === "" || Number(value) >= 0) {
                                handleChange(index, "seq", value);
                              }
                            }}
                            sx={{
                              "& .MuiInputBase-root": {
                                minHeight: {
                                  xs: 52,
                                  sm: 52,
                                  md: 56,
                                },
                                fontSize: {
                                  xs: "15px",
                                  sm: "15px",
                                  md: "16px",
                                },
                              },
                            }}
                          />
                        </Box>

                        {/* Delete */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: {
                              xs: "flex-end",
                              md: "center",
                            },
                            alignItems: "center",
                          }}
                        >
                          <Button
                            color="error"
                            variant="outlined"
                            onClick={() => removeRow(index)}
                            sx={{
                              minWidth: {
                                xs: 52,
                                md: 44,
                              },
                              minHeight: {
                                xs: 48,
                                md: 44,
                              },
                              fontSize: "20px",
                              fontWeight: "bold",
                              px: 1,
                            }}
                          >
                            ✕
                          </Button>
                        </Box>
                      </Box>
                    ))}

                    {/* Add Row */}
                    <Button
                      variant="outlined"
                      onClick={addRow}
                      sx={{
                        minHeight: 46,
                        px: 3,
                        mt: 1,
                      }}
                    >
                      + Add Subject
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      mt: 4,
                      justifyContent: {
                        xs: "stretch",
                        sm: "flex-end",
                      },
                      flexDirection: {
                        xs: "column",
                        sm: "row",
                      },
                    }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        minHeight: 48,
                        minWidth: {
                          xs: "100%",
                          sm: 120,
                        },
                      }}
                    >
                      {isEdit ? "Update" : "Submit"}
                    </Button>

                    {isEdit && (
                      <Button
                        variant="outlined"
                        onClick={cancelEdit}
                        sx={{
                          minHeight: 48,
                          minWidth: {
                            xs: "100%",
                            sm: 120,
                          },
                        }}
                      >
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
                alignItems: { xs: "stretch", sm: "center" },
                mb: 2,
              }}
            >
              {/* Search */}
              <TextField
                label="Search .."
                size="small"
                value={params.search || ""}
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

              {/* Total Class Subjects */}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                Total Class Subjects: {studentClasssubject.length}
              </Typography>
            </Box>
            <Box>
              <TableContainer
                component={Paper}
                sx={{
                  width: "100%",
                  overflowX: "auto",
                }}
              >
                <Table
                  sx={{
                    minWidth: 750,
                  }}
                  aria-label="classsubject table"
                >
                  <TableHead>
                    <TableRow>
                      {/* <TableCell component="th" scope="row"> classsubject</TableCell> */}
                      <TableCell align="right">Code</TableCell>
                      <TableCell align="right">Name</TableCell>
                      <TableCell align="right">Class</TableCell>
                      <TableCell align="right">Remarks</TableCell>

                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentClasssubject.map((value, i) => (
                      <TableRow
                        key={i}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {value?.classsubject_code}
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {value?.classsubject_name}
                        </TableCell>

                        <TableCell align="right">
                          {value?.class?.class_name}
                        </TableCell>
                        <TableCell align="right">{value?.remarks}</TableCell>
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

                              {/* <Button
                                variant="contained"
                                sx={{ background: "green", color: "#fff" }}
                                onClick={() => handlePrint(value._id)}
                              >
                                Print
                              </Button> */}
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
