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
  Tabs,
  Tab,
} from "@mui/material";

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { examinationSchema } from "../../../yupSchema/examinationSchema";

export default function Examinations() {
  const [examinations, setExaminations] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState(0);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const resetMessage = () => {
    setMessage("");
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/examination/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(e.response?.data?.message || "Error deleting examination");
          setType("error");
          console.log("Error, deleting", e);
        });
    }
  };

  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);
    setEdit(true);

    axios
      .get(`${baseUrl}/examination/single/${id}`)
      .then((resp) => {
        Formik.setFieldValue(
          "examination_name",
          resp.data.data.examination_name,
        );

        Formik.setFieldValue(
          "examination_code",
          resp.data.data.examination_code,
        );

        Formik.setFieldValue("seq", resp.data.data?.seq);

        setEditId(resp.data.data._id);
        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);
      });
  };

  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
  };

  const initialValues = {
    examination_name: "",
    examination_code: "",
    seq: 0,
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: examinationSchema,

    onSubmit: (values) => {
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/examination/update/${editId}`, {
            ...values,
          })
          .then((resp) => {
            console.log("Edit submit", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error updating examination",
            );

            setType("error");

            console.log("Error, edit examination submit", e);
          });
      } else {
        axios
          .post(`${baseUrl}/examination/new`, {
            ...values,
          })
          .then((resp) => {
            console.log("Response after submitting examination", resp);

            setMessage(resp.data.message);
            setType("success");
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error creating examination",
            );

            setType("error");

            console.log("Error, response examination submit", e);
          });

        Formik.resetForm();
      }
    },
  });

  const fetchExaminations = () => {
    axios
      .get(`${baseUrl}/examination/all`)
      .then((resp) => {
        console.log("Fetching examinations.", resp);

        setExaminations(resp.data.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching examinations data", e);
      });
  };

  useEffect(() => {
    fetchExaminations();
  }, [message]);

  // LIVE SEARCH
  const filteredExaminations = examinations.filter((value) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return true;
    }

    const examinationName = String(value?.examination_name || "").toLowerCase();

    const examinationCode = String(value?.examination_code || "").toLowerCase();

    return examinationName.includes(search) || examinationCode.includes(search);
  });

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
        {/* Tabs */}
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
            <Tab label={isEdit ? "Edit Examination" : "Add New Examination"} />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =====================================================
                    TAB 0 - CREATE / EDIT EXAMINATION
                ====================================================== */}
        {tab === 0 && (
          <Box component="div">
            <Paper
              sx={{
                padding: "20px",
                margin: "10px",
              }}
            >
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                {/* Examination Name */}
                <TextField
                  fullWidth
                  sx={{
                    marginTop: "10px",
                  }}
                  label="Examination Name"
                  variant="outlined"
                  name="examination_name"
                  value={Formik.values.examination_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />

                {Formik.touched.examination_name &&
                  Formik.errors.examination_name && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.examination_name}
                    </p>
                  )}

                {/* Examination Code */}
                <TextField
                  disabled={isEdit}
                  fullWidth
                  sx={{
                    marginTop: "10px",
                  }}
                  label="Examination Code"
                  variant="outlined"
                  name="examination_code"
                  value={Formik.values.examination_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />

                {Formik.touched.examination_code &&
                  Formik.errors.examination_code && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.examination_code}
                    </p>
                  )}

                {/* Sequence */}
                <Box>
                  <TextField
                    fullWidth
                    sx={{
                      marginTop: "10px",
                    }}
                    label="Seq"
                    variant="outlined"
                    name="seq"
                    type="number"
                    value={Formik.values.seq}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />

                  {Formik.touched.seq && Formik.errors.seq && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.seq}
                    </p>
                  )}
                </Box>

                {/* Buttons */}
                <Box
                  sx={{
                    marginTop: "10px",
                  }}
                >
                  <Button
                    type="submit"
                    sx={{
                      marginRight: "10px",
                    }}
                    variant="contained"
                  >
                    {isEdit ? "Update" : "Submit"}
                  </Button>

                  {isEdit && (
                    <Button
                      sx={{
                        marginRight: "10px",
                      }}
                      variant="outlined"
                      onClick={cancelEdit}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* =====================================================
                    TAB 1 - VIEW LIST
                ====================================================== */}
        {tab === 1 && (
          <Box>
            {/* Search + Total */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                alignItems: {
                  xs: "stretch",
                  sm: "center",
                },
                mb: 2,
              }}
            >
              {/* Search Field */}
              <TextField
                label="Search Exam Name / Code"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
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

              {/* Total Examinations */}
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                Total Examinations: {filteredExaminations.length}
              </Typography>
            </Box>

            {/* Examination List */}
            <TableContainer component={Paper}>
              <Table
                sx={{
                  minWidth: 650,
                }}
                aria-label="examination table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Exam Name</TableCell>

                    <TableCell align="right">Code</TableCell>

                    <TableCell align="right">Seq</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredExaminations.length > 0 ? (
                    filteredExaminations.map((value, i) => (
                      <TableRow
                        key={value._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {value.examination_name}
                        </TableCell>

                        <TableCell align="right">
                          {value.examination_code}
                        </TableCell>

                        <TableCell align="right">{value?.seq}</TableCell>

                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1.5,
                            }}
                          >
                            {/* Delete */}
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

                            {/* Edit */}
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
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography
                          sx={{
                            py: 2,
                            fontWeight: "bold",
                          }}
                        >
                          No examinations found
                        </Typography>
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
