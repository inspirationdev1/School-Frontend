import {
    Page,
    Text,
    View,
    Document,
    PDFViewer,
    PDFDownloadLink,
} from "@react-pdf/renderer";
import { styles } from "./style";
import { Table, TD, TH, TR } from "@ag-media/react-pdf-table";
import { tableData, totalData } from "./data";
import { useSearchParams } from "react-router-dom";
import { Typography } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { baseUrl } from '../../../environment';
import { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";



export default function AttendancePrint() {
    const [loading, setLoading] = useState(true);
    const [printAttendance, setPrintAttendance] = useState([]);
    const [countsTotal, setCountsTotal] = useState({});
    const [searchParams] = useSearchParams();

    const classId = searchParams.get("classId");
    const selectedDate = searchParams.get("date");

    console.log("classId", classId);
    console.log("selectedDate", selectedDate);

    useEffect(() => {
        const fetchStudentsAttendance = async () => {
            try {

                const attendancePrintResponse = await axios.get(`${baseUrl}/attendance/print/${classId}`, { params: { classId: classId,selectedDate: selectedDate }});
          
                // const attendancePrintResponse = await axios.get(`${baseUrl}/attendance/print/${classId}`);

                

                console.log("attendancePrintResponse", attendancePrintResponse.data.data);
                setPrintAttendance(attendancePrintResponse.data.data);
                console.log("printAttendance", printAttendance);


                setCountsTotal(attendancePrintResponse.data.counts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching students or checking attendance:', error);
            }
        };

        fetchStudentsAttendance();



    }, []);

    const AttendancePDF = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, styles.textBold]}>ATTENDANCE</Text>
                        <Text>Date :  {selectedDate}</Text>
                    </View>
                    <View style={styles.spaceY}>
                        <Text style={styles.textBold}>{printAttendance[0].school.school_name}</Text>
                        <Text style={styles.textBold}>{printAttendance[0].school.address} - {printAttendance[0].school.city}</Text>
                        <Text style={styles.textBold}>{printAttendance[0].school.state} - {printAttendance[0].school.country}</Text>

                    </View>
                </View>



                {/* Render the table */}
                <Table style={styles.table}>
                    <TH style={[styles.tableHeader, styles.textBold]}>
                        <TD style={styles.td}>S.No</TD>
                        <TD style={styles.td}>Name</TD>
                        <TD style={styles.td}>Gender</TD>
                        <TD style={styles.td}>Age</TD>
                        <TD style={styles.td}>Status</TD>
                    </TH>


                    {printAttendance.map((item, index) => (
                        <TR key={index}>
                            <TD style={styles.td}>{index + 1}</TD>
                            <TD style={styles.td}>{item.student.name}</TD>
                            <TD style={styles.td}>{item.student.gender}</TD>
                            <TD style={styles.td}>{item.student.age}</TD>
                            <TD style={styles.td}>{item.status}</TD>
                        </TR>
                    ))}
                </Table>

                <View style={styles.totals}>
                    <View
                        style={{
                            minWidth: "256px",
                        }}
                    >
                        {/* {totalData.map((item) => (
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginBottom: "8px",
                                }}
                            >
                                <Text style={item.label === "Total" ? styles.textBold : {}}>
                                    {item.label}
                                </Text>
                                <Text style={item.label === "Total" ? styles.textBold : {}}>
                                    {item.value}
                                </Text>
                            </View>
                        ))} */}

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: "8px",
                            }}
                        >
                            <Text style={"Total" === "Total" ? styles.textBold : {}}>
                                Present : {countsTotal.present}
                            </Text>
                            <Text style={"Total" === "Total" ? styles.textBold : {}}>
                                Absent : {countsTotal.absent}
                            </Text>
                            <Text style={"Total" === "Total" ? styles.textBold : {}}>
                                Total : {countsTotal.present + countsTotal.absent}
                            </Text>
                            {/* <Text style={item.label === "Total" ? styles.textBold : {}}>
                                    {item.value}
                                </Text> */}
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );

    const downloadAttendanceExcel = () => {
        // 1️⃣ Prepare row data
        const rows = printAttendance.map((item, index) => ({
            "S.No": index + 1,
            "Student Name": item.student.name,
            Gender: item.student.gender,
            Age: item.student.age,
            Status: item.status,
        }));

        // 2️⃣ Add totals at bottom
        rows.push({});
        rows.push({
            "Student Name": "Present",
            Status: countsTotal.present,
        });
        rows.push({
            "Student Name": "Absent",
            Status: countsTotal.absent,
        });
        rows.push({
            "Student Name": "Total",
            Status: countsTotal.present + countsTotal.absent,
        });

        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(rows);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        // 5️⃣ Download
        XLSX.writeFile(workbook, `Attendance_${selectedDate}.xlsx`);
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }
    return (
        <div className="max-w-2xl mx-auto my-10">
            <div className="w-full h-[500px]">
                <PDFViewer width="100%" height="100%">
                    <AttendancePDF />
                </PDFViewer>
            </div>
            <div className="mt-6 flex justify-center gap-3">

                <PDFDownloadLink document={<AttendancePDF />} fileName="attendance.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadAttendanceExcel}>
                    Download Excel
                </button>


            </div>
        </div>
    );
}
