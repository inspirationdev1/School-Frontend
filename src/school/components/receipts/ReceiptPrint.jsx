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


export default function ReceiptPrint() {
    const [loading, setLoading] = useState(true);
    const [printReceipt, setPrintReceipt] = useState({});
    
    const [searchParams] = useSearchParams();

    const id = searchParams.get("id");

    useEffect(() => {
        const fetchPrintReceipt = async () => {
            try {
                const receiptPrintResponse = await axios.get(`${baseUrl}/receipt/fetch-print/${id}`, { params: { id: id } });
                console.log("receiptPrintResponse", receiptPrintResponse.data.data);
                setPrintReceipt(receiptPrintResponse.data.data);
                console.log("printReceipt", printReceipt);

                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching receipt for print:', error);
            }
        };

        fetchPrintReceipt();



    }, []);

    const PrintPDF = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, styles.textBold]}>Fees Receipt</Text>

                    </View>
                    <View style={styles.spaceY}>
                        <Text style={styles.textBold}>{printReceipt.school.school_name}</Text>
                        <Text style={styles.textBold}>{printReceipt.school.address} - {printReceipt.school.city}</Text>
                        <Text style={styles.textBold}>{printReceipt.school.state} - {printReceipt.school.country}</Text>

                    </View>
                </View>

                
                <View>

                    {/* Row 1 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Receipt # :</Text>
                        <Text style={styles.valueStyle}>{printReceipt.receiptCode}</Text>

                        <Text style={styles.labelStyle}>Receipt Date :</Text>
                        <Text style={styles.valueStyle}>
                            {dayjs(printReceipt.receiptDate).format("DD/MM/YYYY")}
                        </Text>
                    </View>

                    

                    {/* Row 3 */}
                    <View style={styles.rowStyle}>
                       <Text style={styles.labelStyle}>Status :</Text>
                        <Text style={styles.valueStyle}>
                            {printReceipt.status}
                        </Text>

                        <Text style={styles.labelStyle}>Remarks :</Text>
                        <Text style={styles.valueStyle}>
                            {printReceipt.remarks}
                        </Text>
                    </View>

                    

                </View>


                <Table style={styles.table}>

                    <TH style={[styles.tableHeader, styles.textBold]}>
                        <TD style={styles.td}>S.No</TD>
                        <TD style={styles.td}>Student</TD>
                        <TD style={styles.td}>Class</TD>
                        <TD style={styles.td}>Section</TD>
                        <TD style={styles.td}>Invoice #</TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Inv Amount</Text>
                        </TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Paid Amount</Text>
                        </TD>
                        
                    </TH>



                    {printReceipt.receiptDetails.map((item, index) => (
                        <TR key={index}>
                            <TD style={styles.td}>{index + 1}</TD>
                            <TD style={styles.td}>{item.student.name}</TD>
                            <TD style={styles.td}>{item.class.class_text}</TD>
                            <TD style={styles.td}>{item.section.section_name}</TD>
                            <TD style={styles.td}>{item.siCode}</TD>
                           
                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{formatAmount(item.invAmount)}</Text>
                            </TD>

                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{formatAmount(item.paidAmount)}</Text>
                            </TD>

                           
                        </TR>
                    ))}

                    <TR key={100}>
                        <TD style={styles.td}></TD>
                        <TD style={styles.td}></TD>
                        <TD style={styles.td}></TD>
                        <TD style={styles.td}></TD>

                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Total</Text>
                        </TD>

                        <TD style={styles.td}>
                            <Text style={styles.rightText}>{formatAmount(printReceipt.totalinvAmount)}</Text>
                        </TD>

                        <TD style={styles.td}>
                            <Text style={styles.rightText}>{formatAmount(printReceipt.totalpaidAmount)}</Text>
                        </TD>

                        
                    </TR>
                </Table>

                

            </Page>
        </Document>
    );

    const downloadReceiptExcel = () => {
        
        // 1️⃣ Prepare row data
        const rows = printReceipt.receiptDetails.map((item, index) => ({
            "S.No": index + 1,
            "Description": item.student.name,
            class: item.class.class_text,
            section: item.section.section_name,
            siCode: item.siCode,
            invAmount: item.invAmount,
            paidAmount: item.paidAmount,
        }));

        // 2️⃣ Add totals at bottom
        rows.push({
            "S.No": "",
            "Description": "",
            class: "",
            section: "",
            siCode: "Total",
            invAmount: printReceipt.totalinvAmount,
            paidAmount: printReceipt.totalpaidAmount,
        });

        

        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(rows);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Receipt");

        // 5️⃣ Download
        XLSX.writeFile(workbook, `Receipt_${printReceipt.receiptDate}.xlsx`);
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

                <PDFDownloadLink document={<PrintPDF />} fileName="receipt.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadReceiptExcel}>
                    Download Excel
                </button>


            </div>
        </div>
    );
}
