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


export default function ExpensePrint() {
    const [loading, setLoading] = useState(true);
    const [printExpense, setPrintExpense] = useState({});
    
    const [searchParams] = useSearchParams();

    const id = searchParams.get("id");

    useEffect(() => {
        const fetchPrintExpense = async () => {
            try {
                const expensePrintResponse = await axios.get(`${baseUrl}/expense/fetch-print/${id}`, { params: { id: id } });
                console.log("expensePrintResponse", expensePrintResponse.data.data);
                setPrintExpense(expensePrintResponse.data.data);
                console.log("printExpense", printExpense);

                
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
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, styles.textBold]}>Expense</Text>

                    </View>
                    <View style={styles.spaceY}>
                        <Text style={styles.textBold}>{printExpense.school.school_name}</Text>
                        <Text style={styles.textBold}>{printExpense.school.address} - {printExpense.school.city}</Text>
                        <Text style={styles.textBold}>{printExpense.school.state} - {printExpense.school.country}</Text>

                    </View>
                </View>

                
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

                    

                    {/* Row 3 */}
                    <View style={styles.rowStyle}>
                       <Text style={styles.labelStyle}>Status :</Text>
                        <Text style={styles.valueStyle}>
                            {printExpense.status}
                        </Text>

                        <Text style={styles.labelStyle}>Remarks :</Text>
                        <Text style={styles.valueStyle}>
                            {printExpense.remarks}
                        </Text>
                    </View>

                    

                </View>


                <Table style={styles.table}>

                    <TH style={[styles.tableHeader, styles.textBold]}>
                        <TD style={styles.td}>S.No</TD>
                        <TD style={styles.td}>Employee</TD>
                        <TD style={styles.td}>Expensetype</TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Exp Amount</Text>
                        </TD>
                         
                    </TH>



                    {printExpense.expenseDetails.map((item, index) => (
                        <TR key={index}>
                            <TD style={styles.td}>{index + 1}</TD>
                            <TD style={styles.td}>{item.employee.employee_name}</TD>
                            <TD style={styles.td}>{item.expensetype.expensetype_name}</TD>
                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{formatAmount(item.expenseAmount)}</Text>
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
            employee: item.employee.employee_name,
            expensetype: item.section.expensetype_name,
            expenseAmount: item.invAmount,
        }));

        // 2️⃣ Add totals at bottom
        rows.push({
            "S.No": "",
             employee: "",
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
