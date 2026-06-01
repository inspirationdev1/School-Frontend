import {
    Page,
    Text,
    View,
    Document,
    PDFViewer,
    PDFDownloadLink,
    Image,
} from "@react-pdf/renderer";
import { styles } from "./style";
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


export default function ExpensePrint_Orig() {
    const [loading, setLoading] = useState(true);
    const [printExpense, setPrintExpense] = useState({});

    const [searchParams] = useSearchParams();
    const [logo, setLogo] = useState("");
    const [reportHeader, setReportHeader] = useState({});

    const id = searchParams.get("id");

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

    useEffect(() => {
        const fetchPrintExpense = async () => {
            try {
                const expensePrintResponse = await axios.get(`${baseUrl}/expense/fetch-print/${id}`, { params: { id: id } });
                console.log("expensePrintResponse", expensePrintResponse.data.data);
                setPrintExpense(expensePrintResponse.data.data);
                console.log("printExpense", printExpense);

                const rptHeader = {
                    school_name: expensePrintResponse.data.data?.school.school_name,
                    address: expensePrintResponse.data.data?.school.address,
                    city: expensePrintResponse.data.data?.school.city,
                    state: expensePrintResponse.data.data?.school.state,
                    country: expensePrintResponse.data.data?.school.country,
                    school_image: expensePrintResponse.data.data?.school.school_image
                }

                setReportHeader(rptHeader);


                setLoading(false);
            } catch (error) {
                console.error('Error fetching expense for print:', error);
            }
        };

        fetchPrintExpense();



    }, []);

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
                    EXPENSE
                </Text>
                {/* <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, styles.textBold]}>Expense</Text>

                    </View>
                    <View style={styles.spaceY}>
                        <Text style={styles.textBold}>{printExpense.school.school_name}</Text>
                        <Text style={styles.textBold}>{printExpense.school.address} - {printExpense.school.city}</Text>
                        <Text style={styles.textBold}>{printExpense.school.state} - {printExpense.school.country}</Text>

                    </View>
                </View> */}


                <View>

                    {/* Row 1 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Expense # :</Text>
                        <Text style={styles.valueStyle}>{printExpense.expenseCode}</Text>

                        <Text style={styles.labelStyle}>Expense Date :</Text>
                        <Text style={styles.valueStyle}>
                            {dayjs(printExpense.expenseDate).format("DD/MM/YYYY")}
                        </Text>
                    </View>

                    {/* Row 2 */}
                    <View style={styles.rowStyle}>

                        <Text style={styles.labelStyle}>Employee :</Text>
                        <Text style={styles.valueStyle}>
                            {printExpense?.employee.employee_name}
                        </Text>

                        <Text style={styles.labelStyle}>Remarks :</Text>
                        <Text style={styles.valueStyle}>
                            {printExpense.remarks}
                        </Text>
                    </View>

                    {/* Row 3 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Status :</Text>
                        <Text style={styles.valueStyle}>
                            {printExpense.status}
                        </Text>

                    </View>



                </View>


                <Table style={styles.table}>

                    <TH style={[styles.tableHeader, styles.textBold]}>
                        <TD style={styles.td}>S.No</TD>
                        <TD style={styles.td}>Expensetype</TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Exp Amount</Text>
                        </TD>

                    </TH>



                    {printExpense.expenseDetails.map((item, index) => (
                        <TR key={index}>
                            <TD style={styles.td}>{index + 1}</TD>
                            <TD style={styles.td}>{item.expensetype.expensetype_name}</TD>
                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{formatAmount(item.expenseAmount)}</Text>
                            </TD>
                        </TR>
                    ))}

                    <TR key={100}>
                        <TD style={styles.td}></TD>

                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Total</Text>
                        </TD>



                        <TD style={styles.td}>
                            <Text style={styles.rightText}>{formatAmount(printExpense.totalexpenseAmount)}</Text>
                        </TD>


                    </TR>
                </Table>



            </Page>
        </Document>
    );

    const downloadExpenseExcel = () => {

        // 1️⃣ Prepare row data
        const rows = printExpense.expenseDetails.map((item, index) => ({
            "S.No": index + 1,
            expensetype: item.expensetype.expensetype_name,
            expenseAmount: item.expenseAmount,
        }));

        // 2️⃣ Add totals at bottom
        rows.push({
            "S.No": "",
            expensetype: "Total",
            expenseAmount: printExpense.totalexpenseAmount,

        });



        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(rows);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expense");

        // 5️⃣ Download
        XLSX.writeFile(workbook, `Expense_${printExpense.expenseDate}.xlsx`);
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }
    return (
        <div className="max-w-2xl mx-auto my-10">
            <div className="w-full h-[500px]">
                <PDFViewer width="100%" height="100%">
                    <PrintPDF />
                </PDFViewer>
            </div>
            <div className="mt-6 flex justify-center gap-3">

                <PDFDownloadLink document={<PrintPDF />} fileName="expense.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadExpenseExcel}>
                    Download Excel
                </button>


            </div>
        </div>
    );
}
