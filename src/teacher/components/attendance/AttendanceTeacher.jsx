import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  Alert,
  Autocomplete,
  TextField,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { baseUrl } from "../../../environment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const AttendanceTeacher = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendanceTaken, setAttendanceTaken] = useState(false);
  const [loading, setLoading] = useState(false);

  const [attendeeClass, setAttendeeClass] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(dayjs());

  // ✅ Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [classRes, sectionRes] = await Promise.all([
        axios.get(`${baseUrl}/class/attendee`),
        axios.get(`${baseUrl}/section/fetch-all`),
      ]);

      setAttendeeClass(classRes.data);
      setSections(sectionRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch students & attendance
  useEffect(() => {
    if (!selectedClass || !selectedSection || !attendanceDate) return;

    fetchStudents();
  }, [selectedClass, selectedSection, attendanceDate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const selectedDate = dayjs(attendanceDate).format("DD-MM-YYYY");

      const attendanceRes = await axios.get(
        `${baseUrl}/attendance/check/${selectedClass.classId}`,
        {
          params: {
            classId: selectedClass.classId,
            sectionId: selectedSection._id,
            selectedDate,
          },
        }
      );

      setAttendanceTaken(attendanceRes.data.attendanceTaken);

      const studentRes = await axios.get(
        `${baseUrl}/student/fetch-with-query`,
        {
          params: {
            student_class: selectedClass.classId,
            section: selectedSection._id,
          },
        }
      );

      const studentList = studentRes.data.data;
      setStudents(studentList);

      // ✅ Build attendance map
      const statusMap = {};
      studentList.forEach((student) => {
        const existing = attendanceRes.data.data?.find(
          (a) => a.student === student._id
        );
        statusMap[student._id] = existing?.status || "Present";
      });

      setAttendanceStatus(statusMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle change
  const handleStatusChange = (id, value) => {
    setAttendanceStatus((prev) => ({ ...prev, [id]: value }));
  };

  // ✅ Submit
  const submitAttendance = async () => {
    try {
      const selectedDate = dayjs(attendanceDate).format("DD-MM-YYYY");

      const payload = students.map((s) => ({
        studentId: s._id,
        date: selectedDate,
        status: attendanceStatus[s._id],
        classId: selectedClass.classId,
        sectionId: selectedSection._id,
      }));

      await Promise.all(
        payload.map((record) =>
          axios.post(`${baseUrl}/attendance/mark`, record)
        )
      );

      alert("Attendance submitted successfully");
      setAttendanceTaken(true);
    } catch (err) {
      console.error(err);
    }
  };

  const printAttendance = () => {
    const date = dayjs(attendanceDate).format("DD-MM-YYYY");

    window.open(
      `/teacher/AttendancePrint?classId=${selectedClass.classId}&date=${date}`,
      "_blank"
    );
  };

  // ✅ Mobile Card View
  const renderMobileView = () =>
    students.map((student) => (
      <Box
        key={student._id}
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          p: 2,
          mb: 2,
        }}
      >
        <Typography fontWeight="bold">{student.name}</Typography>
        <Typography variant="body2">
          Admission#: {student?.admission_no}
        </Typography>

        <Select
          fullWidth
          size="small"
          sx={{ mt: 1 }}
          value={attendanceStatus[student._id]}
          onChange={(e) =>
            handleStatusChange(student._id, e.target.value)
          }
        >
          <MenuItem value="Present">Present</MenuItem>
          <MenuItem value="Absent">Absent</MenuItem>
        </Select>
      </Box>
    ));

  // ✅ Desktop Table View
  const renderTableView = () => (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Admission#</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((s) => (
            <TableRow key={s._id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s?.admission_no}</TableCell>
              <TableCell>
                <Select
                  fullWidth
                  size="small"
                  value={attendanceStatus[s._id]}
                  onChange={(e) =>
                    handleStatusChange(s._id, e.target.value)
                  }
                >
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Typography
        sx={{ fontSize: { xs: 20, md: 28 }, mb: 2 }}
        fontWeight="bold"
      >
        Student Attendance
      </Typography>

      {/* Alerts */}
      {attendeeClass.length === 0 && (
        <Alert severity="info">No assigned classes</Alert>
      )}

      {/* Form */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "1fr 1fr 1fr",
          },
          gap: 2,
          mb: 2,
        }}
      >
        <Autocomplete
          options={attendeeClass}
          getOptionLabel={(o) => o.class_name || ""}
          value={selectedClass}
          onChange={(e, val) => setSelectedClass(val)}
          renderInput={(params) => (
            <TextField {...params} label="Class" size="small" />
          )}
        />

        <Autocomplete
          options={sections}
          getOptionLabel={(o) => o.section_name || ""}
          value={selectedSection}
          onChange={(e, val) => setSelectedSection(val)}
          renderInput={(params) => (
            <TextField {...params} label="Section" size="small" />
          )}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={attendanceDate}
            onChange={setAttendanceDate}
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>
      </Box>

      {/* Loading */}
      {loading && <CircularProgress />}

      {/* Empty */}
      {!loading && students.length === 0 && selectedClass && (
        <Alert severity="info">No students found</Alert>
      )}

      {/* Data */}
      {!loading && students.length > 0 && (
        <>
          {isMobile ? renderMobileView() : renderTableView()}

          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mt: 3,
            }}
          >
            {!attendanceTaken && (
              <Button fullWidth variant="contained" onClick={submitAttendance}>
                Submit
              </Button>
            )}

            {attendanceTaken && (
              <Button fullWidth variant="contained" onClick={printAttendance}>
                Print
              </Button>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default AttendanceTeacher;
