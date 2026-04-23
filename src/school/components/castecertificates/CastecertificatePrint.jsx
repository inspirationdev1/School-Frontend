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


export default function CastecertificatePrint() {
    const [loading, setLoading] = useState(true);
    const [printCastecertificate, setPrintCastecertificate] = useState({});

    const [searchParams] = useSearchParams();

    const id = searchParams.get("id");

    useEffect(() => {
        const fetchPrintCastecertificate = async () => {
            try {
                const castecertificatePrintResponse = await axios.get(`${baseUrl}/castecertificate/fetch-print/${id}`, { params: { id: id } });
                console.log("castecertificatePrintResponse", castecertificatePrintResponse.data.data);
                setPrintCastecertificate(castecertificatePrintResponse.data.data);
                console.log("printCastecertificate", printCastecertificate);


                setLoading(false);
            } catch (error) {
                console.error('Error fetching castecertificate for print:', error);
            }
        };

        fetchPrintCastecertificate();



    }, []);

    const PrintPDF = () => (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* 🔷 School Header */}
                
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                    borderBottom: "1px solid #000",
                    paddingBottom: 10
                }}>

                    {/* Logo */}
                    <Image
                        src={printCastecertificate.school.school_image}
                        style={{ width: 60, height: 60 }}
                    />

                    {/* Center Content */}
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                            {printCastecertificate.school.school_name}
                        </Text>
                        <Text>
                            {printCastecertificate.school.address},{" "}
                            {printCastecertificate.school.city}
                        </Text>
                        <Text>
                            {printCastecertificate.school.state} -{" "}
                            {printCastecertificate.school.country}
                        </Text>
                    </View>

                    {/* Empty space for balance */}
                    <View style={{ width: 60 }} />
                </View>


                {/* 🔷 Title */}
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", textDecoration: "underline" }}>
                        CASTE CERTIFICATE
                    </Text>
                </View>

                {/* 🔷 Certificate Number & Date */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                    <Text>Ref No: {printCastecertificate.siCode}</Text>
                    <Text>
                        Date: {dayjs(printCastecertificate.docDate).format("DD/MM/YYYY")}
                    </Text>
                </View>

                {/* 🔷 Main Content */}
                <View style={{ marginTop: 10, lineHeight: 1.6 }}>
                    <Text>
                        This is to certify that{" "}
                        <Text style={{ fontWeight: "bold" }}>
                            {printCastecertificate.student.name}
                        </Text>{" "}
                        is a caste student of our school studying in{" "}
                        <Text style={{ fontWeight: "bold" }}>
                            Class {printCastecertificate.class.class_name} -{" "}
                            {printCastecertificate.section.section_name}
                        </Text>{" "}
                        for the academic year{" "}
                        <Text style={{ fontWeight: "bold" }}>
                            {printCastecertificate.year}
                        </Text>.
                    </Text>

                    <Text style={{ marginTop: 10 }}>
                        As per the school records, his/her conduct has been{" "}
                        <Text style={{ fontWeight: "bold" }}>
                            {printCastecertificate.status}
                        </Text>.
                    </Text>

                    <Text style={{ marginTop: 10 }}>
                        This certificate is issued upon request for official purposes.
                    </Text>
                </View>

                {/* 🔷 Signature Section */}
                <View style={{ marginTop: 60, flexDirection: "row", justifyContent: "space-between" }}>
                    <View>
                        <Text>____________________</Text>
                        <Text>Class Teacher</Text>
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

                <PDFDownloadLink document={<PrintPDF />} fileName="castecertificate.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>





            </div>
        </div>
    );
}
