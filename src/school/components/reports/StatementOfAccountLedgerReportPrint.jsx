
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
    col1: {
        width: "40%"
    },
    col2: {
        width: "35%"
    },
    col3: {
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


export default function StatementOfAccountLedgerReportPrint() {
    const [loading, setLoading] = useState(true);
    const [printData, setPrintData] = useState([]);


    const [reportHeader, setReportHeader] = useState({});
    const [rows, setRows] = useState([]);
    const [date, setDate] = useState(new dayjs(Date()).format("YYYY-MM-DD"));

    const [searchParams] = useSearchParams();

    const [selectedAccountlevel, setSelectedAccountlevel] = useState(null);
    const [selectedAccountledger, setSelectedAccountledger] = useState(null);

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);


    const [isDataFound, setIsDataFound] = useState(false)




    useEffect(() => {


        const params = new URLSearchParams(window.location.search);

        const dataParam = params.get("data");


        if (dataParam) {
            const data = JSON.parse(decodeURIComponent(dataParam));


            setSelectedAccountlevel(data?.accountlevel);
            setSelectedAccountledger(data?.accountledger);


        }


    }, []);


    useEffect(() => {




        const fetchReportData = async () => {



            try {

                let params = {}

                if (selectedAccountlevel) {
                    params.accountlevel = selectedAccountlevel;
                }
                if (selectedAccountledger) {
                    params.accountledger = selectedAccountledger;
                }


                const print_Response = await axios.get(`${baseUrl}/schoolreports/char-of-account-print`, {
                    params: params
                });
                console.log("print_Response", print_Response.data.data);


                if (print_Response.data.data.length > 0) {
                    setIsDataFound(true);
                } else {
                    setIsDataFound(false);
                }



                const rptHeader = {
                    school_name: print_Response.data.data[0].school.school_name,
                    address: print_Response.data.data[0].school.address,
                    city: print_Response.data.data[0].school.city,
                    state: print_Response.data.data[0].school.state,
                    country: print_Response.data.data[0].school.country,
                    school_image: print_Response.data.data[0].school.school_image
                }

                setReportHeader(rptHeader);
                setPrintData(print_Response.data.data);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching marksheet for print:', error);
                setLoading(false);
                setIsDataFound(false);
            }
        };

        fetchReportData();



    }, [selectedAccountlevel, selectedAccountledger]);




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
                    CHART OF ACCOUNT
                </Text>

                {/* 🔷 Table */}
                <View style={styles.table}>

                    {/* Header */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableHeaderCell, styles.col1]}>
                            <Text>Account Code</Text>
                        </View>

                        <View style={[styles.tableHeaderCell, styles.col2]}>
                            <Text>AccountName</Text>
                        </View>

                        <View style={[styles.tableHeaderCell, styles.col3]}>
                            <Text>Account Group</Text>
                        </View>
                    </View>




                    {/* Rows */}
                    {printData.map((row, i) => (
                        // const details1 = row.details||[];
                        <>
                            <View style={styles.tableRow} key={i}>
                                <View style={[styles.tableCell, styles.col1]}>
                                    <Text>{row?.account_code}</Text>
                                </View>

                                <View style={[styles.tableCell, styles.col2]}>
                                    <Text>{row?.account_name}</Text>
                                </View>

                                <View style={[styles.tableCell, styles.col3]}>
                                    <Text>{row?.group_name}</Text>
                                </View>
                            </View>


                        </>



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


    const downloadExpenseExcel = () => {

        // 1️⃣ Prepare Header

        const sheetData = [];
        sheetData.push(["Examination", "Questionpaper", "Date"]);

        // 📥 Data Rows
        printData.forEach((row) => {
            sheetData.push([
                row?.examination?.examination_name || "", row?.name || "",
                dayjs(row.date).format("DD-MM-YYYY") || "",
            ]);
        });




        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ExamQuestionpaper");

        const date = new Date();
        // 5️⃣ Download
        XLSX.writeFile(workbook, `ExamQuestionpaper_${date}.xlsx`);
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }
    return (
        <div className="max-w-2xl mx-auto my-10">
            <div className="w-full h-[500px]">

                {/* {printData.length > 0 ? (
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


                )}{" "} */}
                <Typography
                    variant="h4"
                    sx={{ fontWeight: "800", textAlign: "center" }}
                >
                    No Data Found
                </Typography>



            </div>

            {(isDataFound && <div className="mt-6 flex justify-center gap-3">

                {/* <PDFDownloadLink document={<PrintPDF />} fileName="Expense.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadExpenseExcel}>
                    Download Excel
                </button> */}


            </div>)}


        </div>
    );
}
