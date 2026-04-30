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
import { Table, TD, TH, TR } from "@ag-media/react-pdf-table";
import { useSearchParams } from "react-router-dom";
import { Typography } from "@mui/material";
import axios from "axios";
import moment from "moment";
import { baseUrl, frontendUrl, formatAmount } from "../../../environment";
import { useState, useEffect, Fragment } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

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

  const [isDataFound, setIsDataFound] = useState(false);

  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const resetMessage = () => {
    setMessage("");
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const params = new URLSearchParams(window.location.search);

      const dataParam = params.get("data");

      if (dataParam) {
        const data = JSON.parse(decodeURIComponent(dataParam));

        let paramsRpt = {};
        setSelectedClass(data?.class);
        if (data?.class) {
          paramsRpt.class = data?.class;
        }
        setSelectedSection(data?.section);
        if (data?.section) {
          paramsRpt.section = data?.section;
        }

        paramsRpt.requesttype = "PDF";

        const response = await axios.post(
          `${baseUrl}/schoolreports/Parent-list-print`,
          {}, // body (empty or your params)
          {
            params: paramsRpt, // ✅ query params
            responseType: "blob", // ✅ CORRECT PLACE
          },
        );

        const blob = new Blob([response.data], {
          type: "application/pdf",
        });

        setIsDataFound(true);
        const url = URL.createObjectURL(blob);

        setPdfUrl(url); // ✅ show in page
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      setIsDataFound(false);
    }
  };

  const downloadExpenseExcel = async () => {
    

      let paramsRpt = {};

      if (selectedClass) {
        paramsRpt.class = selectedClass;
      }
      if (selectedSection) {
        paramsRpt.section = selectedSection;
      }

      paramsRpt.requesttype = "EXL";
      const reportResponse = await axios.post(
        `${baseUrl}/schoolreports/parent-list-print`,
        {}, // ✅ empty body
        {
          params: paramsRpt, // ✅ goes to req.query
        },
      );
      console.log("reportResponse", reportResponse.data.data);
      
      if (reportResponse.data.data.length===0){
            setMessage("No Data Found");
            setType("error");
            setLoading(false);
            return;
      }
      // 1️⃣ Prepare Header

      const sheetData = [];
      sheetData.push([
        "Parent Name",
        "Gender",
        "Email",
        "DOB Date",
        "Join Date",
        "Phone #",
      ]);

      // 📥 Data Rows
      reportResponse.data.data.forEach((row) => {
        sheetData.push([
          row?.name,
          row?.gender,
          row?.email,
          dayjs(row.dOBDate).format("DD-MM-YYYY"),
          dayjs(row.joinDate).format("DD-MM-YYYY"),
          row?.phoneno
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

  
 
  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  return (
    <>
    {message && (
            <CustomizedSnackbars
              reset={resetMessage}
              type={type}
              message={message}
            />
          )}
    <div className="max-w-2xl mx-auto my-10">
      <div className="w-full h-[600px]">
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#zoom=page-width`}
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : (
          <Typography>Loading PDF...</Typography>
        )}
      </div>

      {pdfUrl && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = pdfUrl;
              link.download = "Parentlist.pdf";
              link.click();
            }}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Download PDF
          </button>

          <button
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
            onClick={downloadExpenseExcel}
          >
            Download Excel
          </button>
        </div>
      )}
    </div>
    </>
  );
}
