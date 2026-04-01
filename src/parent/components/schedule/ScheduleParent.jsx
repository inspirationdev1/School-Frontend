/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import {
  FormControl,
  MenuItem,
  Paper,
  Select,
  Container,
  Typography,
  Box,
  Autocomplete,
  TextField,
} from "@mui/material";
import { baseUrl } from "../../../environment";

const localizer = momentLocalizer(moment);

const ScheduleParent = () => {
  const [events, setEvents] = useState([]);
  // const [allClasses, setAllClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentClass, setStudentClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [selectedParent, setSelectedParent] = useState(null);


  const getParentDetails = () => {
    axios.get(`${baseUrl}/parent/fetch-own`).then(resp => {
      console.log("parent", resp);
      setSelectedParent(resp.data.data);


    })
      .catch((e) => {
        console.log("Error in parent", e);
      });
  };

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

  const fetchstudentsClass = () => {
    axios
      .get(`${baseUrl}/class/fetch-all`)
      .then((resp) => {
        console.log("Fetching data in  Casting Calls  admin.", resp);
        setStudentClass(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching casting calls admin data", e);
      });
  };

  useEffect(() => {

    getParentDetails();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedParent]);

  // Fetch periods for the selected class
  useEffect(() => {
    const fetchClassPeriods = async () => {
      if (!selectedClass) return;
      try {
        const response = await axios.get(
          `${baseUrl}/period/class/${selectedClass.id}`
        );
        const periods = response.data.periods;
        const eventsData = periods.map((period) => ({
          id: period._id,
          title: `${period.subject.subject_name} By ${period.teacher.name}`,
          start: new Date(period.startTime),
          end: new Date(period.endTime),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    };
    if (selectedClass) {
      fetchClassPeriods();
    }
  }, [selectedClass]);



  return (
    <Container>
      <Box display="flex" flexDirection="column" gap={3} mt={4}>

        <Typography
          variant="h4"
          sx={{ fontWeight: "800", textAlign: "center" }}
        >
          Weekly Schedule/Periods
        </Typography>


        {/* Student Dropdown */}
        {students.length > 0 && (
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
        )}

        {/* Heading */}
        {/* <h2 style={{ margin: 0 }}>
          Your Weekly Schedule [Class :{" "}
          {selectedClass && selectedClass.class}]
        </h2> */}
        <h2 style={{ margin: 0 }}>
          Class : {selectedClass && selectedClass.class}
        </h2>

        {/* Calendar */}
        <Box sx={{ height: 600 }}>
          <Calendar
            localizer={localizer}
            events={events}
            defaultView="week"
            views={["week"]}
            step={30}
            timeslots={1}
            min={new Date(1970, 1, 1, 10, 0, 0)}
            startAccessor="start"
            endAccessor="end"
            max={new Date(1970, 1, 1, 17, 0, 0)}
            defaultDate={new Date()}
            showMultiDayTimes
            style={{ height: "100%", width: "100%" }}
            formats={{ timeGutterFormat: "hh:mm A" }}
          />
        </Box>

      </Box>
    </Container>
  );

};

export default ScheduleParent;
