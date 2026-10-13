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
import { Typography } from "@mui/material";
import axios from "axios";
import moment from "moment";
import { baseUrl } from "../../../environment";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

export default function ClasssubjectPrint() {
  const [loading, setLoading] = useState(true);
  const [printClasssubject, setPrintClasssubject] = useState({});
  const [logo, setLogo] = useState("");
  const [reportHeader, setReportHeader] = useState({});

  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");

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

  useEffect(() => {
    const fetchPrintClasssubject = async () => {
      try {
        const classsubjectPrintResponse = await axios.get(
          `${baseUrl}/classsubject/fetch-print/${id}`,
          { params: { id: id } },
        );
        console.log("classsubjectPrintResponse", classsubjectPrintResponse.data.data);
        setPrintClasssubject(classsubjectPrintResponse.data.data);
        console.log("printClasssubject", printClasssubject);

        const rptHeader = {
          school_name: classsubjectPrintResponse.data.data?.school.school_name,
          address: classsubjectPrintResponse.data.data?.school.address,
          city: classsubjectPrintResponse.data.data?.school.city,
          state: classsubjectPrintResponse.data.data?.school.state,
          country: classsubjectPrintResponse.data.data?.school.country,
          school_image: classsubjectPrintResponse.data.data?.school.school_image,
        };

        setReportHeader(rptHeader);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching classsubject for print:", error);
      }
    };

    fetchPrintClasssubject();
  }, []);

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
        <Text style={styles.reportTitle}>CLASS SUBJECT</Text>
        {/* <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, styles.textBold]}>Classsubject</Text>

                    </View>
                    <View style={styles.spaceY}>
                        <Text style={styles.textBold}>{printClasssubject.school.school_name}</Text>
                        <Text style={styles.textBold}>{printClasssubject.school.address} - {printClasssubject.school.city}</Text>
                        <Text style={styles.textBold}>{printClasssubject.school.state} - {printClasssubject.school.country}</Text>

                    </View>
                </View> */}

        <View>
          {/* Row 1 */}
          <View style={styles.rowStyle}>
            <Text style={styles.labelStyle}>MS # :</Text>
            <Text style={styles.valueStyle}>{printClasssubject.msCode}</Text>

            <Text style={styles.labelStyle}>MS Date :</Text>
            <Text style={styles.valueStyle}>
              {dayjs(printClasssubject.msDate).format("DD/MM/YYYY")}
            </Text>
          </View>

          {/* Row 2 */}
          <View style={styles.rowStyle}>
            <Text style={styles.labelStyle}>Class :</Text>
            <Text style={styles.valueStyle}>
              {printClasssubject.class.class_name}
            </Text>

            <Text style={styles.labelStyle}>Section :</Text>
            <Text style={styles.valueStyle}>
              {printClasssubject.section.section_name}
            </Text>
          </View>

          {/* Row 3 */}
          <View style={styles.rowStyle}>
            <Text style={styles.labelStyle}>Teacher :</Text>
            <Text style={styles.valueStyle}>{printClasssubject.teacher.name}</Text>

            <Text style={styles.labelStyle}>Subject :</Text>
            <Text style={styles.valueStyle}>
              {printClasssubject.subject.subject_name}
            </Text>
          </View>

          {/* Row 4 */}
          <View style={styles.rowStyle}>
            <Text style={styles.labelStyle}>Examination :</Text>
            <Text style={styles.valueStyle}>
              {printClasssubject.examination.examination_name}
            </Text>

            <Text style={styles.labelStyle}>Questionpaper :</Text>
            <Text style={styles.valueStyle}>
              {printClasssubject.questionpaper.name}
            </Text>
          </View>

          {/* Row 5 */}
          <View style={styles.rowStyle}>
            <Text style={styles.labelStyle}>Status :</Text>
            <Text style={styles.valueStyle}>{printClasssubject.status}</Text>
            <Text style={styles.labelStyle}>Remarks :</Text>
            <Text style={styles.valueStyle}>{printClasssubject.remarks}</Text>
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

          {printClasssubject.classsubjectDetails.map((item, index) => (
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

  const downloadClasssubjectExcel = () => {
    // 1️⃣ Prepare row data
    const rows = printClasssubject.classsubjectDetails.map((item, index) => ({
      "S.No": index + 1,
      Student: item.student.name,
      marksLimit: item.marksLimit,
      marks: item.marks,
    }));

    // 3️⃣ Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // 4️⃣ Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Classsubject");

    // 5️⃣ Download
    XLSX.writeFile(workbook, `Classsubject_${printClasssubject.msDate}.xlsx`);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  return (
    <div className="flex-1 w-full">
      <div className="w-full h-[500px]">
        <PDFViewer width="100%" height="100%">
          <PrintPDF />
        </PDFViewer>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <PDFDownloadLink document={<PrintPDF />} fileName="classsubject.pdf">
          <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
            Download PDF
          </button>
        </PDFDownloadLink>

        {/* <button
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          onClick={downloadClasssubjectExcel}
        >
          Download Excel
        </button> */}
      </div>
    </div>
  );
}
