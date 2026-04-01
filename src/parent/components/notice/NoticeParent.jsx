import { useEffect, useState } from "react";
import {
  Box, Button, MenuItem, Paper, Select, TextField, Typography, Autocomplete, Container,
} from "@mui/material";
import axios from "axios";
import { baseUrl } from "../../../environment";

const NoticeParent = () => {


  const [selectedParent, setSelectedParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get(`${baseUrl}/notices/fetch/${'student'}`);
        setNotices(response.data);
      } catch (error) {
        console.error("Error fetching notices", error);
      }
    };
    fetchNotices();
  }, []);

  const getParentDetails = () => {
    axios.get(`${baseUrl}/parent/fetch-own`).then(resp => {
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
    <Box sx={{ mt: 4 }}>

      {/* Main Layout Wrapper */}
      <Box display="flex" flexDirection="column" gap={4}>

        {/* Heading */}
        <Typography
          variant="h3"
          sx={{ textAlign: "center" }}
        >
          Notice Board
        </Typography>

        {/* Student Dropdown */}
        {students.length > 0 && (
          <Box
            sx={{
              width: { xs: "100%", md: "60%" },
              mx: "auto",
            }}
          >
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

        {/* Notices Section */}
        <Box
          display="flex"
          flexDirection="column"
          gap={3}
        >
          {notices.map((notice) => (
            <Paper
              key={notice._id}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <Typography variant="h5" gutterBottom>
                {notice.title}
              </Typography>

              <Typography variant="body1">
                {notice.message}
              </Typography>

              <Typography
                variant="body2"
                sx={{ mt: 2, color: "text.secondary" }}
              >
                Audience: {notice.audience} |{" "}
                {new Date(notice.date).toLocaleDateString()}
              </Typography>
            </Paper>
          ))}
        </Box>

      </Box>
    </Box>
  );

};

export default NoticeParent;
