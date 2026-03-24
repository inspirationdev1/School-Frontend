
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


export default function PaymentPrint() {
    const [loading, setLoading] = useState(true);
    const [printPayment, setPrintPayment] = useState({});
    
    const [searchParams] = useSearchParams();

    const id = searchParams.get("id");

    useEffect(() => {
        const fetchPrintPayment = async () => {
            try {
                const paymentPrintResponse = await axios.get(`${baseUrl}/payment/fetch-print/${id}`, { params: { id: id } });
                console.log("paymentPrintResponse", paymentPrintResponse.data.data);
                setPrintPayment(paymentPrintResponse.data.data);
                console.log("printPayment", printPayment);

                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching payment for print:', error);
            }
        };

        fetchPrintPayment();



    }, []);

    const PrintPDF = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, styles.textBold]}>Fees Payment</Text>

                    </View>
                    <View style={styles.spaceY}>
                        <Text style={styles.textBold}>{printPayment.school.school_name}</Text>
                        <Text style={styles.textBold}>{printPayment.school.address} - {printPayment.school.city}</Text>
                        <Text style={styles.textBold}>{printPayment.school.state} - {printPayment.school.country}</Text>

                    </View>
                </View>

                
                <View>

                    {/* Row 1 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Payment # :</Text>
                        <Text style={styles.valueStyle}>{printPayment.paymentCode}</Text>

                        <Text style={styles.labelStyle}>Payment Date :</Text>
                        <Text style={styles.valueStyle}>
                            {dayjs(printPayment.paymentDate).format("DD/MM/YYYY")}
                        </Text>
                    </View>

                    

                    {/* Row 3 */}
                    <View style={styles.rowStyle}>
                       <Text style={styles.labelStyle}>Status :</Text>
                        <Text style={styles.valueStyle}>
                            {printPayment.status}
                        </Text>

                        <Text style={styles.labelStyle}>Remarks :</Text>
                        <Text style={styles.valueStyle}>
                            {printPayment.remarks}
                        </Text>
                    </View>

                    

                </View>


                <Table style={styles.table}>

                    <TH style={[styles.tableHeader, styles.textBold]}>
                        <TD style={styles.td}>S.No</TD>
                        <TD style={styles.td}>Employee</TD>
                        <TD style={styles.td}>Expense #</TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Exp Amount</Text>
                        </TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Paid Amount</Text>
                        </TD>
                        
                    </TH>



                    {printPayment.paymentDetails.map((item, index) => (
                        <TR key={index}>
                            <TD style={styles.td}>{index + 1}</TD>
                            <TD style={styles.td}>{item.employee.employee_name}</TD>
                            <TD style={styles.td}>{item.expenseCode}</TD>
                           
                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{formatAmount(item.expenseAmount)}</Text>
                            </TD>

                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{formatAmount(item.paidAmount)}</Text>
                            </TD>

                           
                        </TR>
                    ))}

                    <TR key={100}>
                        <TD style={styles.td}></TD>
                        <TD style={styles.td}></TD>
                        
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Total</Text>
                        </TD>

                        <TD style={styles.td}>
                            <Text style={styles.rightText}>{formatAmount(printPayment.totalexpenseAmount)}</Text>
                        </TD>

                        <TD style={styles.td}>
                            <Text style={styles.rightText}>{formatAmount(printPayment.totalpaidAmount)}</Text>
                        </TD>

                        
                    </TR>
                </Table>

                

            </Page>
        </Document>
    );

    const downloadPaymentExcel = () => {
        
        // 1️⃣ Prepare row data
        const rows = printPayment.paymentDetails.map((item, index) => ({
            "S.No": index + 1,
            "Description": item.employee.employee_name,
            expenseCode: item.expenseCode,
            expenseAmount: item.expenseAmount,
            paidAmount: item.paidAmount,
        }));

        // 2️⃣ Add totals at bottom
        rows.push({
            "S.No": "",
            "Description": "",
            expenseCode: "Total",
            expenseAmount: printPayment.totalexpenseAmount,
            paidAmount: printPayment.totalpaidAmount,
        });

        

        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(rows);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payment");

        // 5️⃣ Download
        XLSX.writeFile(workbook, `Payment_${printPayment.paymentDate}.xlsx`);
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

                <PDFDownloadLink document={<PrintPDF />} fileName="payment.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadPaymentExcel}>
                    Download Excel
                </button>


            </div>
        </div>
    );
}
