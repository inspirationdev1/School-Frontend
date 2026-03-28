// import React from "react";
// import {
//     Page,
//     Text,
//     View,
//     Document,
//     PDFViewer,
//     PDFDownloadLink,
// } from "@react-pdf/renderer";
// // import { styles } from "./style";
// import { Table, TD, TH, TR } from "@ag-media/react-pdf-table";
// import { useSearchParams } from "react-router-dom";
// import { Typography } from '@mui/material';
// import axios from 'axios';
// import moment from 'moment';
// import { baseUrl, frontendUrl, formatAmount } from '../../../environment';
// import { useState, useEffect } from 'react';
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import dayjs from "dayjs";



// const PdfViewer = () => {

//     const [searchParams] = useSearchParams();

//     const fileUrl = searchParams.get("fileUrl");

//   if (!fileUrl) return <p>No file available</p>;
 

//   const isPdf = fileUrl.toLowerCase().endsWith(".pdf");

//   const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
//     fileUrl
//   )}&embedded=true`;

//   return (
//     <div style={{ width: "100%", height: "100%" }}>
      
//       {/* Toolbar */}
//       <div style={{ marginBottom: "10px" }}>
//         <button onClick={() => window.open(fileUrl, "_blank")}>
//           Open in New Tab
//         </button>

//         <button
//           onClick={() =>
//             window.open(
//               fileUrl.replace("/upload/", "/upload/fl_attachment/"),
//               "_blank"
//             )
//           }
//           style={{ marginLeft: "10px" }}
//         >
//           Download
//         </button>
//       </div>

//       {/* Viewer */}
//       {isPdf ? (
//         <iframe
//           src={googleViewerUrl}
//           width="100%"
//           height="600px"
//           title="PDF Viewer"
//           style={{ border: "1px solid #ccc" }}
//         />
//       ) : (
//         <img
//           src={fileUrl}
//           alt="preview"
//           style={{ maxWidth: "100%", maxHeight: "600px" }}
//         />
//       )}
//     </div>
//   );
// };

// export default PdfViewer;


// import { Document, Page, pdfjs } from "react-pdf";

import { Document, Page } from "@react-pdf/renderer";
import { useSearchParams } from "react-router-dom";

import { useState } from "react";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = () => {

        const [searchParams] = useSearchParams();

    const fileUrl = searchParams.get("fileUrl");

  if (!fileUrl) return <p>No file available</p>;


  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div>
      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} />
      </Document>

      <div style={{ marginTop: "10px" }}>
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          ⬅ Prev
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {pageNumber} of {numPages}
        </span>

        <button
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default PdfViewer;