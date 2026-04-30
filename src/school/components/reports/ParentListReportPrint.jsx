
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
import { useState, useEffect, Fragment } from 'react';
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
        backgroundColor: "#f2f2f2",
        flexGrow: 0
    },

    tableCell: {
        borderRightWidth: 1,
        borderBottomWidth: 1,
        padding: 6,
        flexGrow: 0,
        flexShrink: 1,   // ✅ allow shrink
        flexWrap: "wrap" // ✅ wrap text
    },

    // ✅ FIXED COLUMN WIDTHS
    col1: { width: "15%" },  // Parent Name
    col2: { width: "8%" },   // Gender
    col3: { width: "15%" },  // Parent Name
    col4: { width: "12%" },  // DOB
    col5: { width: "12%" },  // Admission Date
    col6: { width: "10%" },  // Class
    col7: { width: "8%" },   // Section
    col8: { width: "10%" },  // Pen
    col9: { width: "10%" },  // Aadhar


    centerText: {
        textAlign: "center"
    },
    rightText: {
        textAlign: "right"
    },
    lastCol: {
        borderRightWidth: 0
    },

    // 🔷 Total Row
    totalRow: {
        flexDirection: "row",
        backgroundColor: "#eee"
    },

    boldText: {
        fontWeight: "bold"
    }
});


export default function ParentListReportPrint() {
    const [loading, setLoading] = useState(true);
    const [printData, setPrintData] = useState([]);
    const [pdfUrl, setPdfUrl] = useState(null);

    const [reportHeader, setReportHeader] = useState({});
    const [rows, setRows] = useState([]);
    const [date, setDate] = useState(new dayjs(Date()).format("YYYY-MM-DD"));




    const [searchParams] = useSearchParams();




    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);


    const [isDataFound, setIsDataFound] = useState(false)


    useEffect(() => {

        // const fetchReportData = async () => {


        //     try {

        //         const params = new URLSearchParams(window.location.search);

        //         const dataParam = params.get("data");


        //         if (dataParam) {
        //             const data = JSON.parse(decodeURIComponent(dataParam));


        //             let paramsRpt = {
        //             }




        //             const print_Response = await axios.get(`${baseUrl}/schoolreports/parent-list-print`, {
        //                 params: paramsRpt
        //             });



        //             if (print_Response.data.data.length > 0) {
        //                 setIsDataFound(true);
        //             } else {
        //                 setIsDataFound(false);
        //             }



        //             const rptHeader = {
        //                 school_name: print_Response.data.data[0].school.school_name,
        //                 address: print_Response.data.data[0].school.address,
        //                 city: print_Response.data.data[0].school.city,
        //                 state: print_Response.data.data[0].school.state,
        //                 country: print_Response.data.data[0].school.country,
        //                 school_image: print_Response.data.data[0].school.school_image
        //             }

        //             setReportHeader(rptHeader);
        //             setPrintData(print_Response.data.data);
        //             setLoading(false);

        //         }



        //     } catch (error) {
        //         console.error('Error fetching marksheet for print:', error);
        //         setLoading(false);
        //         setIsDataFound(false);
        //     }
        // };

        // fetchReportData();

        downloadPDF();


    }, []);

    const downloadPDF = async () => {
        try {
            const response = await axios.post(
                `${baseUrl}/schoolreports/parent-list-print`,
                {}, // body (empty or your params)
                {
                    responseType: "blob" // ✅ CORRECT PLACE
                }
            );

            const blob = new Blob([response.data], {
                type: "application/pdf"
            });

            // const url = window.URL.createObjectURL(blob);
            // window.open(url,"_blank");
            const url = URL.createObjectURL(blob);

        setPdfUrl(url); // ✅ show in page

        } catch (error) {
            console.log(error);
        }
    };



  
    const [logo, setLogo] = useState("");

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


    const downloadExpenseExcel = () => {

        // 1️⃣ Prepare Header

        const sheetData = [];
        // sheetData.push(["Examination", "Questionpaper", "Date"]);
        sheetData.push(["Parent Name", "Gender", "DOB Date", "Admission Date", "Phone #", "Aadhar #"]);


        // 📥 Data Rows
        printData.forEach((row) => {
            sheetData.push([
                row?.name
                , row?.gender
                , dayjs(row.dOBDate).format("DD-MM-YYYY")
                , dayjs(row.joinDate).format("DD-MM-YYYY")
                , row?.phoneno
                , row?.aadhar_no
            ]);
        });




        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Parentlist");

        const date = new Date();
        // 5️⃣ Download
        XLSX.writeFile(workbook, `Parentlist_${date}.xlsx`);
    };

    // if (loading) {
    //     return <Typography>Loading...</Typography>;
    // }
    return (
        <div className="max-w-2xl mx-auto my-10">
            {/* <div className="w-full h-[500px]">

                {rows && printData.length > 0 ? (
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



            </div> */}

            <div className="w-full h-[600px]">
    {pdfUrl ? (
        <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
        />
    ) : (
        <Typography>Loading PDF...</Typography>
    )}
</div>

            {(pdfUrl && <div className="mt-6 flex justify-center gap-3">

                <PDFDownloadLink  fileName="Parentlist.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadExpenseExcel}>
                    Download Excel
                </button>


            </div>)}


        </div>
    );
}
