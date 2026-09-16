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
  Autocomplete,
} from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { accountlevelSchema } from "../../../yupSchema/accountlevelSchema";

export default function Accountlevels() {
  const [accountlevels, setAccountlevels] = useState([]);
  const [filteredAccountlevels, setFilteredAccountlevels] = useState([]);

  const [selectedAccountlevel, setSelectedAccountlevel] = useState(null);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tab, setTab] = useState(0);

  // Search
  const [search, setSearch] = useState("");

  // MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  // ---------------------------------------------------------
  // Get Account Group Name
  // ---------------------------------------------------------
  const getAccountGroupName = (groupId) => {
    if (!groupId) return "";

    // If groupId is populated object
    if (typeof groupId === "object") {
      return (
        groupId?.accountlevel_name ||
        groupId?.accountLevel_name ||
        groupId?.name ||
        groupId?.accountlevel_code ||
        ""
      );
    }

    // If groupId is only an ID
    const matchedGroup = accountlevels.find(
      (item) => String(item?._id) === String(groupId),
    );

    return (
      matchedGroup?.accountlevel_name ||
      matchedGroup?.accountLevel_name ||
      matchedGroup?.name ||
      matchedGroup?.accountlevel_code ||
      ""
    );
  };

  // ---------------------------------------------------------
  // Delete
  // ---------------------------------------------------------
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/accountlevel/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(
            e.response?.data?.message || "Error deleting account level",
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
      .get(`${baseUrl}/accountlevel/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        Formik.setFieldValue(
          "accountlevel_name",
          data?.accountlevel_name || "",
        );

        Formik.setFieldValue(
          "accountlevel_code",
          data?.accountlevel_code || "",
        );

        Formik.setFieldValue("level", data?.level || 0);
        Formik.setFieldValue("seq", data?.seq || 0);

        Formik.setFieldValue("groupId", data?.groupId || "");

        setSelectedAccountlevel(data?.groupId || null);
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
    setSelectedAccountlevel(null);
    Formik.resetForm();
  };

  // ---------------------------------------------------------
  // Formik
  // ---------------------------------------------------------
  const initialValues = {
    accountlevel_name: "",
    accountlevel_code: "",
    groupId: "",
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: accountlevelSchema,

    onSubmit: (values) => {
      const payload = {
        ...values,
        groupId: selectedAccountlevel?._id || selectedAccountlevel || null,
      };

      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/accountlevel/update/${editId}`, payload)
          .then((resp) => {
            console.log("Edit submit", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error updating account level",
            );
            setType("error");

            console.log("Error, edit account level submit", e);
          });
      } else {
        axios
          .post(`${baseUrl}/accountlevel/create`, payload)
          .then((resp) => {
            console.log("Response after submitting account level", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error creating account level",
            );
            setType("error");

            console.log("Error creating account level", e);
          });
      }
    },
  });

  // ---------------------------------------------------------
  // Search
  // ---------------------------------------------------------
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // ---------------------------------------------------------
  // Fetch Account Levels
  // ---------------------------------------------------------
  const fetchAccountlevels = () => {
    axios
      .get(`${baseUrl}/accountlevel/fetch-with-query`)
      .then((resp) => {
        const data = Array.isArray(resp.data.data) ? resp.data.data : [];

        setAccountlevels(data);
        setFilteredAccountlevels(data);
      })
      .catch((e) => {
        console.log("Error in fetching account levels", e);
        setAccountlevels([]);
        setFilteredAccountlevels([]);
      });
  };

  // ---------------------------------------------------------
  // Initial Fetch
  // ---------------------------------------------------------
  useEffect(() => {
    fetchAccountlevels();
  }, [message]);

  // ---------------------------------------------------------
  // Dynamic Search
  // Searches:
  // Accountlevel Name
  // Code
  // Account Group
  // Account Level
  // ---------------------------------------------------------
  useEffect(() => {
    const searchValue = search.trim().toLowerCase();

    // Show all records when search is empty
    if (!searchValue) {
      setFilteredAccountlevels(accountlevels);
      return;
    }

    const filtered = accountlevels.filter((accountlevel) => {
      const accountlevelName = String(
        accountlevel?.accountlevel_name || "",
      ).toLowerCase();

      const accountlevelCode = String(
        accountlevel?.accountlevel_code || "",
      ).toLowerCase();

      const accountGroup = getAccountGroupName(
        accountlevel?.groupId,
      ).toLowerCase();

      const accountLevel = String(accountlevel?.level ?? "").toLowerCase();

      return (
        accountlevelName.includes(searchValue) ||
        accountlevelCode.includes(searchValue) ||
        accountGroup.includes(searchValue) ||
        accountLevel.includes(searchValue)
      );
    });

    setFilteredAccountlevels(filtered);
  }, [search, accountlevels]);

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
        {/* =====================================================
            TABS
        ===================================================== */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label={isEdit ? "Edit Accountlevel" : "Add New Accountlevel"}
            />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =====================================================
            TAB 0 - CREATE / EDIT
        ===================================================== */}
        {tab === 0 && (
          <Box>
            <Paper sx={{ p: 3, m: 2 }}>
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                {/* Accountlevel Name */}
                <Box>
                  <TextField
                    fullWidth
                    label="Accountlevel Text"
                    name="accountlevel_name"
                    value={Formik.values.accountlevel_name}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                    size="small"
                  />

                  {Formik.touched.accountlevel_name &&
                    Formik.errors.accountlevel_name && (
                      <p style={{ color: "red" }}>
                        {Formik.errors.accountlevel_name}
                      </p>
                    )}
                </Box>

                {/* Accountlevel Code */}
                <Box>
                  <TextField
                    disabled={isEdit}
                    fullWidth
                    label="Accountlevel Code"
                    name="accountlevel_code"
                    value={Formik.values.accountlevel_code}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                    size="small"
                  />

                  {Formik.touched.accountlevel_code &&
                    Formik.errors.accountlevel_code && (
                      <p style={{ color: "red" }}>
                        {Formik.errors.accountlevel_code}
                      </p>
                    )}
                </Box>

                {/* Account Group */}
                <Box>
                  <Autocomplete
                    disabled={isEdit}
                    options={accountlevels}
                    getOptionLabel={(option) => option?.accountlevel_name || ""}
                    value={selectedAccountlevel}
                    onChange={(event, newValue) => {
                      setSelectedAccountlevel(newValue);

                      Formik.setFieldValue(
                        "groupId",
                        newValue ? newValue._id : "",
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Account Level"
                        placeholder="Search Account Level..."
                        fullWidth
                        size="small"
                      />
                    )}
                  />
                </Box>

                {/* Empty Box */}
                <Box />

                {/* Buttons */}
                <Box sx={{ gridColumn: "1 / -1", mt: 1 }}>
                  <Button type="submit" variant="contained" sx={{ mr: 1 }}>
                    Submit
                  </Button>

                  {isEdit && (
                    <Button variant="outlined" onClick={cancelEdit}>
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
                  label="Search Account Levels"
                  placeholder="Search by Name, Code, Account Group or Account Level..."
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
                  Total Account Levels:{" "}
                  <strong>{filteredAccountlevels.length}</strong>
                </Typography>
              </Box>
            </Paper>

            {/* Account Levels Table */}
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="account levels table">
                <TableHead>
                  <TableRow>
                    <TableCell>Accountlevel Name</TableCell>

                    <TableCell align="right">Code</TableCell>

                    <TableCell align="right">Account Group</TableCell>

                    <TableCell align="right">Account Level</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredAccountlevels.length > 0 ? (
                    filteredAccountlevels.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* Accountlevel Name */}
                        <TableCell component="th" scope="row">
                          {value?.accountlevel_name || "-"}
                        </TableCell>

                        {/* Code */}
                        <TableCell align="right">
                          {value?.accountlevel_code || "-"}
                        </TableCell>

                        {/* Account Group */}
                        <TableCell align="right">
                          {getAccountGroupName(value?.groupId) || "-"}
                        </TableCell>

                        {/* Account Level */}
                        <TableCell align="right">
                          {value?.level ?? "-"}
                        </TableCell>

                        {/* Action */}
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1.5,
                            }}
                          >
                            <Button
                              variant="contained"
                              sx={{
                                background: "red",
                                color: "#fff",
                                "&:hover": {
                                  background: "#cc0000",
                                },
                              }}
                              onClick={() => handleDelete(value?._id)}
                            >
                              Delete
                            </Button>

                            <Button
                              variant="contained"
                              sx={{
                                background: "gold",
                                color: "#222222",
                                "&:hover": {
                                  background: "#d4af00",
                                },
                              }}
                              onClick={() => handleEdit(value?._id)}
                            >
                              Edit
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography
                          sx={{
                            py: 3,
                            color: "text.secondary",
                          }}
                        >
                          {search
                            ? "No Account Levels found matching your search."
                            : "No Account Levels available."}
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
