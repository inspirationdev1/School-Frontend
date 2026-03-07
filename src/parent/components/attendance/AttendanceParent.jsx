import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Box,
  Autocomplete,
  TextField, } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js'

import axios from 'axios';
import { baseUrl } from '../../../environment';

const AttendanceParent = () => {
  Chart.register(ArcElement);

  const [attendanceData, setAttendanceData] = useState([]);
  const [chartData, setChartData] = useState([0, 0]);
  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [classDetails, setClassDetails] = useState(null);

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const dateConvert = (date) => {
    const dateData = new Date(date);
    return dateData.getDate() + "-" + (+dateData.getMonth() + 1) + "-" + dateData.getFullYear();
  }


  const chartDataFunc = (data) => {
    setChartData([0, 0]);
    data.forEach(data => {

      if (data.status === 'Present') {
        setChartData(x => [x[0] + 1, x[1]])
      } else if (data.status === 'Absent') {
        setChartData(x => [x[0], x[1] + 1])
      }

    })
  }


  // Fetch attendance data for the specific student
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!selectedStudent?._id) return;
      try {
        const response = await axios.get(`${baseUrl}/attendance/${selectedStudent?._id}`);
        console.log(response, "attendance data")
        setAttendanceData(response.data);
        chartDataFunc(response.data)
        setLoading(false);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setLoading(false);
      }
    };

    if (selectedStudent) {
      fetchAttendanceData();
    }

  }, [selectedStudent]);

  // Calculate attendance summary for the chart
  //   const attendanceSummary = attendanceData.reduce(
  //     (summary, record) => {
  //       if (record.status === 'Present') summary.present++;
  //       if (record.status === 'Absent') summary.absent++;
  //       return summary;
  //     },
  //     { present: 0, absent: 0 }
  //   );

  // Data for the chart
  const data = {
    datasets: [
      {
        data: chartData, // 1 for Present, 0 for Absent
        backgroundColor: [
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 20
      },
    ],
    labels: ['Present', 'Absent'],
  };


  const getParentDetails = () => {
    axios.get(`${baseUrl}/parent/fetch-own`).then(resp => {
      setParentId(resp.data.data._id)
      
      console.log("parent", resp)
      setLoading(false);
    }).catch(e => {
      console.log("Error in parent", e)
      setLoading(false);
    })
  }

  useEffect(() => {
    getParentDetails();

  }, [])


const fetchStudents = () => {
    if (!parentId) return;
    const params = {
      parent: parentId
    }
    axios
      .get(`${baseUrl}/student/fetch-with-query`, { params })
      .then((resp) => {
        setStudents(resp.data.data);

      })
      .catch(() => console.log("Error in fetching students data"));
  };

  useEffect(() => {
      fetchStudents();
    }, [parentId]);

  if (loading) {
    return <CircularProgress />;
  }

 return (
  <Container sx={{ mt: 4 }}>
    {/* Page Title */}
    <Typography variant="h4" gutterBottom>
      Student Attendance
    </Typography>

    {/* Student Dropdown */}
    {students.length > 0 && (
      <Box mb={4} maxWidth={400}>
        <Autocomplete
          options={students}
          getOptionLabel={(option) => option.name}
          value={selectedStudent}
          onChange={(event, newValue) => {
            setSelectedStudent(newValue);
            setClassDetails({
              id: newValue.student_class._id,
              class: newValue.student_class.class_text,
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Student"
              placeholder="Search student..."
              fullWidth
            />
          )}
        />
      </Box>
    )}

    {/* Chart + Table Section */}
    <Box
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      gap={4}
      alignItems="flex-start"
    >
      {/* Attendance Chart */}
      <Box
        flex={1}
        sx={{
          p: 3,
          boxShadow: 2,
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h6" mb={2}>
          Attendance Summary
        </Typography>
        <Pie data={data} />
      </Box>

      {/* Attendance List */}
      <Box
        flex={2}
        sx={{
          p: 3,
          boxShadow: 2,
          borderRadius: 2,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h6" mb={2}>
          Attendance Records
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceData.map((record) => (
              <TableRow key={record._id}>
                <TableCell>{dateConvert(record.date)}</TableCell>
                <TableCell>{record.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  </Container>
);

};

export default AttendanceParent;
