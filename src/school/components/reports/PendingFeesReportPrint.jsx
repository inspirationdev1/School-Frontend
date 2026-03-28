
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
    colIncome: {
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


export default function PendingFeesReportPrint() {
    const [loading, setLoading] = useState(true);
    const [printData, setPrintData] = useState([]);


    const [reportHeader, setReportHeader] = useState({});
    const [incomes, setIncomes] = useState([]);
    const [rows, setRows] = useState([]);
    const [date, setDate] = useState(new dayjs(Date()).format("YYYY-MM-DD"));
    const [totalInvAmount, setTotalInvAmount] = useState(0);
    const [totalPaidAmount, setTotalPaidAmount] = useState(0);
    const [totalInvBal, setTotalInvBal] = useState(0);




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

                const income_Print_Response = await axios.get(`${baseUrl}/schoolreports/pending-fees-print`, {
                    params: {
                        fromDate: fromDate,
                        toDate: toDate
                    }
                });
                console.log("income_Print_Response", income_Print_Response.data.data);
                const rows = income_Print_Response.data.data;




                // console.log("subjects", incomeData);



                // const maxLength = Math.max(incomeData.length);

                // const rows = Array.from({ length: maxLength }, (_, i) => ({
                //     detail: "Student : " + incomeData[i]?.student.name  + " - Invoice # " + incomeData[i]?.siCode || "",
                //     invAmount: incomeData[i]?.invAmount || "",
                //     paidAmount: incomeData[i]?.paidAmount || "",
                // }));
                setRows(rows);

                if (rows.length > 0) {
                    setIsDataFound(true);
                } else {
                    setIsDataFound(false);
                }
                const totalInvAmount = rows.reduce((sum, item) => sum + Number(item.invAmount), 0);
                setTotalInvAmount(totalInvAmount);

                const totalPaidAmount = rows.reduce((sum, item) => sum + Number(item.paidAmount), 0);
                setTotalPaidAmount(totalPaidAmount);

                const totalInvBal = rows.reduce((sum, item) => sum + Number(item.invBal), 0);
                setTotalInvBal(totalInvBal);


                const rptHeader = {
                    school_name: rows[0].school.school_name,
                    address: rows[0].school.address,
                    city: rows[0].school.city,
                    state: rows[0].school.state,
                    country: rows[0].school.country,
                    school_image: rows[0].school.school_image
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
                    PENDING FEES REPORT
                </Text>

                {/* 🔷 Table */}
                <View style={styles.table}>

                    {/* Header */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableHeaderCell, styles.colIncome]}>
                            <Text>FI #</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.colIncome]}>
                            <Text>FI Date</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, styles.colIncome]}>
                            <Text>Student</Text>
                        </View>

                        <View style={[styles.tableHeaderCell, styles.colAmount]}>
                            <Text>Inv Amount</Text>
                        </View>

                        <View style={[styles.tableHeaderCell, styles.colAmount]}>
                            <Text>Paid Amount</Text>
                        </View>

                        <View style={[styles.tableHeaderCell, styles.colAmount]}>
                            <Text>Inv Bal</Text>
                        </View>
                    </View>

                    {/* Rows */}
                    {rows.map((row, i) => (
                        <View style={styles.tableRow} key={i}>
                            <View style={[styles.tableCell, styles.colIncome]}>
                                <Text>{row.siCode}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.colIncome]}>
                                <Text>{dayjs(row.invoiceDate).format("DD/MM/YYYY")}</Text>

                            </View>
                            <View style={[styles.tableCell, styles.colIncome]}>
                                <Text>{row?.student.name}</Text>
                            </View>

                            <View style={[styles.tableCell, styles.colAmount]}>
                                <Text>{formatAmount(row.invAmount)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.colAmount]}>
                                <Text>{formatAmount(row.paidAmount)}</Text>
                            </View>
                            <View style={[styles.tableCell, styles.colAmount]}>
                                <Text>{formatAmount(row.invBal)}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Total */}
                    <View style={styles.totalRow}>
                        <View style={[styles.tableCell, styles.colIncome]}>
                            <Text style={styles.boldText}></Text>
                        </View>
                        <View style={[styles.tableCell, styles.colIncome]}>
                            <Text style={styles.boldText}></Text>
                        </View>

                        <View style={[styles.tableCell, styles.colIncome]}>
                            <Text style={styles.boldText}>Total</Text>
                        </View>

                        <View style={[styles.tableCell, styles.colAmount]}>
                            <Text style={styles.boldText}>{formatAmount(totalInvAmount)}</Text>
                        </View>

                        <View style={[styles.tableCell, styles.colAmount]}>
                            <Text style={styles.boldText}>{formatAmount(totalPaidAmount)}</Text>
                        </View>
                        <View style={[styles.tableCell, styles.colAmount]}>
                            <Text style={styles.boldText}>{formatAmount(totalInvBal)}</Text>
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


    const downloadIncomeExcel = () => {

        // 1️⃣ Prepare Header

        const sheetData = [];
        sheetData.push(["FI#", "FI Date", "Student", "Inv Amount", "Paid Amount", "Bal Amount"]);

        // 📥 Data Rows
        rows.forEach((row) => {
            sheetData.push([
                row.siCode || "",
                dayjs(row.invoiceDate).format("DD/MM/YYYY") || "",
                row?.student.name || "",
                Number(row.invAmount || 0),
                Number(row.paidAmount || 0),
                Number(row.invBal || 0),
            ]);
        });


        // 📊 Totals
        sheetData.push([
            "",
            "",
            "Totals",
            Number(totalInvAmount),
            Number(totalPaidAmount),
            Number(totalInvBal),
        ]);


        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PendingFeesInvoices");

        const date = new Date();
        // 5️⃣ Download
        XLSX.writeFile(workbook, `PendingFeesInvoices_${date}.xlsx`);
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

                <PDFDownloadLink document={<PrintPDF />} fileName="PendingFeesInvoices.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadIncomeExcel}>
                    Download Excel
                </button>


            </div>)}


        </div>
    );
}
