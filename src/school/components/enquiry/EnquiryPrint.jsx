
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
    colIncome: {
        width: "75%"
    },

    colAmount: {
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
    },
    page: {
        backgroundColor: "#fff",
        color: "#262626",
        fontFamily: "Helvetica",
        fontSize: "12px",
        padding: "30px 50px",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
    },
    textBold: {
        fontFamily: "Helvetica-Bold",
    },
    spaceY: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
    },
    billTo: {
        marginBottom: 10,
    },
    table: {
        width: "100%",
        borderColor: "1px solid #f3f4f6",
        margin: "20px 0",
    },
    tableHeader: {
        backgroundColor: "#e5e5e5",
    },
    td: {
        padding: 5,
        // fontSize: 9,
        // justifyContent: "center",
    },
    totals: {
        display: "flex",
        alignItems: "flex-end",
    },
    rowStyle: {
        flexDirection: "row",
        marginBottom: 6,
    },
    labelStyle: {
        width: "20%",
        fontWeight: "bold",
    },
    valueStyle: {
        width: "30%",
    },
    rightText: {
        width: "100%",       // 🔥 REQUIRED
        textAlign: "right",  // 🔥 NOW it works
    },
});


export default function EnquiryPrint() {
    const [loading, setLoading] = useState(true);
    const [printData, setPrintData] = useState([]);


    const [reportHeader, setReportHeader] = useState({});
    
    const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
    

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [isDataFound, setIsDataFound] = useState(false)







    useEffect(() => {




        const fetchReportData = async () => {



            try {

                const enquiryPrintResponse = await axios.get(`${baseUrl}/enquiry/fetch-print/${id}`, { params: { id: id } });
                console.log("enquiryPrintResponse", enquiryPrintResponse.data.data);

                setPrintData(enquiryPrintResponse.data.data);

                if (enquiryPrintResponse.data.data) {
                    setIsDataFound(true);
                } else {
                    setIsDataFound(false);
                }



                const rptHeader = {
                    school_name: enquiryPrintResponse.data.data?.school[0]?.school_name,
                    address: enquiryPrintResponse.data.data?.school[0]?.address,
                    city: enquiryPrintResponse.data.data?.school[0]?.city,
                    state: enquiryPrintResponse.data.data?.school[0]?.state,
                    country: enquiryPrintResponse.data.data?.school[0]?.country,
                    school_image: enquiryPrintResponse.data.data?.school[0]?.school_image
                }

                setReportHeader(rptHeader);

                setLoading(false);

            } catch (error) {
                console.error('Error fetching marksheet for print:', error);
                setLoading(false);
                setIsDataFound(false);
            }
        };

        fetchReportData();



    }, []);




    const PrintPDF = () => (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>

                {/* 🔷 Header */}
                <View style={styles.headerContainer}>
                    {/* If you have logo, uncomment */}
                    {logo && typeof logo === "string" && (
                        <Image src={logo} style={styles.logo} />
                    )}

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
                    ENQUIRY FORM
                </Text>

                <View>

                    {/* Row 1 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Enquiry # :</Text>
                        <Text style={styles.valueStyle}>{printData.enquiry_code}</Text>

                        <Text style={styles.labelStyle}>Enquiry Date :</Text>
                        <Text style={styles.valueStyle}>
                            {dayjs(printData.enquiry_date).format("DD/MM/YYYY")}
                        </Text>
                    </View>

                    {/* Row 2 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Father name :</Text>
                        <Text style={styles.valueStyle}>
                            {printData.father_name}
                        </Text>

                        <Text style={styles.labelStyle}>Father occupation :</Text>
                        <Text style={styles.valueStyle}>
                            {printData.father_occupation}
                        </Text>
                    </View>

                    {/* Row 3 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Father Phoneno :</Text>
                        <Text style={styles.valueStyle}>
                            {printData.father_phoneno}
                        </Text>

                        <Text style={styles.labelStyle}>Father email :</Text>
                        <Text style={styles.valueStyle}>
                            {printData.father_email}
                        </Text>


                    </View>

                    {/* Row 4 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Mother Name :</Text>
                        <Text style={styles.valueStyle}>
                            {printData.mother_name}
                        </Text>

                        <Text style={styles.labelStyle}>Mother occupation :</Text>
                        <Text style={styles.valueStyle}>
                            {printData.mother_occupation}
                        </Text>


                    </View>

                    {/* Row 5 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Mother Phoneno :</Text>
                        <Text style={styles.valueStyle}>
                            {printData.mother_phoneno}
                        </Text>

                        <Text style={styles.labelStyle}>Mother Email :</Text>
                        <Text style={styles.valueStyle}>
                            {printData.mother_email}
                        </Text>


                    </View>

                    {/* Row 6 */}
                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Status :</Text>
                        <Text style={styles.valueStyle}>
                            {printData.address}
                        </Text>
                        <Text style={styles.labelStyle}>Address :</Text>
                        <Text style={styles.valueStyle}>
                            {printData.remarks}
                        </Text>
                    </View>

                    {/* Row 7 */}
                    <View style={styles.rowStyle}>

                        <Text style={styles.labelStyle}>Remarks :</Text>
                        <Text style={styles.valueStyle}>
                            {printData.remarks}
                        </Text>
                    </View>

                </View>


                <Table style={styles.table}>

                    <TH style={[styles.tableHeader, styles.textBold]}>
                        <TD style={styles.td}>S.No</TD>
                        <TD style={styles.td}>Child Name</TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>DOB</Text>
                        </TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Class</Text>
                        </TD>

                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Previous School</Text>
                        </TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Previous School Name</Text>
                        </TD>
                        <TD style={styles.td}>
                            <Text style={styles.rightText}>Board</Text>
                        </TD>

                    </TH>



                    {printData.enquiryDetails?.map((item, index) => (
                        <TR key={index}>
                            <TD style={styles.td}>{index + 1}</TD>
                            <TD style={styles.td}>{item.child_name}</TD>
                            <TD style={styles.td}>
                                {item.child_dob ? dayjs(item.child_dob).format("DD/MM/YYYY") : ""}
                            </TD>
                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{item.class?.class_name}</Text>
                            </TD>
                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{item.previousschool?.generalmaster_name}</Text>
                            </TD>
                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{item?.previousschool_name}</Text>
                            </TD>
                            <TD style={styles.td}>
                                <Text style={styles.rightText}>{item.board?.generalmaster_name}</Text>
                            </TD>



                        </TR>
                    ))}


                </Table>


            </Page>
        </Document>
    );


    const [logo, setLogo] = useState("");

    useEffect(() => {
        if (reportHeader?.school_image) {
            getBase64Image(reportHeader.school_image)
                .then((res) => {
                    if (res) setLogo(res);
                })
                .catch(() => setLogo(null));
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


  

    if (loading) {
        return <Typography>Loading...</Typography>;
    }
    return (
        <div className="max-w-2xl mx-auto my-10">
            <div className="w-full h-[500px]">

                {printData ? (
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


                )}{" "}

               

            </div>

            {(isDataFound && <div className="mt-6 flex justify-center gap-3">

                <PDFDownloadLink document={<PrintPDF />} fileName="Enquiry.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


               


            </div>)}


        </div>
    );
}
