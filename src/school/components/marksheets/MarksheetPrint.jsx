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


export default function MarksheetPrint() {
    const [loading, setLoading] = useState(true);
    const [printMarksheet, setPrintMarksheet] = useState({});
    
    const [searchParams] = useSearchParams();

    const id = searchParams.get("id");

    useEffect(() => {
        const fetchPrintMarksheet = async () => {
            try {
                const marksheetPrintResponse = await axios.get(`${baseUrl}/marksheet/fetch-print/${id}`, { params: { id: id } });
                console.log("marksheetPrintResponse", marksheetPrintResponse.data.data);
                setPrintMarksheet(marksheetPrintResponse.data.data);
                console.log("printMarksheet", printMarksheet);

                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching marksheet for print:', error);
            }
        };

        fetchPrintMarksheet();



    }, []);

    const PrintPDF = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, styles.textBold]}>Marksheet</Text>

                    </View>
                    <View style={styles.spaceY}>
                        <Text style={styles.textBold}>{printMarksheet.school.school_name}</Text>
                        <Text style={styles.textBold}>{printMarksheet.school.address} - {printMarksheet.school.city}</Text>
                        <Text style={styles.textBold}>{printMarksheet.school.state} - {printMarksheet.school.country}</Text>

                    </View>
                </View>

                
                <View>

                    {/* Row 1 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>MS # :</Text>
                        <Text style={styles.valueStyle}>{printMarksheet.msCode}</Text>

                        <Text style={styles.labelStyle}>MS Date :</Text>
                        <Text style={styles.valueStyle}>
                            {dayjs(printMarksheet.msDate).format("DD/MM/YYYY")}
                        </Text>
                    </View>

                    {/* Row 2 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Class :</Text>
                        <Text style={styles.valueStyle}>
                            {printMarksheet.class.class_text}
                        </Text>

                        <Text style={styles.labelStyle}>Section :</Text>
                        <Text style={styles.valueStyle}>
                            {printMarksheet.section.section_name}
                        </Text>
                    </View>

                    {/* Row 3 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Teacher :</Text>
                        <Text style={styles.valueStyle}>
                            {printMarksheet.teacher.name}
                        </Text>

                        <Text style={styles.labelStyle}>Subject :</Text>
                        <Text style={styles.valueStyle}>
                            {printMarksheet.subject.subject_name}
                        </Text>

                        
                    </View>

                    {/* Row 4 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Examination :</Text>
                        <Text style={styles.valueStyle}>
                            {printMarksheet.examination.name}
                        </Text>

                        <Text style={styles.labelStyle}>Questionpaper :</Text>
                        <Text style={styles.valueStyle}>
                            {printMarksheet.questionpaper.name}
                        </Text>

                        
                    </View>

                    {/* Row 5 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Status :</Text>
                        <Text style={styles.valueStyle}>
                            {printMarksheet.status}
                        </Text>
                        <Text style={styles.labelStyle}>Remarks :</Text>
                        <Text style={styles.valueStyle}>
                            {printMarksheet.remarks}
                        </Text>
                    </View>

                </View>


                <Table style={styles.table}>

                    <TH style={[styles.tableHeader, styles.textBold]}>
                        <TD style={styles.td}>S.No</TD>
                        <TD style={styles.td}>Student</TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Marks Limit</Text>
                        </TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Marks</Text>
                        </TD>
                        
                    </TH>



                    {printMarksheet.marksheetDetails.map((item, index) => (
                        <TR key={index}>
                            <TD style={styles.td}>{index + 1}</TD>
                            <TD style={styles.td}>{item.student.name}</TD>
                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{item.marksLimit}</Text>
                            </TD>
                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{item.marks}</Text>
                            </TD>

                            
                        </TR>
                    ))}

                    
                </Table>

                

            </Page>
        </Document>
    );

    const downloadMarksheetExcel = () => {
        // 1️⃣ Prepare row data
        const rows = printMarksheet.marksheetDetails.map((item, index) => ({
            "S.No": index + 1,
            "Student": item.student.name,
            marksLimit: item.marksLimit,
            marks: item.marks,
            
        }));

        

        

        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(rows);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Marksheet");

        // 5️⃣ Download
        XLSX.writeFile(workbook, `Marksheet_${printMarksheet.msDate}.xlsx`);
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

                <PDFDownloadLink document={<PrintPDF />} fileName="marksheet.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadMarksheetExcel}>
                    Download Excel
                </button>


            </div>
        </div>
    );
}
