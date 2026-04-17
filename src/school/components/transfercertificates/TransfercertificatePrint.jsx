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


export default function TransfercertificatePrint() {
    const [loading, setLoading] = useState(true);
    const [printTransfercertificate, setPrintTransfercertificate] = useState({});

    const [searchParams] = useSearchParams();

    const id = searchParams.get("id");

    useEffect(() => {
        const fetchPrintTransfercertificate = async () => {
            try {
                const transfercertificatePrintResponse = await axios.get(`${baseUrl}/transfercertificate/fetch-print/${id}`, { params: { id: id } });
                console.log("transfercertificatePrintResponse", transfercertificatePrintResponse.data.data);
                setPrintTransfercertificate(transfercertificatePrintResponse.data.data);
                console.log("printTransfercertificate", printTransfercertificate);


                setLoading(false);
            } catch (error) {
                console.error('Error fetching transfercertificate for print:', error);
            }
        };

        fetchPrintTransfercertificate();



    }, []);

    const PrintPDF = () => (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* 🔷 Header */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                    borderBottom: "1px solid #000",
                    paddingBottom: 10
                }}>
                    <Image
                        src={printTransfercertificate.school.school_image}
                        style={{ width: 60, height: 60 }}
                    />

                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                            {printTransfercertificate.school.school_name}
                        </Text>
                        <Text>
                            {printTransfercertificate.school.address},{" "}
                            {printTransfercertificate.school.city}
                        </Text>
                        <Text>
                            {printTransfercertificate.school.state} -{" "}
                            {printTransfercertificate.school.country}
                        </Text>
                    </View>

                    <View style={{ width: 60 }} />
                </View>

                {/* 🔷 Title */}
                <View style={{ alignItems: "center", marginBottom: 15 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", textDecoration: "underline" }}>
                        TRANSFER CERTIFICATE
                    </Text>
                </View>

                {/* 🔷 Ref & Date */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
                    <Text>TC No: {printTransfercertificate.siCode}</Text>
                    <Text>
                        Date: {dayjs(printTransfercertificate.docDate).format("DD/MM/YYYY")}
                    </Text>
                </View>

                {/* 🔷 Student Details (FORM STYLE) */}
                <View style={{ marginTop: 10 }}>

                    {[
                        ["1. Student Name", printTransfercertificate.student.name],
                        ["2. Class", printTransfercertificate.class.class_name],
                        ["3. Section", printTransfercertificate.section.section_name],
                        ["4. Academic Year", printTransfercertificate.year],
                        ["5. Date of Joining", dayjs(printTransfercertificate.student.joinDate).format("DD/MM/YYYY")],
                        ["6. Date of Leaving", dayjs(printTransfercertificate.leaveDate).format("DD/MM/YYYY")],
                        ["7. Reason for Leaving", printTransfercertificate.reason || "N/A"],
                        ["8. Conduct", printTransfercertificate.status],
                    ].map((item, index) => (
                        <View
                            key={index}
                            style={{
                                flexDirection: "row",
                                borderBottom: "1px solid #ccc",
                                paddingVertical: 6
                            }}
                        >
                            <Text style={{ width: "40%", fontWeight: "bold" }}>
                                {item[0]}
                            </Text>
                            <Text style={{ width: "60%" }}>
                                {item[1]}
                            </Text>
                        </View>
                    ))}

                </View>

                {/* 🔷 Declaration */}
                <View style={{ marginTop: 20 }}>
                    <Text>
                        This is to certify that the above information is true as per school records.
                    </Text>
                </View>

                {/* 🔷 Signature Section */}
                <View style={{
                    marginTop: 60,
                    flexDirection: "row",
                    justifyContent: "space-between"
                }}>
                    <View>
                        <Text>____________________</Text>
                        <Text>Class Teacher</Text>
                    </View>

                    <View>
                        <Text>____________________</Text>
                        <Text>Office Seal</Text>
                    </View>

                    <View>
                        <Text>____________________</Text>
                        <Text>Principal</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );




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

                <PDFDownloadLink document={<PrintPDF />} fileName="transfercertificate.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>





            </div>
        </div>
    );
}
