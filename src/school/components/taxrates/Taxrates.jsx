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
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { taxrateSchema } from "../../../yupSchema/taxrateSchema";

export default function Taxrates() {
    const [params, setParams] = useState({});
    const [taxrates, setTaxrates] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [tab, setTab] = useState(0);
    const [taxtypes, setTaxtypes] = useState([]);
    const [selectedTaxtype, setSelectedTaxtype] = useState(null);

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete?")) {
            axios
                .delete(`${baseUrl}/taxrate/delete/${id}`)
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
        axios.get(`${baseUrl}/taxrate/fetch-single/${id}`)
            .then((resp) => {

                Formik.setFieldValue("tax_code", resp.data.data?.tax_code);
                Formik.setFieldValue("tax_name", resp.data.data?.tax_name);
                Formik.setFieldValue("tax_percent", resp.data.data?.tax_percent);
                Formik.setFieldValue("taxtype", resp.data.data?.taxtype || null);
                const matchedTaxtype = taxtypes.find(s => s.value === resp.data.data?.taxtype || null);
                setSelectedTaxtype(matchedTaxtype || null);


                setEditId(resp.data.data._id);
                setTab(0); // open Create Taxrate tab
            })
            .catch((e) => {
                console.log("Error  in fetching edit data.");
            });
    };

    const cancelEdit = () => {
        setEdit(false);
        setSelectedTaxtype(null);
        Formik.resetForm()
    };

    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {

        tax_code: "",
        tax_name: "",
        tax_percent: 0,
        taxtype:"",

    };
    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: taxrateSchema,
        onSubmit: (values) => {
            if (isEdit) {
                console.log("edit id", editId);
                axios
                    .patch(`${baseUrl}/taxrate/update/${editId}`, {
                        ...values,
                    })
                    .then((resp) => {
                        console.log("Edit submit", resp);
                        setMessage(resp.data.message);
                        setType("success");
                        cancelEdit();
                        setParams({});
                        setTab(1); // go to View List
                    })
                    .catch((e) => {
                        setMessage(e.response.data.message);
                        setType("error");
                        console.log("Error, edit casting submit", e);
                    });
            } else {

                axios
                    .post(`${baseUrl}/taxrate/create`, { ...values })
                    .then((resp) => {
                        console.log("Response after submitting admin casting", resp);
                        setMessage(resp.data.message);
                        setType("success");
                        cancelEdit();
                        setParams({});
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

    const [nooftaxrates, setNooftaxrates] = useState(0);
    const fetchTaxrates = () => {
        axios
            .get(`${baseUrl}/taxrate/fetch-with-query`, { params })
            .then((resp) => {
                setTaxrates(resp.data.data);
                setNooftaxrates(resp.data.data.length);
            })
            .catch(() => console.log("Error in fetching taxrates data"));


    };

    const fetchTaxtypes = async () => {
        try {

            const taxtypesData = [
                {
                    value: "inclusive",
                    label: "Inclusive Tax",
                    meaning: "Inclusive Tax"
                },
                {
                    value: "exclusive",
                    label: "Exclusive Tax",
                    meaning: "Exclusive Tax"
                },

            ];

            setTaxtypes(taxtypesData);

        } catch (error) {
            console.error('Error fetching statuses:', error);
        }
    };

    useEffect(() => {
        fetchTaxtypes();
        fetchTaxrates();

    }, [message, params]);

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
                    >
                        {/* <Tab label="Create Receipt" /> */}
                        <Tab label={isEdit ? "Edit Taxrate" : "Add New Taxrate"} />
                        <Tab label="View List" />
                    </Tabs>
                </Box>

                {tab === 0 && (
                    <Box>
                        <Paper sx={{ p: 3, m: 1 }}>
                            <Box
                                component="form"
                                noValidate
                                autoComplete="off"
                                onSubmit={Formik.handleSubmit}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2, // ✅ equal spacing between all items
                                }}
                            >






                                <Box>
                                    <TextField
                                        disabled={isEdit}
                                        fullWidth
                                        label="Taxrate Code"
                                        variant="outlined"
                                        name="tax_code"
                                        value={Formik.values.tax_code}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />

                                    {Formik.touched.tax_code && Formik.errors.tax_code && (
                                        <p style={{ color: "red", textTransform: "capitalize" }}>
                                            {Formik.errors.tax_code}
                                        </p>
                                    )}
                                </Box>

                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Taxrate Name"
                                        variant="outlined"
                                        name="tax_name"
                                        value={Formik.values.tax_name}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />

                                    {Formik.touched.tax_name && Formik.errors.tax_name && (
                                        <p style={{ color: "red", textTransform: "capitalize" }}>
                                            {Formik.errors.tax_name}
                                        </p>
                                    )}
                                </Box>

                                <Box>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        label="Percentage"
                                        name="tax_percent"
                                        value={Formik.values.tax_percent}
                                        onChange={Formik.handleChange}
                                        onBlur={Formik.handleBlur}
                                    />

                                    {Formik.touched.tax_percent &&
                                        Formik.errors.tax_percent && (
                                            <p style={{ color: "red" }}>
                                                {Formik.errors.tax_percent}
                                            </p>
                                        )}
                                </Box>

                                {/* Taxttype */}
                                <Box>
                                    <Autocomplete
                                        // disabled={isEdit}
                                        options={taxtypes}
                                        getOptionLabel={(option) => option.label}
                                        value={selectedTaxtype}
                                        onChange={(event, newValue) => {
                                            setSelectedTaxtype(newValue);

                                            Formik.setFieldValue(
                                                "taxtype",
                                                newValue ? newValue.value : ""
                                            );

                                        }}
                                        onBlur={() => Formik.setFieldTouched("taxtype", true)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select taxtype"
                                                placeholder="Search taxtype..."
                                                fullWidth
                                                error={Formik.touched.taxtype && Boolean(Formik.errors.taxtype)}
                                                helperText={Formik.touched.taxtype && Formik.errors.taxtype}
                                            />
                                        )}
                                    />
                                </Box>



                                <Box>
                                    <Button
                                        type="submit"
                                        sx={{ mr: 1 }}
                                        variant="contained"
                                    >
                                        Submit
                                    </Button>

                                    {isEdit && (
                                        <Button
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
                                label="Search Taxrate .."
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

                            {/* No of Taxrates */}
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
                                Taxrates Count : {nooftaxrates}
                            </Box>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="right">Tax Rate Code</TableCell>
                                        <TableCell align="right">Tax Rate Name</TableCell>
                                        <TableCell align="right">Percent</TableCell>
                                        <TableCell align="right">Taxtype</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {taxrates.map((value, i) => (
                                        <TableRow
                                            key={i}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >


                                            <TableCell align="right">{value?.tax_code}</TableCell>
                                            <TableCell align="right">{value?.tax_name}</TableCell>
                                            <TableCell align="right">{value?.tax_percent}</TableCell>
                                            <TableCell align="right">{value?.taxtype}</TableCell>
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
