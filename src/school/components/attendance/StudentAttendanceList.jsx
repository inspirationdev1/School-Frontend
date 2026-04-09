import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Autocomplete,
  Tabs,
  Tab,
} from "@mui/material";
import Grid from "@mui/material/Grid2"; // Import Grid2
import { styled } from '@mui/material/styles';

import { Link } from "react-router-dom";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import Attendee from "./attendee/Attendee";


const Item = styled(Paper)(({ theme }) => ({

  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  // ...theme.applyStyles('dark', {
  //   backgroundColor: '#1A2027',
  // }),
}));


const StudentAttendanceList = () => {
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentClass, setStudentClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [params, setParams] = useState({});
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const [tab, setTab] = useState(0);

  const handleMessage = (type, message) => {
    setType(type);
    setMessage(message);
  };

  const resetMessage = () => {
    setMessage("");
  };

  const fetchStudentClass = () => {
    axios
      .get(`${baseUrl}/class/fetch-all`)
      .then((resp) => {
        setStudentClass(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching student Class", e);
      });
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/student/fetch-with-query`,
          { params: params }
        );
        const studentsList = response.data.data;
        setStudents(studentsList);
        fetchAttendanceForStudents(studentsList);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
    fetchStudentClass();
  }, [params, message]);

  const fetchAttendanceForStudents = async (studentsList) => {
    const attendancePromises = studentsList.map((student) =>
      fetchAttendanceForStudent(student._id)
    );
    const results = await Promise.all(attendancePromises);
    const updatedAttendanceData = {};
    results.forEach(({ studentId, attendancePercentage }) => {
      updatedAttendanceData[studentId] = attendancePercentage;
    });
    setAttendanceData(updatedAttendanceData);
    setLoading(false);
  };

  const fetchAttendanceForStudent = async (studentId) => {
    try {
      const response = await axios.get(`${baseUrl}/attendance/${studentId}`);
      const attendanceRecords = response.data;
      const totalClasses = attendanceRecords.length;
      const presentCount = attendanceRecords.filter(
        (record) => record.status === "Present"
      ).length;
      const attendancePercentage =
        totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

      return { studentId, attendancePercentage };
    } catch (error) {
      console.error(`Error fetching attendance for student ${studentId}:`, error);
      return { studentId, attendancePercentage: 0 };
    }
  };

  const handleClass = (e) => {
    let newParam;
    try {
      if (e._id !== "") {
        newParam = { ...params, student_class: e._id };
      } else {
        newParam = { ...params };
        delete newParam["student_class"];
      }
    } catch (error) {
        setStudents([]);
    }

    setParams(newParam);
  };

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}
      <Box >
        {/* <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Typography variant="h2" >Attendance</Typography>
        </Box> */}

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            {/* <Tab label="Create Receipt" /> */}
            <Tab label="Attendee" />
            <Tab label="View List" />
          </Tabs>
        </Box>
        <Box>


          {tab === 0 && (
            <Box>
              {/* Class */}
              <Box>
                <Autocomplete
                  options={studentClass}
                  getOptionLabel={(option) => option.class_name}
                  value={selectedClass}
                  onChange={(event, newValue) => {

                    setSelectedClass(newValue);
                    handleClass(newValue);
                  }}
                  // onBlur={() => Formik.setFieldTouched("class", true)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Class"
                      placeholder="Search class..."
                      fullWidth
                    // error={Formik.touched.class && Boolean(Formik.errors.class)}
                    // helperText={Formik.touched.class && Formik.errors.class}
                    />
                  )}
                />


              </Box>

              <Box>
                {selectedClass && <Attendee params={params} classId={selectedClass._id} handleMessage={handleMessage} />}
              </Box>

            </Box>
          )}

          {tab === 1 && (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>


                <TextField
                  label="Search Name"
                  onChange={handleSearch}
                  fullWidth
                />



              
                <TableContainer sx={{ width: '100%' }} component={Paper}>
                  <Table sx={{}} aria-label="student attendance table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Gender</TableCell>
                        <TableCell align="right">Guardian Phone</TableCell>
                        <TableCell align="right">Class</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                        <TableCell align="right">View</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student, i) => (
                        <TableRow key={i}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell align="right">{student.gender}</TableCell>
                          <TableCell align="right">{student.guardian_phone}</TableCell>
                          <TableCell align="right">{student.student_class.class_name}</TableCell>
                          <TableCell align="right">
                            {attendanceData[student._id] !== undefined
                              ? `${attendanceData[student._id].toFixed(2)}%`
                              : "No Data"}
                          </TableCell>
                          <TableCell align="right">
                            <Link to={`/school/attendance-student/${student._id}`}>
                              Details
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

            </>




          )}

        </Box>


        {/* Grid layout using Grid2 */}
        <Grid container spacing={2}>
          {/* Left Box: Search and Attendee */}
          {/* <Grid size={{ xs: 12, md: 4 }}>
            <Item>
              <Box sx={{ padding: "10px" }}>

                

                <TextField
                  label="Search Name"
                  onChange={handleSearch}
                  fullWidth
                />

                {selectedClass && <Attendee params={params} classId={selectedClass._id} handleMessage={handleMessage} />}
              </Box>
            </Item>
          </Grid> */}

          {/* Right Box: Table */}
          {/* <Grid size={{ xs: 12, md: 8 }}>
            <Item sx={{ width: "100%" }}>
              <TableContainer sx={{ width: '100%' }} component={Paper}>
                <Table sx={{}} aria-label="student attendance table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Gender</TableCell>
                      <TableCell align="right">Guardian Phone</TableCell>
                      <TableCell align="right">Class</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                      <TableCell align="right">View</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, i) => (
                      <TableRow key={i}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell align="right">{student.gender}</TableCell>
                        <TableCell align="right">{student.guardian_phone}</TableCell>
                        <TableCell align="right">{student.student_class.class_name}</TableCell>
                        <TableCell align="right">
                          {attendanceData[student._id] !== undefined
                            ? `${attendanceData[student._id].toFixed(2)}%`
                            : "No Data"}
                        </TableCell>
                        <TableCell align="right">
                          <Link to={`/school/attendance-student/${student._id}`}>
                            Details
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Item>
          </Grid> */}


        </Grid>
      </Box>
    </>
  );
};

export default StudentAttendanceList;
