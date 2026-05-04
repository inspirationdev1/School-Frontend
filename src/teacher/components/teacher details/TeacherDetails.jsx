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
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../../../environment";

export default function TeacherDetails() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, []);

  // ✅ Loading State
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
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
        </TableBody>
      </Table>
    </TableContainer>
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
