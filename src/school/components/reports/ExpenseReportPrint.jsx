
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
        width: "75%"
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


export default function ExpenseReportPrint() {
    const [loading, setLoading] = useState(true);
    const [printData, setPrintData] = useState([]);


    const [reportHeader, setReportHeader] = useState({});
    const [expenses, setExpenses] = useState([]);
    const [rows, setRows] = useState([]);
    const [date, setDate] = useState(new dayjs(Date()).format("YYYY-MM-DD"));
    const [totalExpense, setTotalExpense] = useState(0);



    const [searchParams] = useSearchParams();

    // const id = searchParams.get("id");

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [isDataFound, setIsDataFound] = useState(false)



    const id = "69b1de716debb1c7d5a431ed";
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




        const fetchReportData = async () => {

            if (!fromDate) return;
            if (!toDate) return;

            try {

                const expense_Print_Response = await axios.get(`${baseUrl}/schoolreports/expense-print`, {
                    params: {
                        fromDate: fromDate,
                        toDate: toDate
                    }
                });
                console.log("expense_Print_Response", expense_Print_Response.data.data);
                const expenseData = expense_Print_Response.data.data;




                console.log("subjects", expenseData);



                const maxLength = Math.max(expenseData.length);

                const rows = Array.from({ length: maxLength }, (_, i) => ({
                    // expense: expenseData[i]?.expensetype.expensetype_name || "",
                    expense: expenseData[i]
                        ? `${expenseData[i]?.expensetype?.expensetype_name || ""} - ${expenseData[i]?.employee?.employee_name || ""} - Exp # ${expenseData[i]?.expense?.expenseCode || ""}`
                        : "",
                    expenseAmount: expenseData[i]?.expenseAmount || "",
                }));
                setRows(rows);

                if (rows.length > 0) {
                    setIsDataFound(true);
                } else {
                    setIsDataFound(false);
                }
                const totalExpense = expenseData.reduce((sum, item) => sum + Number(item.expenseAmount), 0);
                setTotalExpense(totalExpense);


                const rptHeader = {
                    school_name: expenseData[0].school.school_name,
                    address: expenseData[0].school.address,
                    city: expenseData[0].school.city,
                    state: expenseData[0].school.state,
                    country: expenseData[0].school.country,
                    school_image: expenseData[0].school.school_image
                }

                setReportHeader(rptHeader);
                setExpenses(expenseData);
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
                    EXPENSES REPORT
                </Text>

                {/* 🔷 Table */}
                <View style={styles.table}>

                    {/* Header */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableHeaderCell, styles.colExpense]}>
                            <Text>Expense</Text>
                        </View>

                        <View style={[styles.tableHeaderCell, styles.colAmount]}>
                            <Text>Amount</Text>
                        </View>
                    </View>

                    {/* Rows */}
                    {rows.map((row, i) => (
                        <View style={styles.tableRow} key={i}>
                            <View style={[styles.tableCell, styles.colExpense]}>
                                <Text>{row.expense}</Text>
                            </View>

                            <View style={[styles.tableCell, styles.colAmount]}>
                                <Text>{formatAmount(row.expenseAmount)}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Total */}
                    <View style={styles.totalRow}>
                        <View style={[styles.tableCell, styles.colExpense]}>
                            <Text style={styles.boldText}>Total Expense</Text>
                        </View>

                        <View style={[styles.tableCell, styles.colAmount]}>
                            <Text style={styles.boldText}>{formatAmount(totalExpense)}</Text>
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


    const downloadExpenseExcel = () => {

        // 1️⃣ Prepare Header

        const sheetData = [];
        sheetData.push(["Expense", "Amount"]);

        // 📥 Data Rows
        rows.forEach((row) => {
            sheetData.push([
                row.expense || "",
                Number(row.expenseAmount || 0),
            ]);
        });


        // 📊 Totals
        sheetData.push([
            "Totals",
            Number(totalExpense),
        ]);


        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expense");

        const date = new Date();
        // 5️⃣ Download
        XLSX.writeFile(workbook, `Expense_${date}.xlsx`);
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

                {/* <PDFViewer width="100%" height="100%">
                    <PrintPDF />
                </PDFViewer> */}

            </div>

            {(isDataFound && <div className="mt-6 flex justify-center gap-3">

                <PDFDownloadLink document={<PrintPDF />} fileName="Expense.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadExpenseExcel}>
                    Download Excel
                </button>


            </div>)}
            

        </div>
    );
}
