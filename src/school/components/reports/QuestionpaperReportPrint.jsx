import {
  Page,
  Text,
  View,
  Document,
  // PDFViewer,
  pdf,
  PDFDownloadLink,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
// import { styles } from "./style";
import { Table, TD, TH, TR } from "@ag-media/react-pdf-table";
// import { tableData, totalData } from "./data";
import { useSearchParams } from "react-router-dom";
import { Typography } from "@mui/material";
import axios from "axios";
import moment from "moment";
import { baseUrl, frontendUrl, formatAmount } from "../../../environment";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
  },

  // 🔷 Header
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },

  schoolInfo: {
    flex: 1,
    textAlign: "center",
  },

  schoolName: {
    fontSize: 14,
    fontWeight: "bold",
  },

  schoolText: {
    fontSize: 10,
  },

  reportTitle: {
    textAlign: "center",
    fontSize: 14,
    marginVertical: 10,
    fontWeight: "bold",
  },

  // 🔷 Table
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
  },

  tableRow: {
    flexDirection: "row",
  },

  tableHeaderCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 6,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#f2f2f2",
  },

  tableCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 6,
  },

  // ✅ FIXED COLUMN WIDTHS
  col1: {
    width: "40%",
  },
  col2: {
    width: "35%",
  },
  col3: {
    width: "25%",
    textAlign: "right",
  },

  // 🔷 Total Row
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#eee",
  },

  boldText: {
    fontWeight: "bold",
  },
});

export default function QuestionpaperReportPrint() {
  const [loading, setLoading] = useState(true);
  const [printData, setPrintData] = useState([]);

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

  const [isDataFound, setIsDataFound] = useState(false);

  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [logo, setLogo] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const dataParam = params.get("data");

    if (dataParam) {
      const data = JSON.parse(decodeURIComponent(dataParam));
      console.log("fromDate", data.fromDate);
      setFromDate(data.fromDate);
      console.log("toDate", data.toDate);
      setToDate(data.toDate);

      setSelectedClass(data?.class);
      setSelectedSection(data?.section);
      setSelectedTeacher(data?.teacher);
      setSelectedSubject(data?.subject);
    }
  }, []);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!fromDate || !toDate) return;

      try {
        const params = {
          fromDate,
          toDate,
          ...(selectedClass && { class: selectedClass }),
          ...(selectedSection && { section: selectedSection }),
          ...(selectedTeacher && { teacher: selectedTeacher }),
          ...(selectedSubject && { subject: selectedSubject }),
        };

        const response = await axios.get(
          `${baseUrl}/schoolreports/questionpaper-print`,
          { params },
        );

        const data = response.data.data;

        if (data.length > 0) {
          setIsDataFound(true);

          const rptHeader = {
            school_name: data[0].school.school_name,
            address: data[0].school.address,
            city: data[0].school.city,
            state: data[0].school.state,
            country: data[0].school.country,
            school_image: data[0].school.school_image,
          };

          setReportHeader(rptHeader);
          setPrintData(data);
        } else {
          setIsDataFound(false);
          setPrintData([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching question paper report:", error);

        setLoading(false);
        setIsDataFound(false);
        setPrintData([]);
      }
    };

    fetchReportData();
  }, [
    fromDate,
    toDate,
    selectedClass,
    selectedSection,
    selectedTeacher,
    selectedSubject,
  ]);

  const openPDF = async () => {
    const pdfWindow = window.open("", "_blank");

    if (!pdfWindow) {
      alert("Please allow pop-ups for this website.");
      return;
    }

    try {
      const blob = await pdf(<PrintPDF />).toBlob();

      const blobUrl = URL.createObjectURL(blob);

      pdfWindow.location.href = blobUrl;

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (error) {
      pdfWindow.close();
      console.error(error);
    }
  };

  useEffect(() => {
    const generatePDF = async () => {
      if (!isDataFound) return;
      if (!printData.length) return;

      // Wait until logo is loaded if school has a logo
      if (reportHeader?.school_image && !logo) {
        return;
      }

      try {
        setPdfGenerating(true);

        const blob = await pdf(<PrintPDF />).toBlob();

        const url = URL.createObjectURL(blob);

        setPdfUrl((oldUrl) => {
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }

          return url;
        });
      } catch (error) {
        console.error("PDF generation error:", error);
      } finally {
        setPdfGenerating(false);
      }
    };

    generatePDF();

    return () => {};
  }, [printData, reportHeader, logo, isDataFound]);

  const PrintPDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 🔷 Header */}
        <View style={styles.headerContainer}>
          {/* If you have logo, uncomment */}
          <Image src={logo} style={styles.logo} />

          <View style={styles.schoolInfo}>
            <Text style={styles.schoolName}>{reportHeader?.school_name}</Text>

            <Text style={styles.schoolText}>
              {reportHeader?.address}, {reportHeader?.city}
            </Text>

            <Text style={styles.schoolText}>
              {reportHeader?.state}, {reportHeader?.country}
            </Text>
          </View>
        </View>

        {/* 🔷 Title */}
        <Text style={styles.reportTitle}>EXAM QUESTIONPAPER REPORT</Text>

        {/* 🔷 Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableHeaderCell, styles.col1]}>
              <Text>Examination</Text>
            </View>

            <View style={[styles.tableHeaderCell, styles.col2]}>
              <Text>Questionpaper</Text>
            </View>

            <View style={[styles.tableHeaderCell, styles.col3]}>
              <Text>Date</Text>
            </View>
          </View>

          {/* Rows */}
          {printData.map((row, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={[styles.tableCell, styles.col1]}>
                <Text>{row.examination.examination_name}</Text>
              </View>

              <View style={[styles.tableCell, styles.col2]}>
                <Text>{row.name}</Text>
              </View>

              <View style={[styles.tableCell, styles.col3]}>
                <Text>{dayjs(row.date).format("DD-MM-YYYY")}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );

  useEffect(() => {
    if (reportHeader?.school_image) {
      getBase64Image(`${reportHeader.school_image}`).then(setLogo);
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
    sheetData.push(["Examination", "Questionpaper", "Date"]);

    // 📥 Data Rows
    printData.forEach((row) => {
      sheetData.push([
        row?.examination?.examination_name || "",
        row?.name || "",
        dayjs(row.date).format("DD-MM-YYYY") || "",
      ]);
    });

    // 3️⃣ Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(sheetData);

    // 4️⃣ Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ExamQuestionpaper");

    const date = new Date();
    // 5️⃣ Download
    XLSX.writeFile(workbook, `ExamQuestionpaper_${date}.xlsx`);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  return (
    <div className="max-w-2xl mx-auto my-10">
      {isDataFound === true ? (
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={openPDF}
            className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-md"
          >
            Open PDF
          </button>

          <PDFDownloadLink
            document={<PrintPDF />}
            fileName="ExamQuestionpaper.pdf"
          >
            {({ loading }) => (
              <button
                disabled={loading}
                className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-md"
              >
                {loading ? "Generating PDF..." : "Download PDF"}
              </button>
            )}
          </PDFDownloadLink>

          <button
            className="flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-md"
            onClick={downloadExpenseExcel}
          >
            Download Excel
          </button>
        </div>
      ) : (
        <Typography
          variant="h4"
          sx={{
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          No Data Found
        </Typography>
      )}
    </div>
  );
}
