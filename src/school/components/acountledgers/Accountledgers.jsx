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
import { accountledgerSchema } from "../../../yupSchema/accountledgerSchema";

export default function Accountledgers() {
  const [accountledgers, setAccountledgers] = useState([]);
  const [filteredAccountledgers, setFilteredAccountledgers] = useState([]);

  const [accountlevels, setAccountlevels] = useState([]);
  const [selectedAccountlevel, setSelectedAccountlevel] = useState(null);

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
  // Get Account Level Name
  // ---------------------------------------------------------
  const getAccountLevelName = (groupId) => {
    if (!groupId) return "";

    // If groupId is populated
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
    const matchedAccountLevel = accountlevels.find(
      (item) => String(item?._id) === String(groupId),
    );

    return (
      matchedAccountLevel?.accountlevel_name ||
      matchedAccountLevel?.accountLevel_name ||
      matchedAccountLevel?.name ||
      matchedAccountLevel?.accountlevel_code ||
      ""
    );
  };

  // ---------------------------------------------------------
  // Delete
  // ---------------------------------------------------------
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/accountledger/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(
            e.response?.data?.message || "Error deleting account ledger",
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
      .get(`${baseUrl}/accountledger/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;

        Formik.setFieldValue(
          "accountledger_name",
          data?.accountledger_name || "",
        );

        Formik.setFieldValue(
          "accountledger_code",
          data?.accountledger_code || "",
        );

        Formik.setFieldValue(
          "groupId",
          data?.groupId?._id || data?.groupId || "",
        );

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
    accountledger_name: "",
    accountledger_code: "",
    groupId: "",
  };

  const Formik = useFormik({
    initialValues,
    validationSchema: accountledgerSchema,

    onSubmit: (values) => {
      const payload = {
        ...values,
        groupId: selectedAccountlevel?._id || selectedAccountlevel || null,
      };

      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/accountledger/update/${editId}`, payload)
          .then((resp) => {
            console.log("Edit submit", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error updating account ledger",
            );
            setType("error");

            console.log("Error, edit account ledger submit", e);
          });
      } else {
        axios
          .post(`${baseUrl}/accountledger/create`, payload)
          .then((resp) => {
            console.log("Response after submitting account ledger", resp);

            setMessage(resp.data.message);
            setType("success");

            cancelEdit();
            setTab(1);
          })
          .catch((e) => {
            setMessage(
              e.response?.data?.message || "Error creating account ledger",
            );
            setType("error");

            console.log("Error creating account ledger", e);
          });
      }
    },
  });

  // ---------------------------------------------------------
  // Dynamic Search Handler
  // ---------------------------------------------------------
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // ---------------------------------------------------------
  // Fetch Account Ledgers
  // ---------------------------------------------------------
  const fetchaccountledgers = () => {
    axios
      .get(`${baseUrl}/accountledger/fetch-with-query`)
      .then((resp) => {
        const data = Array.isArray(resp.data.data) ? resp.data.data : [];

        setAccountledgers(data);
        setFilteredAccountledgers(data);
      })
      .catch((e) => {
        console.log("Error in fetching account ledgers", e);

        setAccountledgers([]);
        setFilteredAccountledgers([]);
      });
  };

  // ---------------------------------------------------------
  // Fetch Account Levels
  // ---------------------------------------------------------
  const fetchaccountlevels = () => {
    axios
      .get(`${baseUrl}/accountlevel/fetch-all`)
      .then((resp) => {
        const data = Array.isArray(resp.data.data) ? resp.data.data : [];

        console.log("Fetching account levels", resp);

        setAccountlevels(data);
      })
      .catch((e) => {
        console.log("Error in fetching account levels", e);

        setAccountlevels([]);
      });
  };

  // ---------------------------------------------------------
  // Initial Fetch
  // ---------------------------------------------------------
  useEffect(() => {
    fetchaccountlevels();
    fetchaccountledgers();
  }, [message]);

  // ---------------------------------------------------------
  // Dynamic Client-Side Search
  //
  // Searches:
  // 1. Accountledger Name
  // 2. Accountledger Code
  // 3. Account Level
  // 4. Account Type
  // ---------------------------------------------------------
  useEffect(() => {
    const searchValue = search.trim().toLowerCase();

    // If search is empty, show all records
    if (!searchValue) {
      setFilteredAccountledgers(accountledgers);
      return;
    }

    const filtered = accountledgers.filter((accountledger) => {
      const accountledgerName = String(
        accountledger?.accountledger_name || "",
      ).toLowerCase();

      const accountledgerCode = String(
        accountledger?.accountledger_code || "",
      ).toLowerCase();

      const accountLevel = getAccountLevelName(
        accountledger?.groupId,
      ).toLowerCase();

      const accountType = String(
        accountledger?.account_type || "",
      ).toLowerCase();

      return (
        accountledgerName.includes(searchValue) ||
        accountledgerCode.includes(searchValue) ||
        accountLevel.includes(searchValue) ||
        accountType.includes(searchValue)
      );
    });

    setFilteredAccountledgers(filtered);
  }, [search, accountledgers, accountlevels]);

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
              label={isEdit ? "Edit Accountledger" : "Add New Accountledger"}
            />

            <Tab label="View List" />
          </Tabs>
        </Box>

        {/* =====================================================
            TAB 0 - ADD / EDIT ACCOUNT LEDGER
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
                {/* Accountledger Name */}
                <Box>
                  <TextField
                    fullWidth
                    label="Accountledger Text"
                    name="accountledger_name"
                    value={Formik.values.accountledger_name}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                    size="small"
                  />

                  {Formik.touched.accountledger_name &&
                    Formik.errors.accountledger_name && (
                      <p style={{ color: "red" }}>
                        {Formik.errors.accountledger_name}
                      </p>
                    )}
                </Box>

                {/* Accountledger Code */}
                <Box>
                  <TextField
                    disabled={isEdit}
                    fullWidth
                    label="Accountledger Code"
                    name="accountledger_code"
                    value={Formik.values.accountledger_code}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                    size="small"
                  />

                  {Formik.touched.accountledger_code &&
                    Formik.errors.accountledger_code && (
                      <p style={{ color: "red" }}>
                        {Formik.errors.accountledger_code}
                      </p>
                    )}
                </Box>

                {/* Account Level */}
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
                    onBlur={() => Formik.setFieldTouched("groupId", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Account Level"
                        placeholder="Search Account Level..."
                        fullWidth
                        size="small"
                        error={
                          Formik.touched.groupId &&
                          Boolean(Formik.errors.groupId)
                        }
                        helperText={
                          Formik.touched.groupId && Formik.errors.groupId
                        }
                      />
                    )}
                  />
                </Box>

                {/* Empty Box for Grid Alignment */}
                <Box />

                {/* Buttons */}
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    mt: 1,
                  }}
                >
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
                  label="Search Account Ledgers"
                  placeholder="Search by Name, Code, Account Level or Account Type..."
                  size="small"
                  value={search}
                  onChange={handleSearch}
                  sx={{
                    flex: 1,
                    minWidth: {
                      xs: "100%",
                      sm: "420px",
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
                  Total Account Ledgers:{" "}
                  <strong>{filteredAccountledgers.length}</strong>
                </Typography>
              </Box>
            </Paper>

            {/* Account Ledger Table */}
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="account ledger table">
                <TableHead>
                  <TableRow>
                    <TableCell>Accountledger Name</TableCell>

                    <TableCell align="right">Code</TableCell>

                    <TableCell align="right">Account Level</TableCell>

                    <TableCell align="right">Account Type</TableCell>

                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredAccountledgers.length > 0 ? (
                    filteredAccountledgers.map((value, i) => (
                      <TableRow
                        key={value?._id || i}
                        sx={{
                          "&:last-child td, &:last-child th": {
                            border: 0,
                          },
                        }}
                      >
                        {/* Accountledger Name */}
                        <TableCell component="th" scope="row">
                          {value?.accountledger_name || "-"}
                        </TableCell>

                        {/* Code */}
                        <TableCell align="right">
                          {value?.accountledger_code || "-"}
                        </TableCell>

                        {/* Account Level */}
                        <TableCell align="right">
                          {getAccountLevelName(value?.groupId) || "-"}
                        </TableCell>

                        {/* Account Type */}
                        <TableCell align="right">
                          {value?.account_type || "-"}
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
                            ? "No Account Ledgers found matching your search."
                            : "No Account Ledgers available."}
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
