
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
    padding: 25,
    fontSize: 10,
    fontFamily: "Helvetica",
  },

  // 🔷 Header
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingBottom: 10,
    marginBottom: 10,
  },

  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },

  schoolInfo: {
    flex: 1,
    textAlign: "center",
  },

  schoolName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  schoolText: {
    fontSize: 10,
  },

  // 🔷 Title
  reportTitle: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 10,
    textDecoration: "underline",
  },

  // 🔷 Table
  table: {
    borderWidth: 1,
    borderColor: "#000",
  },

  tableRow: {
    flexDirection: "row",
  },

  tableHeaderCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 6,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#eaeaea",
  },

  tableCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 5,
    textAlign: "center",
  },

  // 🔷 Column widths
  colIncome: { width: "35%" },
  colAmount: { width: "15%" },
  colExpense: { width: "35%" },
  colAmount2: { width: "15%" },

  // 🔷 Footer rows
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
  },

  boldText: {
    fontWeight: "bold",
  },
});

export default function FinanceReportsPrint() {
    const [loading, setLoading] = useState(true);
    const [printData, setPrintData] = useState([]);


    const [reportHeader, setReportHeader] = useState({});
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [rows, setRows] = useState([]);
    const [date, setDate] = useState(new dayjs(Date()).format("YYYY-MM-DD"));
    const [profitLoss, setProfitLoss] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);



    const [searchParams] = useSearchParams();

    // const id = searchParams.get("id");

    const [selectedClassId, setSelectedClassId] = useState(null)
    const [selectedStudentId, setSelectedStudentId] = useState(null)
    const [selectedYear, setSelectedYear] = useState(null)
    const [isDataFound, setIsDataFound] = useState(false)



    const id = "69b1de716debb1c7d5a431ed";
    useEffect(() => {


        const params = new URLSearchParams(window.location.search);

        const dataParam = params.get("data");


        if (dataParam) {

            const data = JSON.parse(decodeURIComponent(dataParam));
            console.log("Year:", data.year);
            setSelectedYear(data.year);
        }


    }, []);


    useEffect(() => {




        const fetchPrintIncomeExpense = async () => {

            if (!selectedYear) return;

            try {

                const income_expense_Print_Response = await axios.get(`${baseUrl}/schoolreports/income-expense-print`, {
                    params: {
                        year: selectedYear
                    }
                });
                console.log("income_expense_Print_Response", income_expense_Print_Response.data.data);
                const resultData = income_expense_Print_Response.data.data;

                const incomeData = resultData.income;
                const expenseData = resultData.expense;

                console.log("incomeData", incomeData);
                console.log("subjects", expenseData);

                // const incomeData = [
                //     {
                //         incomeType: "Income-1",
                //         amount: "1000",
                //     },
                //     {
                //         incomeType: "Income-2",
                //         amount: "1000",
                //     },
                //     {
                //         incomeType: "Income-3",
                //         amount: "1000",
                //     },
                //     {
                //         incomeType: "Income-4",
                //         amount: "1000",
                //     },
                //     {
                //         incomeType: "Income-5",
                //         amount: "1000",
                //     },
                //     {
                //         incomeType: "Income-6",
                //         amount: "1000",
                //     },
                //     {
                //         incomeType: "Income-7",
                //         amount: "1000",
                //     },
                //     {
                //         incomeType: "Income-8",
                //         amount: "1000",
                //     },
                // ];


                // const expenseData = [
                //     {
                //         expenseType: "Expense-1",
                //         amount: "1000",
                //     },
                //     {
                //         expenseType: "Expense-2",
                //         amount: "1000",
                //     },
                //     {
                //         expenseType: "Expense-3",
                //         amount: "1000",
                //     },
                //     {
                //         expenseType: "Expense-4",
                //         amount: "1000",
                //     },
                //     {
                //         expenseType: "Expense-5",
                //         amount: "1000",
                //     },

                // ];

                const maxLength = Math.max(incomeData.length, expenseData.length);

                const rows = Array.from({ length: maxLength }, (_, i) => ({
                    // income: incomeData[i]?.feestructure.name + " - " + incomeData[i]?.student.name || "",
                    income: incomeData[i]
                        ? `${incomeData[i]?.feestructure?.name || ""} - ${incomeData[i]?.student?.name || ""}`
                        : "",
                    incomeAmount: incomeData[i]?.netAmount || "",
                    expense: expenseData[i]?.expensetype.expensetype_name || "",
                    expenseAmount: expenseData[i]?.expenseAmount || "",
                }));
                setRows(rows);

                if (rows.length > 0) {
                    setIsDataFound(true);
                } else {
                    setIsDataFound(false);
                }
                const totalIncome = incomeData.reduce((sum, item) => sum + Number(item.netAmount), 0);
                const totalExpense = expenseData.reduce((sum, item) => sum + Number(item.expenseAmount), 0);
                setTotalIncome(totalIncome);
                setTotalExpense(totalExpense);
                const netProfit = totalIncome - totalExpense;
                setProfitLoss(netProfit);





                const rptHeader = {
                    school_name: resultData.income[0].school.school_name,
                    address: resultData.income[0].school.address,
                    city: resultData.income[0].school.city,
                    state: resultData.income[0].school.state,
                    country: resultData.income[0].school.country,
                    school_image: resultData.income[0].school.school_image
                }

                setReportHeader(rptHeader);
                setIncomes(incomeData);
                setExpenses(expenseData);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching marksheet for print:', error);
                setLoading(false);
                setIsDataFound(false);
            }
        };

        fetchPrintIncomeExpense();



    }, [selectedYear]);


    

    const PrintPDF = () => (
  <Document>
    <Page size="A4" style={styles.page}>

      {/* 🔷 Header */}
      <View style={styles.headerContainer}>
        {/* If you have logo, uncomment */}
        <Image src={logo} style={styles.logo} />

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
        INCOME & EXPENDITURE STATEMENT
      </Text>

      {/* 🔷 Table */}
      <View style={styles.table}>

        {/* Header Row */}
        <View style={styles.tableRow}>
          <View style={[styles.tableHeaderCell, styles.colIncome]}>
            <Text>Income</Text>
          </View>

          <View style={[styles.tableHeaderCell, styles.colAmount]}>
            <Text>Amount</Text>
          </View>

          <View style={[styles.tableHeaderCell, styles.colExpense]}>
            <Text>Expense</Text>
          </View>

          <View style={[styles.tableHeaderCell, styles.colAmount2]}>
            <Text>Amount</Text>
          </View>
        </View>

        {/* Data Rows */}
        {rows.map((row, i) => (
          <View style={styles.tableRow} key={i}>
            <View style={[styles.tableCell, styles.colIncome]}>
              <Text>{row.income}</Text>
            </View>

            <View style={[styles.tableCell, styles.colAmount]}>
              <Text>{formatAmount(row.incomeAmount)}</Text>
            </View>

            <View style={[styles.tableCell, styles.colExpense]}>
              <Text>{row.expense}</Text>
            </View>

            <View style={[styles.tableCell, styles.colAmount2]}>
              <Text>{formatAmount(row.expenseAmount)}</Text>
            </View>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalRow}>
          <View style={[styles.tableCell, styles.colIncome]}>
            <Text style={styles.boldText}>Total Income</Text>
          </View>

          <View style={[styles.tableCell, styles.colAmount]}>
            <Text style={styles.boldText}>{formatAmount(totalIncome)}</Text>
          </View>

          <View style={[styles.tableCell, styles.colExpense]}>
            <Text style={styles.boldText}>Total Expense</Text>
          </View>

          <View style={[styles.tableCell, styles.colAmount2]}>
            <Text style={styles.boldText}>{formatAmount(totalExpense)}</Text>
          </View>
        </View>

        {/* Net Profit */}
        <View style={styles.totalRow}>
          <View style={[styles.tableCell, { width: "85%" }]}>
            <Text style={styles.boldText}>Net Profit / Loss</Text>
          </View>

          <View style={[styles.tableCell, { width: "15%" }]}>
            <Text style={styles.boldText}>{formatAmount(profitLoss)}</Text>
          </View>
        </View>

      </View>

    </Page>
  </Document>
);


    const [logo, setLogo] = useState("");

    useEffect(() => {
        if (reportHeader?.school_image) {
            getBase64Image(
                `${frontendUrl}/images/uploaded/school/${reportHeader.school_image}`
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


    const downloadIncomeExpenseExcel = () => {

        // 1️⃣ Prepare Header

        const sheetData = [];
        sheetData.push(["Income", "Amount", "Expense", "Amount"]);

        // 📥 Data Rows
        rows.forEach((row) => {
            sheetData.push([
                row.income || "",
                Number(row.incomeAmount || 0),
                row.expense || "",
                Number(row.expenseAmount || 0),
            ]);
        });


        // 📊 Totals
        sheetData.push([
            "Totals",
            Number(totalIncome),
            "Totals",
            Number(totalExpense),
        ]);

        // 💰 Net Profit
        sheetData.push([
            "Net Profit",
            Number(profitLoss),
            "",
            "",
        ]);



        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "IncomeExpense");

        const date = new Date();
        // 5️⃣ Download
        XLSX.writeFile(workbook, `IncomeExpense_${date}.xlsx`);
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }
    return (
        <div className="max-w-2xl mx-auto my-10">
            <div className="w-full h-[500px]">

                {rows && rows.length>0 ? (
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

                {/* <PDFViewer width="100%" height="100%">
                    <PrintPDF />
                </PDFViewer> */}

            </div>

            {(isDataFound && <div className="mt-6 flex justify-center gap-3">

                <PDFDownloadLink document={<PrintPDF />} fileName="Income-Expense.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadIncomeExpenseExcel}>
                    Download Excel
                </button>


            </div>)}
            

        </div>
    );
}
