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
  Tabs,
  Tab,
} from "@mui/material";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { itemSchema } from "../../../yupSchema/itemSchema";

export default function Items() {
  const [studentItem, setStudentItem] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [attendeeClass, setAttendeeClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [itemtype, setItemtype] = useState([]);
  const [selectedItemtype, setSelectedItemtype] = useState(null);

  const [itemgroups, setItemgroups] = useState([]);
  const [selectedItemgroup, setSelectedItemgroup] = useState(null);

  const [selectedTaxrate, setSelectedTaxrate] = useState(null);

  const [accountledgers, setAccountledgers] = useState([]);
  const [selectedAccountledger, setSelectedAccountledger] = useState(null);

  const [tab, setTab] = useState(0);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/item/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
          clearForm();
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
      .get(`${baseUrl}/item/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("name", resp.data.data.name);
        Formik.setFieldValue("code", resp.data.data.code);
        Formik.setFieldValue("class", resp.data.data?.class?._id);
        Formik.setFieldValue("itemtype", resp?.data?.data?.itemtype?._id);
        Formik.setFieldValue("itemgroup", resp?.data?.data?.itemgroup?._id);
        Formik.setFieldValue("taxrate", resp?.data?.data?.taxrate?._id);
        Formik.setFieldValue(
          "tax_percent",
          resp?.data?.data?.taxrate?.tax_percent,
        );
        Formik.setFieldValue("taxtype", resp?.data?.data?.taxrate?.taxtype);
        Formik.setFieldValue("sales_price", resp.data.data.sales_price);
        Formik.setFieldValue("purchase_price", resp.data.data.purchase_price);
        // const classId = resp.data.data?.class?._id;
        // const matchedClass = attendeeClass.find(c => c._id === classId);
        setSelectedItemgroup(resp.data.data?.itemgroup);

        setSelectedItemtype(resp.data.data?.itemtype);
        setSelectedTaxrate(resp.data.data?.taxrate);

        setEditId(resp.data.data._id);
        setTab(0); // open Create Class tab
      })
      .catch((e) => {
        console.log("Error  in fetching edit data.");
      });
  };

  const cancelEdit = () => {
    setEdit(false);
    // Formik.resetForm()
    clearForm();
  };

  const clearForm = () => {
    setEdit(false);
    setEditId(null);
    Formik.resetForm();
    //  reset Autocomplete values

    setSelectedItemtype(null);
    setSelectedItemgroup(null);
    setSelectedTaxrate(null);
  };

  //   MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const resetMessage = () => {
    setMessage("");
  };

  const initialValues = {
    name: "",
    code: "",
    itemtype: "",
    itemgroup: "",
    taxrate: "",
    tax_percent: 0,
    taxtype: "",
    sales_price: 0,
    purchase_price: 0,
  };
  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: itemSchema,
    onSubmit: (values) => {
      values.taxrate = selectedItemtype?.taxrate;
      values.tax_percent = selectedItemtype?.tax_percent;
      values.taxtype = selectedItemtype?.taxtype || "inclusive";

      if (isEdit) {
        console.log("edit id", editId);
        axios
          .patch(`${baseUrl}/item/update/${editId}`, {
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
          .post(`${baseUrl}/item/create`, { ...values })
          .then((resp) => {
            console.log("Response after submitting admin casting", resp);
            setMessage(resp.data.message);
            setType("success");
            setTab(1); // go to View List
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, response admin casting calls", e);
          });
        // Formik.resetForm();
        clearForm();
      }
    },
  });

  const [month, setMonth] = useState([]);
  const [year, setYear] = useState([]);

  const fetchstudentsitem = () => {
    axios
      .get(`${baseUrl}/item/fetch-all`)
      .then((resp) => {
        console.log("Fetching data in  Casting Calls  admin.", resp);
        setStudentItem(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching casting calls admin data", e);
      });
  };

  const fetchClass = async () => {
    try {
      const attendee = await axios.get(`${baseUrl}/class/fetch-all`);
      console.log("attendee", attendee);
      setAttendeeClass(attendee.data.data);
    } catch (error) {
      console.error("Error fetching Class:", error);
    }
  };

  const fetchItemtype = async () => {
    try {
      const itemtypes = await axios.get(`${baseUrl}/itemtype/fetch-all`);
      console.log("itemtypes", itemtypes);
      setItemtype(itemtypes.data.data);
    } catch (error) {
      console.error("Error fetching Class:", error);
    }
  };
  const fetchItemgroups = async () => {
    try {
      const itemgroupsData = await axios.get(`${baseUrl}/itemgroup/fetch-all`);

      setItemgroups(itemgroupsData.data.data);
    } catch (error) {
      console.error("Error fetching item Group:", error);
    }
  };
  useEffect(() => {
    fetchClass();
    fetchItemtype();
    fetchItemgroups();

    fetchstudentsitem();
  }, [message]);
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
            <Tab label={isEdit ? "Edit Item" : "Add New Item"} />
            <Tab label="View List" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Box component={"div"} sx={{}}>
            <Paper sx={{ padding: "20px", margin: "10px" }}>
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
                      md: "1fr 1fr", // desktop
                    },
                    gap: 2.5,
                    mt: 3,
                  }}
                >
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

                  <TextField
                    disabled={isEdit}
                    fullWidth
                    sx={{ marginTop: "10px" }}
                    id="filled-basic"
                    label="code "
                    variant="outlined"
                    name="code"
                    value={Formik.values.code}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  />
                  {Formik.touched.code && Formik.errors.code && (
                    <p style={{ color: "red", textTransform: "capitalize" }}>
                      {Formik.errors.code}
                    </p>
                  )}

                  {/* Class
                  {attendeeClass.length > 0 && (
                    <Box>
                      <Autocomplete
                        disabled={isEdit}
                        options={attendeeClass}
                        getOptionLabel={(option) => option?.class_name}
                        value={selectedClass}
                        onChange={(event, newValue) => {
                          setSelectedClass(newValue);

                          Formik.setFieldValue(
                            "class",
                            newValue ? newValue._id : "",
                          );
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
                  )} */}

                  {/* Itemtype */}

                  <Box>
                    <Autocomplete
                      // disabled={isEdit}
                      options={itemtype}
                      getOptionLabel={(option) => option.itemtype_name}
                      value={selectedItemtype}
                      onChange={(event, newValue) => {
                        setSelectedItemtype(newValue);
                        setSelectedTaxrate(newValue?.taxrate);

                        Formik.setFieldValue(
                          "itemtype",
                          newValue ? newValue._id : "",
                        );
                        Formik.setFieldValue(
                          "taxrate",
                          newValue ? newValue?.taxrate?._id : "",
                        );
                        Formik.setFieldValue(
                          "tax_percent",
                          newValue ? newValue?.tax_percent : 0,
                        );
                        Formik.setFieldValue(
                          "taxtype",
                          newValue ? newValue?.taxtype : 0,
                        );
                      }}
                      onBlur={() => Formik.setFieldTouched("itemtype", true)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Itemtype"
                          placeholder="Search itemtype..."
                          fullWidth
                          error={
                            Formik.touched.itemtype &&
                            Boolean(Formik.errors.itemtype)
                          }
                          helperText={
                            Formik.touched.itemtype && Formik.errors.itemtype
                          }
                        />
                      )}
                    />
                  </Box>

                  {/* Itemgroup */}

                  <Box>
                    <Autocomplete
                      // disabled={isEdit}
                      options={itemgroups}
                      getOptionLabel={(option) => option.itemgroup_name}
                      value={selectedItemgroup}
                      onChange={(event, newValue) => {
                        setSelectedItemgroup(newValue);

                        Formik.setFieldValue(
                          "itemgroup",
                          newValue ? newValue._id : "",
                        );
                      }}
                      onBlur={() => Formik.setFieldTouched("itemgroup", true)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Itemgroup"
                          placeholder="Search itemgroup..."
                          fullWidth
                          error={
                            Formik.touched.itemgroup &&
                            Boolean(Formik.errors.itemgroup)
                          }
                          helperText={
                            Formik.touched.itemgroup && Formik.errors.itemgroup
                          }
                        />
                      )}
                    />
                  </Box>

                  {/* sales_price */}
                  <Box>
                    <TextField
                      fullWidth
                      label="sales_price"
                      variant="outlined"
                      name="sales_price"
                      type="number"
                      value={Formik.values.sales_price}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      disabled={isEdit}
                    />
                    {Formik.touched.sales_price &&
                      Formik.errors.sales_price && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.sales_price}
                        </Typography>
                      )}
                  </Box>
                  {/* purchase_price */}
                  <Box>
                    <TextField
                      fullWidth
                      label="purchase_price"
                      variant="outlined"
                      name="purchase_price"
                      type="number"
                      value={Formik.values.purchase_price}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                      disabled={isEdit}
                    />
                    {Formik.touched.purchase_price &&
                      Formik.errors.purchase_price && (
                        <Typography color="error" variant="caption">
                          {Formik.errors.purchase_price}
                        </Typography>
                      )}
                  </Box>
                </Box>

                <Box sx={{ marginTop: "10px" }} component={"div"}>
                  <Button
                    type="submit"
                    sx={{ marginRight: "10px" }}
                    variant="contained"
                  >
                    Submit
                  </Button>
                  {isEdit && (
                    <Button
                      sx={{ marginRight: "10px" }}
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

        {tab === 1 && (
          <Box>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      {" "}
                      Name
                    </TableCell>
                    <TableCell align="right">Code</TableCell>
                    <TableCell align="right">Class</TableCell>
                    <TableCell align="right">Itemtype</TableCell>
                    <TableCell align="right">Sales Price</TableCell>
                    <TableCell align="right">Purchase Price</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentItem.map((value, i) => (
                    <TableRow
                      key={i}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {value.name}
                      </TableCell>
                      <TableCell align="right">{value.code}</TableCell>
                      <TableCell align="right">
                        {value?.class?.class_name}
                      </TableCell>
                      <TableCell align="right">
                        {value?.itemtype?.itemtype_name || ""}
                      </TableCell>
                      <TableCell align="right">{value.sales_price}</TableCell>
                      <TableCell align="right">
                        {value.purchase_price}
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
