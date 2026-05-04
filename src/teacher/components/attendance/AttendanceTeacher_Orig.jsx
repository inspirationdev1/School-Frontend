import React, { useState, useEffect } from 'react';
import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem, Alert, FormControl, InputLabel, Autocomplete, TextField, Box } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { baseUrl } from '../../../environment';
import Invoice2 from "./invoice";
import AttendancePrint from "./AttendancePrint";
import { pdf } from "@react-pdf/renderer";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useFormik } from "formik";



const AttendanceTeacher_Orig = () => {
  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendanceTaken, setAttendanceTaken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendeeClass, setAttendeeClass] = useState([])
  const [selectedClass, setSelectedClass] = useState(null);

  const [sections, setSection] = useState([])
  const [selectedSection, setSelectedSection] = useState(null);


  const todayDate = moment().format('DD-MM-YYYY'); // Get today's date in 'DD-MM-YYYY' format

  const examFormik = useFormik({
    initialValues: { attendance_date: "", subject: "", exam_type: "" }


  });

  // Fetch all students and check if attendance is already taken
  useEffect(() => {
    fetchSection();
    const fetchStudentsAndCheckAttendance = async () => {
      try {
        const attendee = await axios.get(`${baseUrl}/class/attendee`);
        console.log("attendee", attendee)
        setAttendeeClass(attendee.data);

        if (attendeeClass.length > 0 && selectedClass) {
          // Check if attendance is already taken for today
          const selectedDate = examFormik.values.attendance_date
            ? dayjs(examFormik.values.attendance_date).format("DD-MM-YYYY")
            : "";

          const attendanceResponse = await axios.get(`${baseUrl}/attendance/check/${selectedClass.classId}`, { params: { classId: selectedClass.classId, sectionId: selectedSection._id, selectedDate: selectedDate } });
          setAttendanceTaken(attendanceResponse.data.attendanceTaken);
          // Fetch students if attendance has not been taken yet
          if (!attendanceResponse.data.attendanceTaken) {
            const studentsResponse = await axios.get(`${baseUrl}/student/fetch-with-query`, { params: { student_class: selectedClass.classId, section: selectedSection._id } }); // Fetch based on class
            setStudents(studentsResponse.data.data);

            // Initialize attendance status for each student
            const initialStatus = {};
            studentsResponse.data.data.forEach((student) => {
              initialStatus[student._id] = 'Present'; // default value
            });
            setAttendanceStatus(initialStatus);
          } else {
            const studentsResponse = await axios.get(`${baseUrl}/student/fetch-with-query`, { params: { student_class: selectedClass.classId } }); // Fetch based on class
            setStudents(studentsResponse.data.data);

            // Initialize attendance status for each student
            const initialStatus = {};
            studentsResponse.data.data.forEach((student) => {
              const studs = attendanceResponse.data.data;
              const studentId = student._id;
              const stud = studs.find((item) => item.student === studentId);
              console.log(stud);
              initialStatus[student._id] = stud?.status || 'Present'; // default value
            });
            setAttendanceStatus(initialStatus);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students or checking attendance:', error);
      }
    };

    fetchStudentsAndCheckAttendance();



  }, [examFormik.values.attendance_date, selectedClass, selectedSection]);

  const fetchSection = async () => {
    try {
      const sectionsData = await axios.get(`${baseUrl}/section/fetch-all`);
      console.log("sections", sectionsData)
      setSection(sectionsData.data.data);

    } catch (error) {
      console.error('Error fetching section:', error);
    }
  };

  // Handle attendance status change for each student
  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus((prevState) => ({
      ...prevState,
      [studentId]: status,
    }));
  };


 

  // Submit attendance for all students
  const submitAttendance = async () => {
    try {
      

      const selectedDate = dayjs(examFormik.values.attendance_date).format("DD-MM-YYYY");
      console.log("selectedDate", selectedDate);

      const attendanceRecords = students.map((student) => ({
        studentId: student._id,
        date: selectedDate,
        status: attendanceStatus[student._id],
        classId: selectedClass.classId, // Include the class
        sectionId: selectedSection._id, // Include the section
      }));

      // Send attendance records to backend
      await Promise.all(attendanceRecords.map((record) =>
        axios.post(`${baseUrl}/attendance/mark`, record)
      ));

      alert('Attendance submitted successfully');
      setAttendanceTaken(true); // Set attendance as taken
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  const printAttendance = async () => {
    console.log("selectedClass", selectedClass);
    console.log("examFormik.values.attendance_date", examFormik.values.attendance_date);
    const selectedDate = examFormik.values.attendance_date
      ? dayjs(examFormik.values.attendance_date).format("DD-MM-YYYY")
      : "";


    console.log("selectedDate", selectedDate);

    window.open(`/teacher/AttendancePrint?classId=${selectedClass.classId}&date=${selectedDate}`,
      '_blank');
  }


  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Mark Attendance for All Students</Typography>
      {attendeeClass.length > 0 && !attendanceTaken ? <Alert severity="info" sx={{ mb: 3 }}>
        Your Are Attendee of {attendeeClass.length} class{attendeeClass.length > 1 && 'es'}. Select the class and Take attendance.
      </Alert> : attendeeClass.length > 0 && attendanceTaken ? <Alert severity="info" sx={{ mb: 3 }}>
        Your Are Attendee of {attendeeClass.length} class{attendeeClass.length > 1 && 'es'}. Select the class and Print attendance.
      </Alert> :
        <Alert severity='info'>You are not attendee of any Class.</Alert>}

      <Box
  sx={{
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, // ✅ responsive
    gap: 2,
  }}
>

  

  {/* Class */}
  <Box>
    <Autocomplete
      options={attendeeClass}
      getOptionLabel={(option) => option.class_name || ""}
      value={selectedClass}
      onChange={(event, newValue) => {
        setSelectedClass(newValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Class"
          placeholder="Search class..."
          fullWidth
          size="small"
        />
      )}
    />
  </Box>

  {/* Section */}
  <Box>
    <Autocomplete
      options={sections}
      getOptionLabel={(option) => option.section_name || ""}
      value={selectedSection}
      onChange={(event, newValue) => {
        setSelectedSection(newValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Section"
          placeholder="Search section..."
          fullWidth
          size="small"
        />
      )}
    />
  </Box>

  {/* Attendance Date */}
  <Box>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Attendance Date"
        name="attendance_date"
        value={
          examFormik.values.attendance_date
            ? dayjs(examFormik.values.attendance_date)
            : null
        }
        onChange={(newValue) => {
          examFormik.setFieldValue("attendance_date", newValue);
        }}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            fullWidth: true,
            size: "small",
          },
        }}
      />
    </LocalizationProvider>
  </Box>

</Box>




      

      {attendeeClass.length > 0 && selectedClass && sections.length > 0 && selectedSection && !attendanceTaken && students.length < 1 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          There is no students in {selectedClass.class_name} class & {selectedSection.section_name} section now.
        </Alert>
      )}

      {attendeeClass.length > 0 && selectedClass && students.length > 0 && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Roll Number</TableCell>
                <TableCell>Attendance Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>
                    <Select
                      value={attendanceStatus[student._id]}
                      onChange={(e) => handleStatusChange(student._id, e.target.value)}
                    >
                      <MenuItem value="Present">Present</MenuItem>
                      <MenuItem value="Absent">Absent</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button variant="contained" color="primary" onClick={submitAttendance} sx={{ mt: 3 }}>
            Submit Attendance
          </Button>
          {attendanceTaken && <Button variant="contained" color="primary" onClick={printAttendance} sx={{ mt: 3, ml: 1 }}>
            Print Attendance
          </Button>}



        </>
      )}






    </Container>
  );
};

export default AttendanceTeacher;
