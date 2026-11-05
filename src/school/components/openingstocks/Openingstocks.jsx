import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import { baseUrl } from "../../../environment";

// Change this if your registered print route has a different path.
const PRINT_PATH = "/company/OpeningstockPrint";

const emptyRow = () => ({
  item: null,
  quantity: 1,
  purchase_price: 0,
  grossAmount: 0,
  remarks: "",
});

const initialForm = () => ({
  openingStockDate: dayjs().format("YYYY-MM-DD"),
  remarks: "",
  status: "valid",
});

const getItemId = (item) => {
  if (!item) return "";
  return typeof item === "object" ? item._id : item;
};

const getItemName = (item) => {
  if (!item) return "";

  if (typeof item === "string") return item;

  return item.item?.name || item.name || item.item_name || "";
};

export default function Openingstocks() {
  const [records, setRecords] = useState([]);
  const [items, setItems] = useState([]);

  const [form, setForm] = useState(initialForm());
  const [rows, setRows] = useState([emptyRow()]);

  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [tabValue, setTabValue] = useState(0);

  const [viewRecord, setViewRecord] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // --------------------------------------------------
  // TOTALS
  // --------------------------------------------------

  const totalQuantity = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0),
    [rows],
  );

  const totalValue = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.grossAmount) || 0), 0),
    [rows],
  );

  // --------------------------------------------------
  // FETCH OPENING STOCK RECORDS
  // --------------------------------------------------

  const fetchRecords = useCallback(async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/openingstock/fetch-with-query`,
      );

      setRecords(response.data?.data || []);
    } catch (e) {
      setError(
        e.response?.data?.message || "Unable to fetch Opening Stock records.",
      );
    }
  }, []);

  // --------------------------------------------------
  // FETCH ITEMS
  // --------------------------------------------------

  const fetchItems = useCallback(async () => {
    try {
      const response = await axios.get(`${baseUrl}/item/fetch-all`);

      setItems(response.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to fetch items.");
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchItems();
  }, [fetchRecords, fetchItems]);

  // --------------------------------------------------
  // SEARCH: CODE, ITEM NAME AND STATUS
  // --------------------------------------------------

  const filteredRecords = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return records;

    return records.filter((record) => {
      const stockCode = (record.osCode || "").toLowerCase();

      const status = (record.status || "").toLowerCase();

      const itemNames = (record.invoiceDetails || [])
        .map((detail) => {
          return (
            detail.item_name ||
            getItemName(detail.item) ||
            ""
          ).toLowerCase();
        })
        .join(" ");

      return (
        stockCode.includes(searchText) ||
        status.includes(searchText) ||
        itemNames.includes(searchText)
      );
    });
  }, [records, search]);

  // --------------------------------------------------
  // CHANGE ITEM ROW
  // --------------------------------------------------

  const changeRow = (index, key, value) => {
    setRows((old) =>
      old.map((row, i) => {
        if (i !== index) return row;

        const next = { ...row, [key]: value };

        if (key === "quantity" || key === "purchase_price") {
          next.grossAmount = Number(
            (
              (Number(next.quantity) || 0) * (Number(next.purchase_price) || 0)
            ).toFixed(2),
          );
        }

        return next;
      }),
    );
  };

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------

  const reset = () => {
    setForm(initialForm());
    setRows([emptyRow()]);
    setEditId(null);
    setError("");
  };

  // --------------------------------------------------
  // EDIT OPENING STOCK
  // --------------------------------------------------

  const editRecord = async (id) => {
    setError("");
    setMessage("");

    try {
      const response = await axios.get(
        `${baseUrl}/openingstock/fetch-single/${id}`,
      );

      const data = response.data.data;

      setEditId(data._id);

      setForm({
        openingStockDate: dayjs(data.openingStockDate).format("YYYY-MM-DD"),
        remarks: data.remarks || "",
        status: data.status || "valid",
      });

      setRows(
        (data.invoiceDetails || []).map((r) => {
          const itemId = getItemId(r.item);

          const selectedItem =
            items.find((item) => item._id === itemId) ||
            (typeof r.item === "object" && r.item
              ? r.item
              : r.item
                ? {
                    _id: r.item,
                    name: r.item_name || "",
                  }
                : null);

          return {
            item: selectedItem,
            quantity: r.quantity ?? 1,
            purchase_price: r.purchase_price ?? 0,
            grossAmount: r.grossAmount ?? 0,
            remarks: r.remarks || "",
          };
        }),
      );

      setTabValue(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(
        e.response?.data?.message || "Unable to load Opening Stock record.",
      );
    }
  };

  // --------------------------------------------------
  // VIEW OPENING STOCK
  // --------------------------------------------------

  const viewRecordDetails = async (id) => {
    setViewLoading(true);
    setViewRecord(null);
    setError("");

    try {
      const response = await axios.get(
        `${baseUrl}/openingstock/fetch-single/${id}`,
      );

      setViewRecord(response.data.data);
    } catch (e) {
      setError(
        e.response?.data?.message || "Unable to load Opening Stock details.",
      );
    } finally {
      setViewLoading(false);
    }
  };

  // --------------------------------------------------
  // SAVE / UPDATE OPENING STOCK
  // --------------------------------------------------

  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.openingStockDate) {
      return setError("Select the Opening Stock date.");
    }

    if (
      !rows.length ||
      rows.some(
        (r) =>
          !r.item?._id ||
          Number(r.quantity) <= 0 ||
          Number(r.purchase_price) < 0,
      )
    ) {
      return setError(
        "Select an item and enter a valid quantity and rate for every row.",
      );
    }

    const ids = rows.map((r) => r.item._id);

    if (new Set(ids).size !== ids.length) {
      return setError(
        "An item cannot be repeated in the same Opening Stock entry.",
      );
    }

    const payload = {
      ...form,
      month: dayjs(form.openingStockDate).month() + 1,
      monthname: dayjs(form.openingStockDate).format("MMMM"),
      year: dayjs(form.openingStockDate).year(),

      invoiceDetails: rows.map((r) => ({
        item: r.item._id,
        item_name: getItemName(r.item),
        quantity: Number(r.quantity),
        purchase_price: Number(r.purchase_price),
        grossAmount: Number(
          (Number(r.quantity) * Number(r.purchase_price)).toFixed(2),
        ),
        remarks: r.remarks || "",
      })),
    };

    setBusy(true);

    try {
      const response = editId
        ? await axios.patch(`${baseUrl}/openingstock/update/${editId}`, payload)
        : await axios.post(`${baseUrl}/openingstock/create`, payload);

      setMessage(response.data?.message || "Opening Stock saved successfully.");

      reset();

      await fetchRecords();

      setTabValue(1);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to save Opening Stock.");
    } finally {
      setBusy(false);
    }
  };

  // --------------------------------------------------
  // DELETE / CANCEL OPENING STOCK
  // --------------------------------------------------

  const cancelRecord = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this Opening Stock record?",
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(
        `${baseUrl}/openingstock/delete/${id}`,
      );

      setMessage(response.data?.message || "Record cancelled.");

      await fetchRecords();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to cancel record.");
    }
  };

  // --------------------------------------------------
  // PRINT OPENING STOCK
  // --------------------------------------------------

  const printRecord = (record) => {
    const printUrl =
      `${PRINT_PATH}?data=` + encodeURIComponent(JSON.stringify(record));

    window.open(printUrl, "_blank", "noopener,noreferrer");
  };

  // --------------------------------------------------
  // VIEW DIALOG
  // --------------------------------------------------

  const renderViewDialog = () => (
    <Dialog
      open={Boolean(viewRecord) || viewLoading}
      onClose={() => setViewRecord(null)}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Opening Stock Details</DialogTitle>

      <DialogContent dividers>
        {viewLoading ? (
          <Typography>Loading details...</Typography>
        ) : viewRecord ? (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
                mb: 3,
              }}
            >
              <Typography>
                <b>Stock Code:</b> {viewRecord.osCode || "—"}
              </Typography>

              <Typography>
                <b>Date:</b>{" "}
                {dayjs(viewRecord.openingStockDate).format("DD-MM-YYYY")}
              </Typography>

              <Typography>
                <b>Status:</b> {viewRecord.status || "—"}
              </Typography>

              <Typography>
                <b>Remarks:</b> {viewRecord.remarks || "—"}
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ mb: 1 }}>
              Item Details
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Opening Value</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(viewRecord.invoiceDetails || []).map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {detail.item_name || getItemName(detail.item) || "—"}
                      </TableCell>

                      <TableCell align="right">{detail.quantity}</TableCell>

                      <TableCell align="right">
                        {Number(detail.purchase_price || 0).toFixed(2)}
                      </TableCell>

                      <TableCell align="right">
                        {Number(detail.grossAmount || 0).toFixed(2)}
                      </TableCell>

                      <TableCell>{detail.remarks || "—"}</TableCell>
                    </TableRow>
                  ))}

                  {!viewRecord.invoiceDetails?.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No item details found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Typography fontWeight={700}>
                Total Opening Value:{" "}
                {(viewRecord.invoiceDetails || [])
                  .reduce(
                    (sum, detail) => sum + (Number(detail.grossAmount) || 0),
                    0,
                  )
                  .toFixed(2)}
              </Typography>
            </Box>
          </>
        ) : null}
      </DialogContent>

      <DialogActions>
        {viewRecord && (
          <Button onClick={() => printRecord(viewRecord)} color="secondary">
            Print
          </Button>
        )}

        <Button onClick={() => setViewRecord(null)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  // ==================================================
  // MAIN SCREEN
  // ==================================================

  return (
    <Box
      sx={{
        p: { xs: 1, md: 3 },
        display: "grid",
        gap: 2,
      }}
    >
      <Typography variant="h5" fontWeight={700}>
        Opening Stock
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {message && (
        <Alert severity="success" onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {/* TABS */}

      <Paper sx={{ px: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, value) => setTabValue(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Create Opening Stock" />

          <Tab label="Opening Stock List" />
        </Tabs>
      </Paper>

      {/* ============================================= */}
      {/* TAB 1: CREATE / EDIT */}
      {/* ============================================= */}

      {tabValue === 0 && (
        <Paper component="form" onSubmit={submit} sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editId ? "Edit Opening Stock" : "Create Opening Stock"}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 2fr",
              },
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              label="Opening Stock Date"
              type="date"
              required
              value={form.openingStockDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  openingStockDate: e.target.value,
                })
              }
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Remarks"
              value={form.remarks}
              onChange={(e) =>
                setForm({
                  ...form,
                  remarks: e.target.value,
                })
              }
              multiline
            />
          </Box>

          {/* ITEM ROWS */}

          {rows.map((row, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "2fr 1fr 1fr 1fr auto",
                  },
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Autocomplete
                  options={items}
                  value={row.item}
                  getOptionLabel={(option) => getItemName(option)}
                  isOptionEqualToValue={(a, b) => a?._id === b?._id}
                  onChange={(_, value) => changeRow(index, "item", value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Item" required />
                  )}
                />

                <TextField
                  label="Quantity"
                  type="number"
                  inputProps={{
                    min: 0.000001,
                    step: "any",
                  }}
                  value={row.quantity}
                  onChange={(e) => changeRow(index, "quantity", e.target.value)}
                  required
                />

                <TextField
                  label="Rate"
                  type="number"
                  inputProps={{
                    min: 0,
                    step: "any",
                  }}
                  value={row.purchase_price}
                  onChange={(e) =>
                    changeRow(index, "purchase_price", e.target.value)
                  }
                  required
                />

                <TextField
                  label="Opening Value"
                  type="number"
                  value={row.grossAmount}
                  InputProps={{ readOnly: true }}
                />

                <Button
                  color="error"
                  disabled={rows.length === 1}
                  onClick={() =>
                    setRows((old) => old.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </Button>
              </Box>
            </Paper>
          ))}

          {/* FORM FOOTER */}

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setRows((old) => [...old, emptyRow()])}
            >
              + Add Item
            </Button>

            <Typography>
              Items quantity: <b>{totalQuantity}</b>
              {" · "}
              Total opening value: <b>{totalValue.toFixed(2)}</b>
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button type="submit" variant="contained" disabled={busy}>
                {busy ? "Saving..." : editId ? "Update" : "Save Opening Stock"}
              </Button>

              {editId && (
                <Button variant="outlined" onClick={reset}>
                  Cancel Edit
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {/* ============================================= */}
      {/* TAB 2: OPENING STOCK LIST */}
      {/* ============================================= */}

      {tabValue === 1 && (
        <Paper sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              mb: 2,
            }}
          >
            <Typography variant="h6">Opening Stock List</Typography>
          </Box>

          {/* SEARCH */}

          <TextField
            label="Search by Stock Code  / Status"
            placeholder="Enter stock code or status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 2 }}
          />

          {/* LIST TABLE */}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Opening Stock Code</b>
                  </TableCell>

                  <TableCell>
                    <b>Date</b>
                  </TableCell>

                  

                  <TableCell>
                    <b>Remarks</b>
                  </TableCell>

                  <TableCell>
                    <b>Status</b>
                  </TableCell>

                  <TableCell align="right">
                    <b>Actions</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record._id} hover>
                    <TableCell>{record.osCode || "—"}</TableCell>

                    <TableCell>
                      {record.openingStockDate
                        ? dayjs(record.openingStockDate).format("DD-MM-YYYY")
                        : "—"}
                    </TableCell>

                    <TableCell
                      sx={{
                        minWidth: 180,
                        maxWidth: 300,
                        whiteSpace: "normal",
                      }}
                    >
                      {(record.invoiceDetails || [])
                        .map(
                          (detail) =>
                            detail.item_name || getItemName(detail.item),
                        )
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </TableCell>

                    <TableCell>{record.remarks || "—"}</TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={record.status || "—"}
                        color={
                          record.status === "valid" ? "success" : "default"
                        }
                      />
                    </TableCell>

                    {/* ACTION BUTTONS */}

                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        {record.status === "valid" && (
                          <>
                            <Button
                              size="small"
                              onClick={() => editRecord(record._id)}
                            >
                              Edit
                            </Button>

                            <Button
                              size="small"
                              color="error"
                              onClick={() => cancelRecord(record._id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}

                        <Button
                          size="small"
                          color="secondary"
                          onClick={() => printRecord(record)}
                        >
                          Print
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {!filteredRecords.length && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No Opening Stock records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 2,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total records: {filteredRecords.length}
            </Typography>

            <Button size="small" onClick={fetchRecords}>
              Refresh List
            </Button>
          </Box>
        </Paper>
      )}

      {/* VIEW DETAILS DIALOG */}

      {renderViewDialog()}
    </Box>
  );
}
