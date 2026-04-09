
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
// import { styles } from "./style";
import { Table, TD, TH, TR } from "@ag-media/react-pdf-table";
// import { tableData, totalData } from "./data";
import { useSearchParams } from "react-router-dom";
import { Typography } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { baseUrl, frontendUrl, formatAmount } from '../../../environment';
import { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

// Styles
const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 10,
    },
    // 🔷 Header
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#000",
        paddingBottom: 10,
        marginBottom: 10,
    },

    logo: {
        width: 60,
        height: 60,
        marginRight: 10,
    },

    schoolInfo: {
        flex: 1,
        textAlign: "center",
    },

    schoolName: {
        fontSize: 16,
        fontWeight: "bold",
    },

    schoolText: {
        fontSize: 10,
    },

    // 🔷 Title
    reportTitle: {
        textAlign: "center",
        fontSize: 14,
        fontWeight: "bold",
        marginVertical: 10,
        textDecoration: "underline",
    },

    title: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 10,
        fontWeight: "bold",
    },
    rowStyle: {
        flexDirection: "row",
        marginBottom: 6,
    },
    labelStyle: {
        width: "20%",
        fontWeight: "bold",
    },
    valueStyle: {
        width: "30%",
    },
    table: {
        display: "table",
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
    },
    row: {
        flexDirection: "row",
    },
    cellHeader: {
        borderWidth: 1,
        padding: 5,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    cell: {
        borderWidth: 1,
        padding: 5,
        textAlign: "center",
        flex: 1,
    },
});


export default function ScheduleReportPrint() {
    const [loading, setLoading] = useState(true);
    // const [printData, setPrintData] = useState([]);


    const [reportHeader, setReportHeader] = useState({});
    const [rows, setRows] = useState([]);

    const [profitLoss, setProfitLoss] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);



    const [searchParams] = useSearchParams();


    const [selectedYear, setSelectedYear] = useState(2025)
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const [isDataFound, setIsDataFound] = useState(false)

    useEffect(() => {


        const params = new URLSearchParams(window.location.search);

        const dataParam = params.get("data");


        if (dataParam) {

            const data = JSON.parse(decodeURIComponent(dataParam));
            console.log("fromDate", data.fromDate);
            setFromDate(data.fromDate);
            console.log("toDate", data.toDate);
            setToDate(data.toDate);

            setSelectedClass(data?.class);
            setSelectedSection(data?.section);

            setSelectedTeacher(data?.teacher);
        }


    }, []);


    useEffect(() => {




        const fetchReportData = async () => {

            if (!fromDate) return;
            if (!toDate) return;
            if (!selectedClass) return;
            if (!selectedSection) return;


            try {

                let params = {
                    class: selectedClass?._id,
                    section: selectedSection?._id
                }
                if (selectedTeacher) {
                    params["teacher"] = selectedTeacher?._id
                }
                const periodsData = await axios.get(`${baseUrl}/schoolreports/schedule-print`, {
                    params: params
                });
                console.log("periodsData", periodsData.data.data);

                if (periodsData?.data?.data?.length > 0) {
                    setIsDataFound(true);
                } else {
                    setIsDataFound(false);
                    setLoading(false);
                    return;
                }

                let daysOrder = [];


                const from_Date = new Date(fromDate);
                const to_Date = new Date(toDate);

                // Array of day names
                const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                // Loop through dates
                let currentDate = new Date(from_Date); // clone so original isn't modified    
                while (currentDate <= to_Date) {
                    const dayName = dayNames[currentDate.getDay()];
                    console.log(`Date: ${currentDate.toISOString().slice(0, 10)}, Day: ${dayName}`);

                    const dd = String(currentDate.getDate()).padStart(2, "0");
                    const mm = String(currentDate.getMonth() + 1).padStart(2, "0"); // month starts from 0
                    const yyyy = currentDate.getFullYear();
                    const formattedDate = `${dd}-${mm}-${yyyy}`;

                    console.log(`Date: ${formattedDate}, Day: ${dayName}`);


                    // daysOrder.push({ day: dayName, dayseq: dd + mm + yyyy });
                    daysOrder.push({ day: dayName, date: formattedDate });
                    // Move to next day
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // Normalize subject keys
                // const subjects = ["math", "science", "social", "english", "telugu"];
                // const subjects = [...new Set(periodsData.data.data.map(item => item?.subject?.subject_name.toLowerCase()))];
                const subjects = [...new Set(periodsData.data.data.map(item => item?.subjectkey.toLowerCase()))];
                console.log(subjects);

                // Initialize result
                const result = daysOrder.map((day) => {
                    // const obj = { day };
                    const obj = { day };

                    subjects.forEach((sub) => {
                        obj[sub] = "-";

                    });

                    return obj;
                });

                // Fill data
                periodsData.data.data.forEach((period) => {
                    // const subjectKey = period.subject.subject_name.toLowerCase(); // math, science...
                    const subjectkey = period.subjectkey.toLowerCase(); // math, science...
                    const subjectName = subjectkey + "name"; // math, science...

                    period.days.forEach((day) => {
                        const indexes = result
                            .map((item, i) => (item.day.day === day ? i : -1))
                            .filter((i) => i !== -1);

                        indexes.forEach((i) => {
                            result[i][subjectkey] = `${period.starttime} - ${period.endtime}`;
                            result[i][subjectName] = `${period?.subject?.subject_name}`;
                        });


                    });
                });

                console.log("result", result);



                setRows(result);



                const rptHeader = {
                    school_name: periodsData.data.data[0].school.school_name,
                    address: periodsData.data.data[0].school.address,
                    city: periodsData.data.data[0].school.city,
                    state: periodsData.data.data[0].school.state,
                    country: periodsData.data.data[0].school.country,
                    school_image: periodsData.data.data[0].school.school_image
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

    }, [fromDate, toDate]);





    const PrintPDF = () => (
        <>
            <Document>
                <Page style={styles.page}>


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
                        Schedule/Timetable
                    </Text>

                    <View>

                        {/* Row 1 */}
                        <View style={styles.rowStyle}>
                            <Text style={styles.labelStyle}>From Date:</Text>
                            <Text style={styles.valueStyle}>{dayjs(fromDate).format("DD/MM/YYYY")}</Text>

                            <Text style={styles.labelStyle}>To Date :</Text>
                            <Text style={styles.valueStyle}>
                                {dayjs(toDate).format("DD/MM/YYYY")}
                            </Text>
                        </View>

                        {/* Row 2 */}
                        <View style={styles.rowStyle}>
                            <Text style={styles.labelStyle}>Class:</Text>
                            <Text style={styles.valueStyle}>
                                {selectedClass?.class_name}
                            </Text>

                            <Text style={styles.labelStyle}>Section :</Text>
                            <Text style={styles.valueStyle}>
                                {selectedSection?.section_name}
                            </Text>
                        </View>

                        {/* Row 3 */}
                        {selectedTeacher && (<View style={styles.rowStyle}>
                            <Text style={styles.labelStyle}>Teacher:</Text>
                            <Text style={styles.valueStyle}>
                                {selectedTeacher?.name}
                            </Text>


                        </View>)}






                    </View>

                    <View style={styles.table}>
                        {/* Header */}


                        {/* Rows */}
                        {rows.map((item, index) => (
                            <>
                                {index === 0 && ( //Header Row
                                    <View style={styles.row}>
                                        <Text style={styles.cellHeader}>Date</Text>
                                        <Text style={styles.cellHeader}>Days</Text>
                                        {item?.subject1name && (<><Text style={styles.cellHeader}>{item.subject1name}</Text></>)}
                                        {item?.subject2name && (<><Text style={styles.cellHeader}>{item.subject2name}</Text></>)}
                                        {item?.subject3name && (<><Text style={styles.cellHeader}>{item.subject3name}</Text></>)}
                                        {item?.subject4name && (<><Text style={styles.cellHeader}>{item.subject4name}</Text></>)}
                                        {item?.subject5name && (<><Text style={styles.cellHeader}>{item.subject5name}</Text></>)}

                                    </View>

                                )}

                                <View style={styles.row} key={index}>
                                    <Text style={styles.cell}>{item.day.date}</Text>
                                    <Text style={styles.cell}>{item.day.day}</Text>
                                    {item?.subject1 && (<><Text style={styles.cell}>{item.subject1}</Text></>)}
                                    {item?.subject2 && (<><Text style={styles.cell}>{item.subject2}</Text></>)}
                                    {item?.subject3 && (<><Text style={styles.cell}>{item.subject3}</Text></>)}
                                    {item?.subject4 && (<><Text style={styles.cell}>{item.subject4}</Text></>)}
                                    {item?.subject5 && (<><Text style={styles.cell}>{item.subject5}</Text></>)}
                                </View>
                            </>
                        ))}
                    </View>


                </Page>
            </Document>
        </>
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


    const downloadScheduleExcel = () => {

        const sheetData = [];
        
        let rowSeq = 0;
        // 📥 Data Rows
        rows.forEach((row) => {
            rowSeq+=1;
            if (rowSeq==1){ // 1️⃣ Prepare Header
                sheetData.push(["Date", "Days", row?.subject1name, row?.subject2name,row?.subject3name,row?.subject4name,row?.subject5name]);
            }
             sheetData.push(["Date", "Days", row?.subject1, row?.subject2,row?.subject3,row?.subject4,row?.subject5]);
        });

        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");

        const date = new Date();
        // 5️⃣ Download
        XLSX.writeFile(workbook, `Schedule_${date}.xlsx`);
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }
    return (
        <div className="max-w-2xl mx-auto my-10">
            <div className="w-full h-[500px]">

                {rows && rows.length > 0 ? (
                    <>
                        <PDFViewer width="100%" height="100%">
                            <PrintPDF />
                        </PDFViewer>
                    </>

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

                <PDFDownloadLink document={<PrintPDF />} fileName="Schedule.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadScheduleExcel}>
                    Download Excel
                </button>


            </div>)}


        </div>
    );
}
