import { Document, Page, pdfjs } from "react-pdf";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

// ✅ CORRECT worker for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const PdfViewer = () => {
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const [searchParams] = useSearchParams();
  const fileUrl = searchParams.get("fileUrl");

  useEffect(() => {
    if (!fileUrl) return;

    const loadPdf = async () => {
      try {
        const res = await fetch(fileUrl);

        if (!res.ok) {
          throw new Error("Failed to fetch PDF");
        }

        const blob = await res.blob();

        setPdfData(blob); // ✅ no need to convert to File
      } catch (err) {
        console.error("Error loading PDF:", err);
      }
    };

    loadPdf();
  }, [fileUrl]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (!fileUrl) return <p>No file available</p>;
  if (!pdfData) return <p>Loading PDF...</p>;

  return (
    <div>
      <p>{fileUrl}</p>

      <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} />
      </Document>

      <div style={{ marginTop: "10px" }}>
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((p) => p - 1)}
        >
          ⬅ Prev
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {pageNumber} of {numPages}
        </span>

        <button
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber((p) => p + 1)}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
};



export default PdfViewer;