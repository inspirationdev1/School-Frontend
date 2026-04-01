import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../../../environment";
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
  Autocomplete, Container,
  TextField,
} from "@mui/material";
import { convertDate } from "../../../utilityFunctions";

export default function ParentExaminations() {


  // const [classId, setClassId] = useState(null)
  const [selectedParent, setSelectedParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [examinations, setExaminations] = useState([]);
  const [classDetails, setClassDetails] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null);
  const fetchExaminations = (classId) => {
    axios
      .get(`${baseUrl}/examination/fetch-class/${classId}`)
      .then((resp) => {
        console.log("ALL Examination", resp);
        setExaminations(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching  Examinstions.");
      });
  };

  const getParentDetails = () => {
    axios.get(`${baseUrl}/parent/fetch-own`).then(resp => {
      // fetchExaminations(resp.data.data.student_class._id);
      // setClassDetails({id:resp.data.data.student_class._id, class:resp.data.data.student_class.class_name})
      setSelectedParent(resp.data.data);
      console.log("parent", resp)
    }).catch(e => {
      console.log("Error in parent", e)
    })
  }

  useEffect(() => {
    getParentDetails();

  }, [])

  const fetchStudents = () => {
    if (!selectedParent?._id) return;
    const params = {
      parent: selectedParent._id
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
  }, [selectedParent]);


  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" flexDirection="column" gap={4}>

        {/* Heading */}
        <Typography
          sx={{ textAlign: "center" }}
          variant="h3"
        >
          Your Examinations [ Class: {classDetails?.class} ]
        </Typography>

        {/* Student Dropdown */}
        {students.length > 0 && (
          <Box sx={{
            width: { xs: "100%", md: "60%" },
            mx: "auto",
          }}>
            <Autocomplete
              options={students}
              getOptionLabel={(option) => option.name}
              value={selectedStudent}
              onChange={(event, newValue) => {
                setSelectedStudent(newValue);
                setSelectedClass({
                  id: newValue.student_class._id,
                  class: newValue.student_class.class_name,
                });
                setClassDetails({
                  id: newValue.student_class._id,
                  class: newValue.student_class.class_name,
                });
                fetchExaminations(newValue.student_class._id);
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

        {/* Table */}
        <TableContainer
          component="div"
          sx={{
            boxShadow: 2,
            borderRadius: 2,
            p: 2,
          }}
        >
          <Table sx={{ minWidth: 250 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  Exam Date
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  Subject
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Exam Type
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {examinations?.map((examination, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {convertDate(examination.examDate)}
                  </TableCell>
                  <TableCell>
                    {examination.subject.subject_name}
                  </TableCell>
                  <TableCell align="center">
                    
                    {examination.examtype.examtype_name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>
    </Container>
  );

}