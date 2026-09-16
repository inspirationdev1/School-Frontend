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
import { sectionSchema } from "../../../yupSchema/sectionSchema";

export default function Section() {
  const [studentSection, setStudentSection] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);

  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState(0);

  // Search
  const [search, setSearch] = useState("");

  // Message
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  // ---------------------------------------------------------
  // Reset Message
  // ---------------------------------------------------------
  const resetMessage = () => {
    setMessage("");
  };

  // ---------------------------------------------------------
  // Delete
  // ---------------------------------------------------------
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/section/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(
            e.response?.data?.message || "Error deleting section",
          );
          setType("error");
          console.log("Error, deleting", e);
        });
    }
  };

  // ---------------------------------------------------------
  // Edit
  // ---------------------------------------------------------
  const handleEdit = (id) => {
    console.log("Handle Edit is called", id);

    setEdit(true);

    axios
      .get(`${baseUrl}/section/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        Formik.setFieldValue(
          "section_name",
          data?.section_name || "",
        );

        Formik.setFieldValue(
          "section_code",
          data?.section_code || "",
        );

        setEditId(data?._id);
        setTab(0);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.", e);
      });
  };

  // ---------------------------------------------------------
  // Cancel Edit
  // ---------------------------------------------------------
  const cancelEdit = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
  };

  // ---------------------------------------------------------
  // Formik
  // ---------------------------------------------------------
  const initialValues = {
    section_name: "",
    section_code: "",
  };

  const Formik = useFormik({
    initialValues,
    validationSchema: sectionSchema,

    onSubmit: (values) => {
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/section/update/${editId}`, {
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
              e.response?.data?.message ||
                "Error updating section",
            );
            setType("error");

            console.log(
              "Error, edit section submit",
              e,
            );
          });
      } else {
        axios
          .post(`${baseUrl}/section/create`, {
            ...values,
          })
          .then((resp) => {
            console.log(
              "Response after submitting section",
              resp,
            );

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message ||
                "Error creating section",
            );
            setType("error");

            console.log(
              "Error, response section submit",
              e,
            );
          });
      }
    },
  });

  // ---------------------------------------------------------
  // Dynamic Search
  // ---------------------------------------------------------
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // ---------------------------------------------------------
  // Fetch Sections
  // ---------------------------------------------------------
  const fetchstudentssection = () => {
    axios
      .get(`${baseUrl}/section/fetch-all`)
      .then((resp) => {
        console.log(
          "Fetching sections",
          resp,
        );

        const data = Array.isArray(resp.data.data)
          ? resp.data.data
          : [];

        setStudentSection(data);
        setFilteredSections(data);
      })
      .catch((e) => {
        console.log(
          "Error in fetching sections",
          e,
        );

        setStudentSection([]);
        setFilteredSections([]);
      });
  };

  // ---------------------------------------------------------
  // Initial Fetch
  // ---------------------------------------------------------
  useEffect(() => {
    fetchstudentssection();
  }, [message]);

  // ---------------------------------------------------------
  // Dynamic Client-Side Search
  //
  // Searches:
  // 1. Section Name
  // 2. Section Code
  // ---------------------------------------------------------
  useEffect(() => {
    const searchValue = search.trim().toLowerCase();

    // If search is empty, display all sections
    if (!searchValue) {
      setFilteredSections(studentSection);
      return;
    }

    const filtered = studentSection.filter((section) => {
      const sectionName = String(
        section?.section_name || "",
      ).toLowerCase();

      const sectionCode = String(
        section?.section_code || "",
      ).toLowerCase();

      return (
        sectionName.includes(searchValue) ||
        sectionCode.includes(searchValue)
      );
    });

    setFilteredSections(filtered);
  }, [search, studentSection]);

  return (
    <>
      {/* =====================================================
          MESSAGE
      ===================================================== */}
      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      <Box>
        {/* =====================================================
            TABS
        ===================================================== */}
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
            <Tab
              label={
                isEdit
                  ? "Edit Section"
                  : "Add New Section"
              }
            />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =====================================================
            TAB 0 - ADD / EDIT SECTION
        ===================================================== */}
        {tab === 0 && (
          <Box>
            <Paper
              sx={{
                p: 3,
                m: 2,
              }}
            >
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                {/* Section Name */}
                <TextField
                  fullWidth
                  sx={{
                    marginTop: "10px",
                  }}
                  label="Section Name"
                  variant="outlined"
                  name="section_name"
                  value={Formik.values.section_name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                  size="small"
                />

                {Formik.touched.section_name &&
                  Formik.errors.section_name && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.section_name}
                    </p>
                  )}

                {/* Section Code */}
                <TextField
                  disabled={isEdit}
                  fullWidth
                  sx={{
                    marginTop: "10px",
                  }}
                  label="Section Code"
                  variant="outlined"
                  name="section_code"
                  value={Formik.values.section_code}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                  size="small"
                />

                {Formik.touched.section_code &&
                  Formik.errors.section_code && (
                    <p
                      style={{
                        color: "red",
                        textTransform: "capitalize",
                      }}
                    >
                      {Formik.errors.section_code}
                    </p>
                  )}

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
                    Submit
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
        ===================================================== */}
        {tab === 1 && (
          <Box>
            {/* Search + Total Count */}
            <Paper
              sx={{
                p: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                {/* Dynamic Search */}
                <TextField
                  label="Search Sections"
                  placeholder="Search by Section Name or Code..."
                  size="small"
                  value={search}
                  onChange={handleSearch}
                  sx={{
                    flex: 1,
                    minWidth: {
                      xs: "100%",
                      sm: "400px",
                    },
                    "& .MuiInputBase-root": {
                      height: 42,
                      fontSize: "14px",
                    },
                  }}
                />

                {/* Clear Search */}
                {search && (
                  <Button
                    variant="outlined"
                    onClick={() => setSearch("")}
                    sx={{
                      height: 42,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Clear
                  </Button>
                )}

                {/* Total Count */}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Sections:{" "}
                  <strong>
                    {filteredSections.length}
                  </strong>
                </Typography>
              </Box>
            </Paper>

            {/* =================================================
                SECTION TABLE
            ================================================= */}
            <TableContainer component={Paper}>
              <Table
                sx={{
                  minWidth: 650,
                }}
                aria-label="section table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Section Name
                    </TableCell>

                    <TableCell align="right">
                      Code
                    </TableCell>

                    <TableCell align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredSections.length > 0 ? (
                    filteredSections.map(
                      (value, i) => (
                        <TableRow
                          key={value?._id || i}
                          sx={{
                            "&:last-child td, &:last-child th":
                              {
                                border: 0,
                              },
                          }}
                        >
                          {/* Section Name */}
                          <TableCell
                            component="th"
                            scope="row"
                          >
                            {value?.section_name || "-"}
                          </TableCell>

                          {/* Section Code */}
                          <TableCell align="right">
                            {value?.section_code || "-"}
                          </TableCell>

                          {/* Action */}
                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent:
                                  "flex-end",
                                gap: 1.5,
                              }}
                            >
                              <Button
                                variant="contained"
                                sx={{
                                  background: "red",
                                  color: "#fff",
                                  "&:hover": {
                                    background:
                                      "#cc0000",
                                  },
                                }}
                                onClick={() =>
                                  handleDelete(
                                    value?._id,
                                  )
                                }
                              >
                                Delete
                              </Button>

                              <Button
                                variant="contained"
                                sx={{
                                  background: "gold",
                                  color: "#222222",
                                  "&:hover": {
                                    background:
                                      "#d4af00",
                                  },
                                }}
                                onClick={() =>
                                  handleEdit(
                                    value?._id,
                                  )
                                }
                              >
                                Edit
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ),
                    )
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align="center"
                      >
                        <Typography
                          sx={{
                            py: 3,
                            color: "text.secondary",
                          }}
                        >
                          {search
                            ? "No Sections found matching your search."
                            : "No Sections available."}
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