
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


// Sample Data
const timetableData = [
    {
        day: "Monday",
        math: "8:00 - 9:00",
        science: "9:00 - 10:00",
        social: "11:00 - 12:00",
        english: "13:00 - 14:00",
        telugu: "15:00 - 16:00",
    },
    {
        day: "Tuesday",
        math: "8:00 - 9:00",
        science: "9:00 - 10:00",
        social: "11:00 - 12:00",
        english: "13:00 - 14:00",
        telugu: "15:00 - 16:00",
    },
    {
        day: "Wednesday",
        math: "8:00 - 9:00",
        science: "9:00 - 10:00",
        social: "11:00 - 12:00",
        english: "13:00 - 14:00",
        telugu: "15:00 - 16:00",
    },
    {
        day: "Saturday",
        math: "8:00 - 9:00",
        science: "9:00 - 10:00",
        social: "11:00 - 12:00",
        english: "-",
        telugu: "-",
    },
    {
        day: "Sunday",
        math: "-",
        science: "-",
        social: "-",
        english: "-",
        telugu: "-",
    },
];


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
        }


    }, []);


    useEffect(() => {

        const fetchPrintIncomeExpense = async () => {


            // if (!selectedYear) return;
            if (!fromDate) return;
            if (!toDate) return;

            try {

                // const periodsData = await axios.get(`${baseUrl}/period/fetch-with-query`, {
                //     params: {
                //         year: selectedYear
                //     }
                // });
                const periodsData = await axios.get(`${baseUrl}/period/all`);
                console.log("periodsData", periodsData);


                // const daysOrder = [
                //     "Monday",
                //     "Tuesday",
                //     "Wednesday",
                //     "Thursday",
                //     "Friday",
                //     "Saturday",
                //     "Sunday",
                // ];


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

                    // daysOrder.push({ day: dayName, dayseq: dd + mm + yyyy });
                    daysOrder.push(dayName);
                    // Move to next day
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // Normalize subject keys
                const subjects = ["math", "science", "social", "english", "telugu"];

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
                    const subjectKey = period.subject.subject_name.toLowerCase(); // math, science...

                    period.days.forEach((day) => {
                        const dayObj = result.find((d) => d.day === day);
                        const indexes = result
                            .map((item, i) => (item.day === day ? i : -1))
                            .filter((i) => i !== -1);

                        indexes.forEach((i) => {
                            result[i][subjectKey] = `${period.starttime} - ${period.endtime}`;
                        });

                        // if (dayObj) {
                        //     dayObj[subjectKey] = `${period.starttime} - ${period.endtime}`;

                        // }
                    });
                });

                console.log("result", result);



                setRows(result);

                if (rows.length > 0) {
                    setIsDataFound(true);
                } else {
                    setIsDataFound(false);
                }


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

        fetchPrintIncomeExpense();

    }, [fromDate, toDate]);




    // const PrintPDF = () => (
    //     <Document>
    //         <Page size="A4" style={styles.page}>

    //             {/* 🔷 Header */}
    //             <View style={styles.headerContainer}>
    //                 {/* If you have logo, uncomment */}
    //                 <Image src={logo} style={styles.logo} />

    //                 <View style={styles.schoolInfo}>
    //                     <Text style={styles.schoolName}>
    //                         {reportHeader?.school_name}
    //                     </Text>

    //                     <Text style={styles.schoolText}>
    //                         {reportHeader?.address}, {reportHeader?.city}
    //                     </Text>

    //                     <Text style={styles.schoolText}>
    //                         {reportHeader?.state}, {reportHeader?.country}
    //                     </Text>
    //                 </View>
    //             </View>

    //             {/* 🔷 Title */}
    //             <Text style={styles.reportTitle}>
    //                 Schedule
    //             </Text>

    //             {/* 🔷 Table */}
    //             <View style={styles.table}>

    //                 {/* Header Row */}
    //                 <View style={styles.tableRow}>
    //                     <View style={[styles.tableHeaderCell, styles.colIncome]}>
    //                         <Text>Income</Text>
    //                     </View>

    //                     <View style={[styles.tableHeaderCell, styles.colAmount]}>
    //                         <Text>Amount</Text>
    //                     </View>

    //                     <View style={[styles.tableHeaderCell, styles.colExpense]}>
    //                         <Text>Expense</Text>
    //                     </View>

    //                     <View style={[styles.tableHeaderCell, styles.colAmount2]}>
    //                         <Text>Amount</Text>
    //                     </View>
    //                 </View>

    //                 {/* Data Rows */}
    //                 {rows.map((row, i) => (
    //                     <View style={styles.tableRow} key={i}>
    //                         <View style={[styles.tableCell, styles.colIncome]}>
    //                             <Text>{row.income}</Text>
    //                         </View>

    //                         <View style={[styles.tableCell, styles.colAmount]}>
    //                             <Text>{formatAmount(row.incomeAmount)}</Text>
    //                         </View>

    //                         <View style={[styles.tableCell, styles.colExpense]}>
    //                             <Text>{row.expense}</Text>
    //                         </View>

    //                         <View style={[styles.tableCell, styles.colAmount2]}>
    //                             <Text>{formatAmount(row.expenseAmount)}</Text>
    //                         </View>
    //                     </View>
    //                 ))}



    //             </View>

    //         </Page>
    //     </Document>
    // );

    // PDF Component

    const PrintPDF = () => (
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







                </View>

                <View style={styles.table}>
                    {/* Header */}
                    <View style={styles.row}>
                        <Text style={styles.cellHeader}>Days</Text>
                        <Text style={styles.cellHeader}>Math (Start-End)</Text>
                        <Text style={styles.cellHeader}>Science</Text>
                        <Text style={styles.cellHeader}>Social Studies</Text>
                        <Text style={styles.cellHeader}>English</Text>
                        <Text style={styles.cellHeader}>Telugu</Text>
                    </View>

                    {/* Rows */}
                    {rows.map((item, index) => (
                        <View style={styles.row} key={index}>
                            <Text style={styles.cell}>{item.day}</Text>
                            <Text style={styles.cell}>{item.math}</Text>
                            <Text style={styles.cell}>{item.science}</Text>
                            <Text style={styles.cell}>{item.social}</Text>
                            <Text style={styles.cell}>{item.english}</Text>
                            <Text style={styles.cell}>{item.telugu}</Text>
                        </View>
                    ))}
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


    const downloadIncomeExpenseExcel = () => {

        // 1️⃣ Prepare Header

        const sheetData = [];
        sheetData.push(["Income", "Amount", "Expense", "Amount"]);

        // 📥 Data Rows
        rows.forEach((row) => {
            sheetData.push([
                row.income || "",
                Number(row.incomeAmount || 0),
                row.expense || "",
                Number(row.expenseAmount || 0),
            ]);
        });


        // 📊 Totals
        sheetData.push([
            "Totals",
            Number(totalIncome),
            "Totals",
            Number(totalExpense),
        ]);

        // 💰 Net Profit
        sheetData.push([
            "Net Profit",
            Number(profitLoss),
            "",
            "",
        ]);



        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "IncomeExpense");

        const date = new Date();
        // 5️⃣ Download
        XLSX.writeFile(workbook, `IncomeExpense_${date}.xlsx`);
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

                <PDFDownloadLink document={<PrintPDF />} fileName="Schedule.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadIncomeExpenseExcel}>
                    Download Excel
                </button>


            </div>)}


        </div>
    );
}
