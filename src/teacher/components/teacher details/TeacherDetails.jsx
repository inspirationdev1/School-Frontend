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
  CardMedia,
} from "@mui/material";

import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useRef, useState } from "react";

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

  const fileInputRef = useRef(null);

  // =========================================================
  // MESSAGE
  // =========================================================

  const resetMessage = () => {
    setMessage("");
  };

  // =========================================================
  // IMAGE UPLOAD
  // =========================================================

  const addImage = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    // Optional validation
    if (!selectedFile.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      setType("error");

      event.target.value = "";
      return;
    }

    // Optional size validation - 5 MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("Image size should not exceed 5 MB.");
      setType("error");

      event.target.value = "";
      return;
    }

    setFile(selectedFile);

    // Create preview
    setImageUrl(URL.createObjectURL(selectedFile));
  };

  // =========================================================
  // CLEAR IMAGE
  // =========================================================

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Release preview URL
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setFile(null);
    setImageUrl(null);
  };

  // =========================================================
  // FORMIK
  // =========================================================

  const Formik = useFormik({
    initialValues: {
      password: "",
    },

    // validationSchema: Yup.object({
    //   password: Yup.string()
    //     .required("Password is required")
    //     .min(6, "Password must be at least 6 characters"),
    // }),

    onSubmit: async (values) => {
      try {
        const fd = new FormData();

        // Password
        if (values.password) {
          fd.append("password", values.password);
        }

        // Image
        if (file) {
          fd.append("image", file, file.name);
        }

        const resp = await axios.patch(`${baseUrl}/teacher/updateprofile`, fd);

        setMessage(resp.data.message);
        setType("success");

        // Clear password
        Formik.resetForm();

        // Clear selected image
        handleClearFile();

        // Refresh teacher details
        await getTeacherDetails();
      } catch (e) {
        console.error("Error updating teacher profile:", e);

        setMessage(
          e.response?.data?.message || "Error updating teacher profile",
        );

        setType("error");
      }
    },
  });

  // =========================================================
  // FETCH TEACHER
  // =========================================================

  const getTeacherDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const resp = await axios.get(`${baseUrl}/teacher/fetch-own`);

      const teacherData = resp.data.data;

      setTeacher(teacherData);
    } catch (e) {
      console.error("Error fetching teacher:", e);

      setError("Failed to load teacher details");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    getTeacherDetails();

    // Cleanup image preview when component unmounts
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // =========================================================
  // EMPTY
  // =========================================================

  if (!teacher) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">No teacher data found</Alert>
      </Box>
    );
  }

  // =========================================================
  // DISPLAY IMAGE
  // =========================================================

  const displayImage = imageUrl || teacher.teacher_image;

  // =========================================================
  // REUSABLE ROW
  // =========================================================

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

  // =========================================================
  // IMAGE UPLOAD SECTION
  // =========================================================

  const renderImageUpload = () => (
    <Box
      sx={{
        mt: 3,
        p: { xs: 2, sm: 3 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          mb: 2,
        }}
      >
        Update Teacher Image
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "center",
            sm: "center",
          },
          gap: 2,
        }}
      >
        {/* IMAGE PREVIEW */}

        <CardMedia
          component="img"
          image={displayImage}
          alt="Teacher"
          sx={{
            width: {
              xs: 120,
              sm: 140,
            },
            height: {
              xs: 120,
              sm: 140,
            },
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid lightgreen",
            p: "3px",
            flexShrink: 0,
          }}
        />

        {/* FILE INPUT */}

        <Box
          sx={{
            width: "100%",
            maxWidth: {
              xs: "100%",
              sm: 400,
            },
          }}
        >
          <TextField
            fullWidth
            type="file"
            inputRef={fileInputRef}
            onChange={addImage}
            inputProps={{
              accept: "image/*",
            }}
            sx={{
              "& input": {
                fontSize: {
                  xs: "13px",
                  sm: "14px",
                },
              },
            }}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 1,
            }}
          >
            Select JPG, JPEG, PNG or other image file. Maximum size: 5 MB.
          </Typography>

          {file && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleClearFile}
              sx={{
                mt: 1.5,
              }}
            >
              Clear Image
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );

  // =========================================================
  // MOBILE VIEW
  // =========================================================

  const renderMobileView = () => (
    <>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 600,
          mx: "auto",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          {/* DETAILS */}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: {
                xs: 1.5,
                sm: 2,
              },
            }}
          >
            {renderRow("Name", teacher.name)}

            {renderRow("Email", teacher.email)}

            {renderRow("Age", teacher.age)}

            {renderRow("Gender", teacher.gender)}

            {renderRow("Qualification", teacher.qualification)}
          </Box>

          {/* DIVIDER */}

          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              my: 2.5,
            }}
          />

          {/* IMAGE UPLOAD */}

          {renderImageUpload()}

          {/* PASSWORD */}

          <Box
            sx={{
              width: "100%",
              mt: 3,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
              }}
            >
              Password
            </Typography>

            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={Formik.values.password}
              onChange={Formik.handleChange}
              onBlur={Formik.handleBlur}
              error={Formik.touched.password && Boolean(Formik.errors.password)}
              helperText={
                Formik.touched.password && Formik.errors.password
                  ? Formik.errors.password
                  : "Enter a new password"
              }
              size="medium"
              sx={{
                "& .MuiInputBase-root": {
                  minHeight: {
                    xs: 52,
                    sm: 56,
                  },
                },
              }}
            />
          </Box>

          {/* BUTTONS */}

          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              gap: 1.5,
              mt: 3,
              width: "100%",
            }}
          >
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={Formik.handleSubmit}
              disabled={Formik.isSubmitting}
              sx={{
                minHeight: 48,
                fontWeight: 600,
              }}
            >
              {Formik.isSubmitting ? "Updating..." : "Update"}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => {
                Formik.resetForm();
                handleClearFile();
              }}
              sx={{
                minHeight: 48,
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </>
  );

  // =========================================================
  // DESKTOP VIEW
  // =========================================================

  const renderTableView = () => (
    <>
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
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    width: "40%",
                  }}
                >
                  {label}
                </TableCell>

                <TableCell>{value || "-"}</TableCell>
              </TableRow>
            ))}

            {/* PASSWORD */}

            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  width: "40%",
                }}
              >
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

            {/* IMAGE */}

            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  width: "40%",
                  verticalAlign: "top",
                }}
              >
                Teacher Image
              </TableCell>

              <TableCell>{renderImageUpload()}</TableCell>
            </TableRow>

            {/* BUTTONS */}

            <TableRow>
              <TableCell />

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
                    disabled={Formik.isSubmitting}
                  >
                    {Formik.isSubmitting ? "Updating..." : "Update"}
                  </Button>

                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      Formik.resetForm();
                      handleClearFile();
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

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <Box
      sx={{
        px: {
          xs: 1.5,
          sm: 3,
        },
        py: 3,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* MESSAGE */}

      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      {/* TITLE */}

      <Typography
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 3,
          fontSize: {
            xs: "22px",
            sm: "26px",
            md: "32px",
          },
        }}
      >
        Teacher Details
      </Typography>

      {/* CURRENT / PREVIEW IMAGE */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <Box
          component="img"
          src={displayImage}
          alt="teacher"
          sx={{
            width: {
              xs: 140,
              sm: 200,
              md: 250,
            },
            height: {
              xs: 140,
              sm: 200,
              md: 250,
            },
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid lightgreen",
            p: "4px",
          }}
        />
      </Box>

      {/* RESPONSIVE DATA */}

      {isMobile ? renderMobileView() : renderTableView()}
    </Box>
  );
}
