import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

export default function TeacherDetails() {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };
  const Formik = useFormik({
    initialValues: {
      password: "",
    },

    validationSchema: Yup.object({
      password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
    }),

    onSubmit: async (values) => {
      console.log("Password:", values.password);

      // API call will go here
      const fd = new FormData();

      Object.keys(values).forEach((key) => {
        fd.append(key, values[key]);
      });

      if (file) {
        fd.append("image", file, file.name);
      }

      axios
        .patch(`${baseUrl}/teacher/updateprofile`, fd)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
          // setLoading(true);
        })
        .catch((e) => {
          setMessage(
            e.response?.data?.message || "Error updating teacher profile",
          );
          setType("error");
        });
    },
  });

  // ✅ Fetch Teacher
  const getTeacherDetails = async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${baseUrl}/teacher/fetch-own`);
      setTeacher(resp.data.data);
    } catch (e) {
      console.error("Error fetching teacher:", e);
      setError("Failed to load teacher details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeacherDetails();
  }, [message]);

  // ✅ Loading State
  if (loading) {
    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  // ✅ Error State
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // ✅ Empty State
  if (!teacher) {
    return <Alert severity="info">No teacher data found</Alert>;
  }

  // ✅ Mobile Card View
  const renderMobileView = () => (
    <Box
      sx={{
        border: "1px solid #ddd",
        borderRadius: 3,
        p: 2,
        boxShadow: 2,
      }}
    >
      {renderRow("Name", teacher.name)}
      {renderRow("Email", teacher.email)}
      {renderRow("Age", teacher.age)}
      {renderRow("Gender", teacher.gender)}
      {renderRow("Qualification", teacher.qualification)}
    </Box>
  );

  // ✅ Table Row Reusable
  const renderRow = (label, value) => (
    <Box sx={{ mb: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="500">
        {value || "-"}
      </Typography>
    </Box>
  );

  // ✅ Desktop Table View
  const renderTableView = () => (
    <>
      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      <TableContainer
        component={Paper}
        sx={{
          maxWidth: 700,
          margin: "auto",
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Table>
          <TableBody>
            {[
              ["Name", teacher.name],
              ["Email", teacher.email],
              ["Age", teacher.age],
              ["Gender", teacher.gender],
              ["Qualification", teacher.qualification],
            ].map(([label, value]) => (
              <TableRow key={label}>
                <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                  {label}
                </TableCell>
                <TableCell>{value || "-"}</TableCell>
              </TableRow>
            ))}
            {/* Password */}
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                Password
              </TableCell>

              <TableCell>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  name="password"
                  value={Formik.values.password}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                  error={
                    Formik.touched.password && Boolean(Formik.errors.password)
                  }
                  helperText={
                    Formik.touched.password && Formik.errors.password
                      ? Formik.errors.password
                      : ""
                  }
                />
              </TableCell>
            </TableRow>

            {/* Submit and Cancel Buttons */}
            <TableRow>
              <TableCell></TableCell>

              <TableCell>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-start",
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={Formik.handleSubmit}
                  >
                    Submit
                  </Button>

                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      Formik.resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
      {/* Title */}
      <Typography
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 3,
          fontSize: { xs: "22px", sm: "26px", md: "32px" },
        }}
      >
        Teacher Details
      </Typography>

      {/* Image */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <Box
          component="img"
          src={teacher.teacher_image}
          alt="teacher"
          sx={{
            width: { xs: 140, sm: 200, md: 250 },
            height: { xs: 140, sm: 200, md: 250 },
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid lightgreen",
            p: "4px",
          }}
        />
      </Box>

      {/* Data */}
      {isMobile ? renderMobileView() : renderTableView()}
    </Box>
  );
}
