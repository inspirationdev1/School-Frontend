
import {
    Page,
    Text,
    View,
    Document,
    PDFViewer,
    PDFDownloadLink,
    Image,
    StyleSheet,
} from "@react-pdf/renderer";
import { Table, TD, TH, TR } from "@ag-media/react-pdf-table";
import { useSearchParams } from "react-router-dom";
import { Typography } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { baseUrl, frontendUrl, formatAmount } from '../../../environment';
import { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 10
    },

    // 🔷 Header
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },

    logo: {
        width: 50,
        height: 50,
        marginRight: 10
    },

    schoolInfo: {
        flex: 1,
        textAlign: "center"
    },

    schoolName: {
        fontSize: 14,
        fontWeight: "bold"
    },

    schoolText: {
        fontSize: 10
    },

    reportTitle: {
        textAlign: "center",
        fontSize: 14,
        marginVertical: 10,
        fontWeight: "bold"
    },

    // 🔷 Table
    table: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#000"
    },

    tableRow: {
        flexDirection: "row"
    },

    tableHeaderCell: {
        borderRightWidth: 1,
        borderBottomWidth: 1,
        padding: 6,
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: "#f2f2f2"
    },

    tableCell: {
        borderRightWidth: 1,
        borderBottomWidth: 1,
        padding: 6
    },

    // ✅ FIXED COLUMN WIDTHS
    colExpense: {
        width: "100%"
    },

    colAmount: {
        width: "25%",
        textAlign: "right"
    },

    // 🔷 Total Row
    totalRow: {
        flexDirection: "row",
        backgroundColor: "#eee"
    },

    boldText: {
        fontWeight: "bold"
    }
});


export default function AttendanceReportPrint() {
    const [loading, setLoading] = useState(true);
    const [printData, setPrintData] = useState([]);


    const [reportHeader, setReportHeader] = useState({});

    const [rows, setRows] = useState([]);
    const [date, setDate] = useState(new dayjs(Date()).format("YYYY-MM-DD"));
    const [counts, setCounts] = useState(0);



    const [searchParams] = useSearchParams();

    // const id = searchParams.get("id");

    const [student, setStudent] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const [isDataFound, setIsDataFound] = useState(false)




    useEffect(() => {


        const params = new URLSearchParams(window.location.search);

        const dataParam = params.get("data");


        if (dataParam) {
            const data = JSON.parse(decodeURIComponent(dataParam));
            console.log("student", data.student);
            setStudent(data.student);

            console.log("class", data.class);
            setSelectedClass(data.class);

            console.log("section", data.section);
            setSelectedSection(data.section);


            console.log("fromDate", data.fromDate);
            setFromDate(data.fromDate);
            console.log("toDate", data.toDate);
            setToDate(data.toDate);
        }


    }, []);


    useEffect(() => {

        const fetchReportData = async () => {

            // if (!student) return;
            if (!fromDate) return;
            if (!toDate) return;


            try {

                // let params= {
                //         student: student,
                //         fromDate: fromDate,
                //         toDate: toDate
                //     }

                let params = {}


                if (student) {
                    params.student = student;
                }
                if (selectedClass) {
                    params.class = selectedClass;
                }
                if (selectedSection) {
                    params.section = selectedSection;
                }
                if (fromDate) {
                    params.fromDate = fromDate;
                }
                if (toDate) {
                    params.toDate = toDate;
                }

                const attendance_Print_Response = await axios.get(`${baseUrl}/schoolreports/attendance-print`, {
                    params: params
                });
                console.log("attendance_Print_Response", attendance_Print_Response.data.data);
                const attendanceData = attendance_Print_Response.data.data;




                console.log("attendanceData", attendanceData);



                const maxLength = Math.max(attendanceData.length);


                setRows(attendanceData);
                setCounts(attendance_Print_Response.data.counts);

                if (rows.length > 0) {
                    setIsDataFound(true);
                } else {
                    setIsDataFound(false);
                }



                const rptHeader = {
                    school_name: attendanceData[0].school.school_name,
                    address: attendanceData[0].school.address,
                    city: attendanceData[0].school.city,
                    state: attendanceData[0].school.state,
                    country: attendanceData[0].school.country,
                    school_image: attendanceData[0].school.school_image
                }

                setReportHeader(rptHeader);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching marksheet for print:', error);
                setLoading(false);
                setIsDataFound(false);
            }
        };

        fetchReportData();



    }, [student, fromDate, toDate]);




    const PrintPDF = () => (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* 🔷 Header */}
                <View style={styles.headerContainer}>
                    {/* If you have logo, uncomment */}
                    <Image src={logo} style={styles.logo} />

                    <View style={styles.schoolInfo}>
                        <Text style={styles.schoolName}>
                            {reportHeader?.school_name}
                        </Text>

                        <Text style={styles.schoolText}>
                            {reportHeader?.address}, {reportHeader?.city}
                        </Text>

                        <Text style={styles.schoolText}>
                            {reportHeader?.state}, {reportHeader?.country}
                        </Text>
                    </View>
                </View>

                {/* 🔷 Title */}
                <Text style={styles.reportTitle}>
                    ATTENDANCDE  REPORT
                </Text>

                <View style={styles.reportTitle}>
                    {selectedClass&&(<Text style={[styles.labelStyle]}>Class : {rows[0].class.class_name}</Text>)}
                    {selectedSection&&(<Text style={[styles.labelStyle]}>Section : {rows[0].section.section_name}</Text>)}
                    {/* {student&&(<Text style={[styles.labelStyle]}>Student : {rows[0].student.name}</Text>)} */}
                    <Text style={[styles.labelStyle]}>From : {dayjs(fromDate).format("DD-MM-YYYY")} To : {dayjs(toDate).format("DD-MM-YYYY")}</Text>
                </View>

                {/* 🔷 Table */}
                <View style={styles.table}>

                    {/* Header */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableHeaderCell, styles.colExpense]}>
                            <Text>Student</Text>
                        </View>
                        
                        <View style={[styles.tableHeaderCell, styles.colExpense]}>
                            <Text>Date</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.colAmount]}>
                            <Text>Status</Text>
                        </View>
                    </View>

                    {/* Rows */}
                    {rows.map((row, i) => (
                        <View style={styles.tableRow} key={i}>
                            <View style={[styles.tableCell, styles.colExpense]}>
                                <Text>{row.student?.name}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.colExpense]}>
                                <Text>{dayjs(row.date).format("DD-MM-YYYY")}</Text>
                            </View>
                            {/* <View style={[styles.tableCell, styles.colExpense]}>
                                <Text>{dayjs(row.date).format("HH:mm:ss")}</Text>
                            </View> */}

                            <View style={[styles.tableCell, styles.colAmount]}>
                                <Text>{row.status}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Total */}
                    <View style={styles.totalRow}>
                        <View style={[styles.tableCell, styles.colExpense]}>
                            <Text style={styles.boldText}>Total Present : {counts.present}</Text>
                        </View>



                    </View>
                    <View style={styles.totalRow}>


                        <View style={[styles.tableCell, styles.colExpense]}>
                            <Text style={styles.boldText}>Total Absent : {counts.absent}</Text>
                        </View>

                    </View>

                </View>


            </Page>
        </Document>
    );


    const [logo, setLogo] = useState("");

    useEffect(() => {
        if (reportHeader?.school_image) {
            getBase64Image(
                `${reportHeader.school_image}`
            ).then(setLogo);
        }
    }, [reportHeader]);


    const getBase64Image = async (url) => {
        const res = await fetch(url);
        const blob = await res.blob();

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    };


    const downloadExcel = () => {

        // 1️⃣ Prepare Header

        const sheetData = [];
        sheetData.push(["Date", "Time", "Status"]);

        // 📥 Data Rows
        rows.forEach((row) => {
            sheetData.push([
                dayjs(row.date).format("DD-MM-YYYY") || "",
                dayjs(row.date).format("HH:mm:ss") || "",
                row.status || "",
            ]);
        });


        // 📊 Totals
        sheetData.push([
            "Totals Present",
            Number(counts.present),
        ]);

        sheetData.push([
            "Totals Absent",
            Number(counts.absent),
        ]);


        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        const date = new Date();
        // 5️⃣ Download
        XLSX.writeFile(workbook, `Attendance_${date}.xlsx`);
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }
    return (
        <div className="max-w-2xl mx-auto my-10">
            <div className="w-full h-[500px]">

                {rows && rows.length > 0 ? (
                    <PDFViewer width="100%" height="100%">
                        <PrintPDF />
                    </PDFViewer>
                ) : (
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: "800", textAlign: "center" }}
                    >
                        No Data Found
                    </Typography>


                )}{" "}



            </div>

            {(isDataFound && <div className="mt-6 flex justify-center gap-3">

                <PDFDownloadLink document={<PrintPDF />} fileName="Attendance.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadExcel}>
                    Download Excel
                </button>


            </div>)}


        </div>
    );
}
