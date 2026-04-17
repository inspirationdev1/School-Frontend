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


export default function BonafidecertificatePrint() {
    const [loading, setLoading] = useState(true);
    const [printBonafidecertificate, setPrintBonafidecertificate] = useState({});

    const [searchParams] = useSearchParams();

    const id = searchParams.get("id");

    useEffect(() => {
        const fetchPrintBonafidecertificate = async () => {
            try {
                const bonafidecertificatePrintResponse = await axios.get(`${baseUrl}/bonafidecertificate/fetch-print/${id}`, { params: { id: id } });
                console.log("bonafidecertificatePrintResponse", bonafidecertificatePrintResponse.data.data);
                setPrintBonafidecertificate(bonafidecertificatePrintResponse.data.data);
                console.log("printBonafidecertificate", printBonafidecertificate);


                setLoading(false);
            } catch (error) {
                console.error('Error fetching bonafidecertificate for print:', error);
            }
        };

        fetchPrintBonafidecertificate();



    }, []);

    const PrintPDF = () => (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* 🔷 School Header */}
                {/* <View style={{ textAlign: "center", marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                        {printBonafidecertificate.school.school_name}
                    </Text>
                    <Text>
                        {printBonafidecertificate.school.address},{" "}
                        {printBonafidecertificate.school.city}
                    </Text>
                    <Text>
                        {printBonafidecertificate.school.state} -{" "}
                        {printBonafidecertificate.school.country}
                    </Text>
                </View> */}
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
                        src={printBonafidecertificate.school.school_image}
                        style={{ width: 60, height: 60 }}
                    />

                    {/* Center Content */}
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                            {printBonafidecertificate.school.school_name}
                        </Text>
                        <Text>
                            {printBonafidecertificate.school.address},{" "}
                            {printBonafidecertificate.school.city}
                        </Text>
                        <Text>
                            {printBonafidecertificate.school.state} -{" "}
                            {printBonafidecertificate.school.country}
                        </Text>
                    </View>

                    {/* Empty space for balance */}
                    <View style={{ width: 60 }} />
                </View>


                {/* 🔷 Title */}
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", textDecoration: "underline" }}>
                        BONAFIDE CERTIFICATE
                    </Text>
                </View>

                {/* 🔷 Certificate Number & Date */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                    <Text>Ref No: {printBonafidecertificate.siCode}</Text>
                    <Text>
                        Date: {dayjs(printBonafidecertificate.docDate).format("DD/MM/YYYY")}
                    </Text>
                </View>

                {/* 🔷 Main Content */}
                <View style={{ marginTop: 10, lineHeight: 1.6 }}>
                    <Text>
                        This is to certify that{" "}
                        <Text style={{ fontWeight: "bold" }}>
                            {printBonafidecertificate.student.name}
                        </Text>{" "}
                        is a bonafide student of our school studying in{" "}
                        <Text style={{ fontWeight: "bold" }}>
                            Class {printBonafidecertificate.class.class_name} -{" "}
                            {printBonafidecertificate.section.section_name}
                        </Text>{" "}
                        for the academic year{" "}
                        <Text style={{ fontWeight: "bold" }}>
                            {printBonafidecertificate.year}
                        </Text>.
                    </Text>

                    <Text style={{ marginTop: 10 }}>
                        As per the school records, his/her conduct has been{" "}
                        <Text style={{ fontWeight: "bold" }}>
                            {printBonafidecertificate.status}
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

                <PDFDownloadLink document={<PrintPDF />} fileName="bonafidecertificate.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>





            </div>
        </div>
    );
}
