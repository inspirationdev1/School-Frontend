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
import { baseUrl } from '../../../environment';
import { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";


export default function SalesinvoicePrint() {
    const [loading, setLoading] = useState(true);
    const [printSalesinvoice, setPrintSalesinvoice] = useState({});
    
    const [searchParams] = useSearchParams();

    const id = searchParams.get("id");

    useEffect(() => {
        const fetchPrintSalesinvoice = async () => {
            try {
                const salesinvoicePrintResponse = await axios.get(`${baseUrl}/salesinvoice/fetch-print/${id}`, { params: { id: id } });
                console.log("salesinvoicePrintResponse", salesinvoicePrintResponse.data.data);
                setPrintSalesinvoice(salesinvoicePrintResponse.data.data);
                console.log("printSalesinvoice", printSalesinvoice);

                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching salesinvoice for print:', error);
            }
        };

        fetchPrintSalesinvoice();



    }, []);

    const PrintPDF = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, styles.textBold]}>Fees Invoice</Text>

                    </View>
                    <View style={styles.spaceY}>
                        <Text style={styles.textBold}>{printSalesinvoice.school.school_name}</Text>
                        <Text style={styles.textBold}>{printSalesinvoice.school.address} - {printSalesinvoice.school.city}</Text>
                        <Text style={styles.textBold}>{printSalesinvoice.school.state} - {printSalesinvoice.school.country}</Text>

                    </View>
                </View>

                
                <View>

                    {/* Row 1 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Invoice # :</Text>
                        <Text style={styles.valueStyle}>{printSalesinvoice.siCode}</Text>

                        <Text style={styles.labelStyle}>Invoice Date :</Text>
                        <Text style={styles.valueStyle}>
                            {dayjs(printSalesinvoice.invoiceDate).format("DD/MM/YYYY")}
                        </Text>
                    </View>

                    {/* Row 2 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Class :</Text>
                        <Text style={styles.valueStyle}>
                            {printSalesinvoice.class.class_text}
                        </Text>

                        <Text style={styles.labelStyle}>Section :</Text>
                        <Text style={styles.valueStyle}>
                            {printSalesinvoice.section.section_name}
                        </Text>
                    </View>

                    {/* Row 3 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Student :</Text>
                        <Text style={styles.valueStyle}>
                            {printSalesinvoice.student.name}
                        </Text>

                        <Text style={styles.labelStyle}>Payment Status :</Text>
                        <Text style={styles.valueStyle}>
                            {printSalesinvoice.paymentStatus}
                        </Text>
                    </View>

                    {/* Row 4 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Status :</Text>
                        <Text style={styles.valueStyle}>
                            {printSalesinvoice.status}
                        </Text>
                    </View>

                </View>


                <Table style={styles.table}>

                    <TH style={[styles.tableHeader, styles.textBold]}>
                        <TD style={styles.td}>S.No</TD>
                        <TD style={styles.td}>Description</TD>
                        <TD style={styles.td}>Frequency</TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Fee Amount</Text>
                        </TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Gross Amount</Text>
                        </TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Discount</Text>
                        </TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Net Amount</Text>
                        </TD>
                    </TH>



                    {printSalesinvoice.invoiceDetails.map((item, index) => (
                        <TR key={index}>
                            <TD style={styles.td}>{index + 1}</TD>
                            <TD style={styles.td}>{item.feestructure.name}</TD>
                            <TD style={styles.td}>{item.feeFrequency}</TD>

                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{item.feeAmount}</Text>
                            </TD>

                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{item.grossAmount}</Text>
                            </TD>

                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{item.discountAmount}</Text>
                            </TD>

                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{item.netAmount}</Text>
                            </TD>
                        </TR>
                    ))}

                    <TR key={100}>
                        <TD style={styles.td}></TD>
                        <TD style={styles.td}></TD>
                        <TD style={styles.td}></TD>

                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Total</Text>
                        </TD>

                        <TD style={styles.td}>
                            <Text style={styles.rightText}>{printSalesinvoice.totalGrossAmount}</Text>
                        </TD>

                        <TD style={styles.td}>
                            <Text style={styles.rightText}>{printSalesinvoice.totalDiscountAmount}</Text>
                        </TD>

                        <TD style={styles.td}>
                            <Text style={styles.rightText}>{printSalesinvoice.totalNetAmount}</Text>
                        </TD>
                    </TR>
                </Table>

                

            </Page>
        </Document>
    );

    const downloadSalesinvoiceExcel = () => {
        // 1️⃣ Prepare row data
        const rows = printSalesinvoice.invoiceDetails.map((item, index) => ({
            "S.No": index + 1,
            "Description": item.feestructure.name,
            feeFrequency: item.feeFrequency,
            feeAmount: item.feeAmount,
            grossAmount: item.grossAmount,
            discountAmount: item.discountAmount,
            netAmount: item.netAmount,
        }));

        // 2️⃣ Add totals at bottom
        rows.push({
            "S.No": "",
            "Description": "",
            feeFrequency: "",
            feeAmount: "Total",
            grossAmount: printSalesinvoice.totalGrossAmount,
            discountAmount: printSalesinvoice.totalDiscountAmount,
            netAmount: printSalesinvoice.totalNetAmount,
        });

        

        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(rows);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Salesinvoice");

        // 5️⃣ Download
        XLSX.writeFile(workbook, `Salesinvoice_${printSalesinvoice.invoiceDate}.xlsx`);
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

                <PDFDownloadLink document={<PrintPDF />} fileName="salesinvoice.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadSalesinvoiceExcel}>
                    Download Excel
                </button>


            </div>
        </div>
    );
}
