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
  Autocomplete,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { accountsetupsSchema } from "../../../yupSchema/accountsetupsSchema";

export default function Accountsetups() {
  const [accountsetups, setAccountsetups] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [screens, setScreens] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(null);

  const [accountledgers, setAccountledgers] = useState([]);
  const [selectedAccountledger, setSelectedAccountledger] = useState(null);

  const [amounttypes, setAmounttypes] = useState([]);
  const [selectedAmounttype, setSelectedAmounttype] = useState(null);

  const [mappingtypes, setMappingtypes] = useState([]);
  const [selectedMappingtype, setSelectedMappingtype] = useState(null);

  const [tab, setTab] = useState(0);

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
        .delete(`${baseUrl}/accountsetup/delete/${id}`)
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
      .get(`${baseUrl}/accountsetup/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("screen_name", resp.data.data.screen_name);
        const matchedScreen = screens.find(
          (s) => s.screen_id === resp.data.data.screen,
        );
        setSelectedScreen(matchedScreen || null);
        Formik.setFieldValue("screen", matchedScreen?.screen_id);

        Formik.setFieldValue(
          "accountledger",
          resp.data.data?.accountledger?._id,
        );
        setSelectedAccountledger(resp.data.data.accountledger);
        Formik.setFieldValue(
          "accountledger_name",
          resp.data.data?.accountledger_name,
        );
        Formik.setFieldValue("account_type", resp.data.data?.account_type);

        const matchedAmounttype = amounttypes.find(
          (s) => s.value === resp.data.data?.amount_type,
        );
        setSelectedAmounttype(matchedAmounttype || null);
        Formik.setFieldValue("amount_type", resp.data.data?.amount_type);

        const matchedMappingtype = mappingtypes.find(
          (s) => s.value === resp.data.data?.mapping_type,
        );
        setSelectedMappingtype(matchedMappingtype || null);
        Formik.setFieldValue("mapping_type", resp.data.data?.mapping_type);

        Formik.setFieldValue("seq", resp.data.data?.seq);

        setEditId(resp.data.data._id);
        setTab(0); // open Create Receipt tab
      })
      .catch((e) => {
        console.log("Error  in fetching edit data.");
      });
  };

  const cancelEdit = () => {
    setEdit(false);
    Formik.resetForm();
    setSelectedScreen(null);
    setSelectedAccountledger(null);
    setSelectedAmounttype(null);
    setSelectedMappingtype(null);
    setParams({});
  };

  //   MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const resetMessage = () => {
    setMessage("");
  };

  const initialValues = {
    screen: "",
    screen_name: "",
    accountledger: null,
    accountledger_name: "",
    amount_type: "",
    account_type: "",
    mapping_type: "",
    seq: 0,
  };
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: accountsetupsSchema,
    onSubmit: (values) => {
      // values.account_type = selectedAccountledger?.account_type || "";
      if (isEdit) {
        console.log("edit id", editId);
        axios
          .patch(`${baseUrl}/accountsetup/update/${editId}`, {
            ...values,
          })
          .then((resp) => {
            console.log("Edit submit", resp);
            setMessage(resp.data.message);
            setType("success");
            cancelEdit();
            setTab(1); // go to View List
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, edit casting submit", e);
          });
      } else {
        axios
          .post(`${baseUrl}/accountsetup/create`, { ...values })
          .then((resp) => {
            console.log("Response after submitting admin casting", resp);
            setMessage(resp.data.message);
            setType("success");
            cancelEdit();
            setTab(1); // go to View List
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin casting calls", e);
          });
        Formik.resetForm();
      }
    },
  });

  const [month, setMonth] = useState([]);
  const [year, setYear] = useState([]);

  const fetchAccountsetups = () => {
    axios
      .get(`${baseUrl}/accountsetup/fetch-with-query`, { params })
      .then((resp) => {
        setAccountsetups(resp.data.data);
      })
      .catch(() => console.log("Error in fetching students data"));
  };

  const fetchScreens = async () => {
    try {
      const screensData = [
        { screen_id: "salesinvoice", screen_name: "Sales Invoice" },
        { screen_id: "receipt", screen_name: "Receipt" },
        { screen_id: "expense", screen_name: "Expense" },
        { screen_id: "payment", screen_name: "Payment" },
      ];
      setScreens(screensData);
    } catch (error) {
      console.error("Error fetching Screens:", error);
    }
  };

  const fetchAccountledgers = async () => {
    try {
      let params = {};

      const accountledgersResponse = await axios.get(
        `${baseUrl}/accountledger/fetch-with-query`,
        {
          params: params,
        },
      );
      setAccountledgers(accountledgersResponse.data.data);
    } catch (error) {
      console.error("Error fetching accountledgers:", error);
    }
  };

  const fetchAmountTypes = async () => {
    try {
      const amountTypesData = [
        {
          value: "dr",
          label: "Dr",
          meaning: "Debit",
        },
        {
          value: "cr",
          label: "Cr",
          meaning: "Credit",
        },
      ];

      setAmounttypes(amountTypesData);
    } catch (error) {
      console.error("Error fetching amount types:", error);
    }
  };

  const fetchMappingTypes = async () => {
    try {
      const mappingTypesData = [
        {
          value: "net_amount",
          label: "Net Amount",
          meaning: "Net Amount",
        },
        {
          value: "taxable_amount",
          label: "Taxable Amount",
          meaning: "Taxable Amount",
        },
        {
          value: "tax_amount",
          label: "Tax Amount",
          meaning: "Tax Amount",
        },
        {
          value: "discount_amount",
          label: "Discount Amount",
          meaning: "Discount Amount",
        },
      ];

      setMappingtypes(mappingTypesData);
    } catch (error) {
      console.error("Error fetching amount types:", error);
    }
  };

  useEffect(() => {
    fetchScreens();
    fetchAccountledgers();
    fetchAmountTypes();
    fetchMappingTypes();
    fetchAccountsetups();
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
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            {/* <Tab label="Create Receipt" /> */}
            <Tab label={isEdit ? "Edit Number Seq" : "Add New Number Seq"} />
            <Tab label="View List" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Box component={"div"} sx={{}}>
            <Paper sx={{ padding: "20px", margin: "10px" }}>
              {isEdit ? (
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "800", textAlign: "center" }}
                >
                  Edit accountsetup
                </Typography>
              ) : (
                <Typography
                  variant="h4"
                  sx={{ fontWeight: "800", textAlign: "center" }}
                >
                  Add New accountsetup
                </Typography>
              )}{" "}
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr", // mobile: 1 column
                    sm: "1fr 1fr", // desktop: 2 columns
                  },
                  gap: 2,
                }}
              >
                {/* Screen */}

                <Box>
                  <Autocomplete
                    disabled={isEdit}
                    options={screens}
                    getOptionLabel={(option) => option.screen_name}
                    value={selectedScreen}
                    onChange={(event, newValue) => {
                      setSelectedScreen(newValue);
                      Formik.setFieldValue(
                        "screen",
                        newValue ? newValue?.screen_id : "",
                      );
                      Formik.setFieldValue(
                        "screen_name",
                        newValue ? newValue?.screen_name : "",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("screen", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Screen"
                        fullWidth
                        error={
                          Formik.touched.screen && Boolean(Formik.errors.screen)
                        }
                        helperText={
                          Formik.touched.screen && Formik.errors.screen
                        }
                      />
                    )}
                  />
                </Box>

                {/* AccountLedger */}
                <Box>
                  <Autocomplete
                    options={accountledgers}
                    getOptionLabel={(option) =>
                      option.accountledger_name +
                      "-" +
                      option.accountledger_code
                    }
                    value={selectedAccountledger}
                    onChange={(event, newValue) => {
                      setSelectedAccountledger(newValue);

                      Formik.setFieldValue(
                        "accountledger",
                        newValue ? newValue._id : "",
                      );
                      Formik.setFieldValue(
                        "accountledger_name",
                        newValue ? newValue?.accountledger_name : "",
                      );
                      Formik.setFieldValue(
                        "account_type",
                        newValue ? newValue?.account_type : "",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("accountledger", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select accountledger"
                        placeholder="Search accountledger..."
                        fullWidth
                        error={
                          Formik.touched.accountledger &&
                          Boolean(Formik.errors.accountledger)
                        }
                        helperText={
                          Formik.touched.accountledger &&
                          Formik.errors.accountledger
                        }
                      />
                    )}
                  />
                </Box>

                {/* amount_type */}
                <Box>
                  <Autocomplete
                    options={Array.isArray(amounttypes) ? amounttypes : []}
                    getOptionLabel={(option) => option?.label || ""}
                    value={selectedAmounttype}
                    onChange={(event, newValue) => {
                      setSelectedAmounttype(newValue);

                      Formik.setFieldValue(
                        "amount_type",
                        newValue ? newValue.value : "",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("amount_type", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select amount_type"
                        placeholder="Search amount_type..."
                        fullWidth
                        error={
                          Formik.touched.amount_type &&
                          Boolean(Formik.errors.amount_type)
                        }
                        helperText={
                          Formik.touched.amount_type &&
                          Formik.errors.amount_type
                        }
                      />
                    )}
                  />
                </Box>

                {/* mapping_type */}
                <Box>
                  <Autocomplete
                    options={Array.isArray(mappingtypes) ? mappingtypes : []}
                    getOptionLabel={(option) => option?.label || ""}
                    value={selectedMappingtype}
                    onChange={(event, newValue) => {
                      setSelectedMappingtype(newValue);

                      Formik.setFieldValue(
                        "mapping_type",
                        newValue ? newValue.value : "",
                      );
                    }}
                    onBlur={() => Formik.setFieldTouched("mapping_type", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select mapping_type"
                        placeholder="Search mapping_type..."
                        fullWidth
                        error={
                          Formik.touched.mapping_type &&
                          Boolean(Formik.errors.mapping_type)
                        }
                        helperText={
                          Formik.touched.mapping_type &&
                          Formik.errors.mapping_type
                        }
                      />
                    )}
                  />
                </Box>

                {/* Seq */}
                <Box>
                  <TextField
                    type="number"
                    fullWidth
                    label="Seq"
                    name="seq"
                    value={Formik.values.seq}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />
                  {Formik.touched.seq && Formik.errors.seq && (
                    <p style={{ color: "red" }}>{Formik.errors.seq}</p>
                  )}
                </Box>

                <Box sx={{ gridColumn: "1 / -1", mt: 1 }}>
                  <Button type="submit" variant="contained" sx={{ mr: 2 }}>
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

        {tab === 1 && (
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
                label="Search .."
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
            </Box>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      {" "}
                      Screen Name
                    </TableCell>
                    <TableCell align="right">Screen</TableCell>

                    <TableCell align="right">Accountledger</TableCell>
                    <TableCell align="right">Amount Type</TableCell>
                    <TableCell align="right">Mapping Type</TableCell>
                    <TableCell align="right">Account Type</TableCell>
                    <TableCell align="right">Seq</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accountsetups.map((value, i) => (
                    <TableRow
                      key={i}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {value.screen_name}
                      </TableCell>
                      <TableCell align="right">{value?.screen}</TableCell>

                      <TableCell align="right">
                        {value?.accountledger_name}
                      </TableCell>
                      <TableCell align="right">
                        {" "}
                        {value?.amount_type?.charAt(0).toUpperCase() +
                          value?.amount_type?.slice(1).toLowerCase()}
                      </TableCell>
                      <TableCell align="right">{value?.mapping_type}</TableCell>
                      <TableCell align="right">{value?.account_type}</TableCell>
                      <TableCell align="right">{value?.seq}</TableCell>
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
