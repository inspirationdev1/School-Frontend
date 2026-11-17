import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Typography } from "@mui/material";
import axios from "axios";
import * as XLSX from "xlsx";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { baseUrl } from "../../../environment";

export default function PurchaseInvoiceListReportPrint() {
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [reportParams, setReportParams] = useState({});
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const [searchParams] = useSearchParams();

  const resetMessage = () => {
    setMessage("");
  };

  // ==========================================
  // FETCH PURCHASE INVOICE LIST PDF
  // ==========================================

  useEffect(() => {
    let objectUrl = null;
    let isMounted = true;

    const fetchReportData = async () => {
      try {
        setLoading(true);

        const dataParam = searchParams.get("data");

        if (!dataParam) {
          throw new Error("Report parameters not found in URL.");
        }

        // URLSearchParams already decodes the parameter.
        const data = JSON.parse(dataParam);

        if (!data || typeof data !== "object") {
          throw new Error("Invalid report parameters.");
        }

        // Pass all report filters received from InventoryReports.
        const paramsRpt = {
          ...data,
          requesttype: "PDF",
        };

        // Save parameters for Excel download.
        if (isMounted) {
          setReportParams(data);
        }

        const response = await axios.post(
          `${baseUrl}/schoolreports/purchaseinvoice-list-print`,
          {},
          {
            params: paramsRpt,
            responseType: "blob",
          },
        );

        const blob = response.data;

        if (!(blob instanceof Blob) || blob.size === 0) {
          throw new Error("The server returned an empty PDF.");
        }

        // Verify that the server actually returned a PDF.
        const signature = await blob.slice(0, 5).text();

        if (signature !== "%PDF-") {
          const errorText = await blob.text();

          let errorMessage = "The server did not return a valid PDF.";

          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            if (errorText) {
              errorMessage = errorText.substring(0, 300);
            }
          }

          throw new Error(errorMessage);
        }

        objectUrl = URL.createObjectURL(blob);

        if (isMounted) {
          setPdfUrl(objectUrl);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Purchase Invoice List PDF Error:",
          error.response || error,
        );

        if (isMounted) {
          setLoading(false);
          setPdfUrl(null);
          setMessage(
            error.message || "Unable to generate Purchase Invoice Report.",
          );
          setType("error");
        }
      }
    };

    fetchReportData();

    return () => {
      isMounted = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [searchParams]);

  // ==========================================
  // DOWNLOAD PDF
  // ==========================================

  const downloadPDF = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "PurchaseInvoiceListReport.pdf";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // DOWNLOAD EXCEL
  // ==========================================

  const downloadReportExcel = async () => {
    try {
      setLoading(true);

      const paramsRpt = {
        ...reportParams,
        requesttype: "EXL",
      };

      const reportResponse = await axios.post(
        `${baseUrl}/schoolreports/purchaseinvoice-list-print`,
        {},
        {
          params: paramsRpt,
        },
      );

      console.log("Purchase Invoice Excel Response:", reportResponse.data);

      const reportData = reportResponse.data?.data;

      if (!Array.isArray(reportData) || reportData.length === 0) {
        setMessage("No Purchase Invoice Data Found.");
        setType("error");
        return;
      }

      // Prepare Excel data.
      const sheetData = [["Purchase Invoice Code", "Purchase Invoice Date"]];

      reportData.forEach((row) => {
        sheetData.push([row?.piCode || "", row?.invoiceDate || ""]);
      });

      // Create worksheet.
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

      // Set column widths.
      worksheet["!cols"] = [{ wch: 25 }, { wch: 25 }];

      // Create workbook.
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "PurchaseInvoiceList");

      // Download Excel.
      const date = new Date().toISOString().slice(0, 10);

      XLSX.writeFile(workbook, `PurchaseInvoiceList_${date}.xlsx`);
    } catch (error) {
      console.error("Purchase Invoice Excel Error:", error);

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to download Excel report.",
      );

      setType("error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[300px]">
        <Typography variant="h6">
          Generating Purchase Invoice Report...
        </Typography>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <>
      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      <div className="w-full max-w-none mx-0 my-2">
        {/* PDF VIEWER */}

        <div className="w-full h-[calc(100vh-180px)] min-h-[500px]">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#zoom=page-width`}
              title="Purchase Invoice List Report"
              width="100%"
              height="100%"
              style={{
                border: "none",
              }}
            />
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <Typography color="error">
                Purchase Invoice PDF could not be generated.
              </Typography>
            </div>
          )}
        </div>

        {/* DOWNLOAD BUTTONS */}

        {pdfUrl && (
          <div className="mt-4 mb-4 flex justify-center gap-3">
            <button
              onClick={downloadPDF}
              className="flex items-center bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Download PDF
            </button>

            <button
              onClick={downloadReportExcel}
              className="flex items-center bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition duration-300"
            >
              Download Excel
            </button>
          </div>
        )}
      </div>
    </>
  );
}
