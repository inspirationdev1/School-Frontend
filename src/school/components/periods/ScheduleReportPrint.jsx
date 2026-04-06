
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
  title: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
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
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [rows, setRows] = useState([]);
    const [date, setDate] = useState(new dayjs(Date()).format("YYYY-MM-DD"));
    const [profitLoss, setProfitLoss] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);



    const [searchParams] = useSearchParams();

    // const id = searchParams.get("id");

    const [selectedClassId, setSelectedClassId] = useState(null)
    const [selectedStudentId, setSelectedStudentId] = useState(null)
    const [selectedYear, setSelectedYear] = useState(null)
    const [isDataFound, setIsDataFound] = useState(false)


    const apiData = [
        {
            day: "Monday",
            math: { start: "8:00", end: "9:00" },
            science: { start: "9:00", end: "10:00" },
            social: { start: "11:00", end: "12:00" },
            english: { start: "13:00", end: "14:00" },
            telugu: { start: "15:00", end: "16:00" }
        },
        {
            day: "Tuesday",
            math: { start: "8:00", end: "9:00" },
            science: { start: "9:00", end: "10:00" },
            social: { start: "11:00", end: "12:00" },
            english: { start: "13:00", end: "14:00" },
            telugu: { start: "15:00", end: "16:00" }
        },
        {
            day: "Wednesday",
            math: { start: "8:00", end: "9:00" },
            science: { start: "9:00", end: "10:00" },
            social: { start: "11:00", end: "12:00" },
            english: { start: "13:00", end: "14:00" },
            telugu: { start: "15:00", end: "16:00" }
        },
        {
            day: "Thursday",
            math: { start: "8:00", end: "9:00" },
            science: { start: "9:00", end: "10:00" },
            social: { start: "11:00", end: "12:00" },
            english: { start: "13:00", end: "14:00" },
            telugu: { start: "15:00", end: "16:00" }
        },
        {
            day: "Friday",
            math: { start: "8:00", end: "9:00" },
            science: { start: "9:00", end: "10:00" },
            social: { start: "11:00", end: "12:00" },
            english: { start: "13:00", end: "14:00" },
            telugu: { start: "15:00", end: "16:00" }
        },
        {
            day: "Saturday",
            math: { start: "8:00", end: "9:00" },
            science: { start: "9:00", end: "10:00" },
            social: { start: "11:00", end: "12:00" },
        },
        {
            day: "Suday",
        },
    ]

    const subjects = ["Math", "Science", "Social Studies", "English", "Telugu"];


    useEffect(() => {


        const params = new URLSearchParams(window.location.search);

        const dataParam = params.get("data");


        if (dataParam) {

            const data = JSON.parse(decodeURIComponent(dataParam));
            console.log("Year:", data.year);
            setSelectedYear(data.year);
        }


    }, []);


    useEffect(() => {

        const fetchPrintIncomeExpense = async () => {

            if (!selectedYear) return;

            try {

                // const income_expense_Print_Response = await axios.get(`${baseUrl}/schoolreports/income-expense-print`, {
                //     params: {
                //         year: selectedYear
                //     }
                // });
                console.log("apiData", apiData);
                // const resultData = apiData;

                const formattedData = apiData.map((item) => ({
                    day: item.day,
                    math: { start: item.mathStart, end: item.mathEnd },
                    science: { start: item.scienceStart, end: item.scienceEnd },
                    social: { start: item.socialStart, end: item.socialEnd },
                    english: { start: item.englishStart, end: item.englishEnd },
                    telugu: { start: item.teluguStart, end: item.teluguEnd },
                }));

                // setPrintData(formattedData);

                setRows(formattedData);

                if (rows.length > 0) {
                    setIsDataFound(true);
                } else {
                    setIsDataFound(false);
                }


                // const rptHeader = {
                //     school_name: resultData.income[0].school.school_name,
                //     address: resultData.income[0].school.address,
                //     city: resultData.income[0].school.city,
                //     state: resultData.income[0].school.state,
                //     country: resultData.income[0].school.country,
                //     school_image: resultData.income[0].school.school_image
                // }

                const rptHeader = {
                    school_name: "AAAAA",
                    address: "AAAAA",
                    city: "AAAAA",
                    state: "AAAAA",
                    country: "AAAAA",
                    school_image: ""
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

    }, [selectedYear]);




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
                    Schedule
                </Text>

                {/* 🔷 Table */}
                <View style={styles.table}>

                    {/* Header Row */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableHeaderCell, styles.colIncome]}>
                            <Text>Income</Text>
                        </View>

                        <View style={[styles.tableHeaderCell, styles.colAmount]}>
                            <Text>Amount</Text>
                        </View>

                        <View style={[styles.tableHeaderCell, styles.colExpense]}>
                            <Text>Expense</Text>
                        </View>

                        <View style={[styles.tableHeaderCell, styles.colAmount2]}>
                            <Text>Amount</Text>
                        </View>
                    </View>

                    {/* Data Rows */}
                    {rows.map((row, i) => (
                        <View style={styles.tableRow} key={i}>
                            <View style={[styles.tableCell, styles.colIncome]}>
                                <Text>{row.income}</Text>
                            </View>

                            <View style={[styles.tableCell, styles.colAmount]}>
                                <Text>{formatAmount(row.incomeAmount)}</Text>
                            </View>

                            <View style={[styles.tableCell, styles.colExpense]}>
                                <Text>{row.expense}</Text>
                            </View>

                            <View style={[styles.tableCell, styles.colAmount2]}>
                                <Text>{formatAmount(row.expenseAmount)}</Text>
                            </View>
                        </View>
                    ))}

                    

                </View>

            </Page>
        </Document>
    );

    // PDF Component
const TimetablePDF = () => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Weekly Study Timetable Report</Text>

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
        {timetableData.map((item, index) => (
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
                        {/* <PrintPDF /> */}
                        <TimetablePDF />
                        
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

                <PDFDownloadLink document={<PrintPDF />} fileName="Income-Expense.pdf">
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
