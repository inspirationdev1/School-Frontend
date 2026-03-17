
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
import { baseUrl, frontendUrl } from '../../../environment';
import { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";


export default function SchoolReportsPrint() {
    const [loading, setLoading] = useState(true);
    const [printData, setPrintData] = useState([]);


    const [reportHeader, setReportHeader] = useState({});
    const [examNames, setExamNames] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [date, setDate] = useState(new dayjs(Date()).format("YYYY-MM-DD"));



    const [searchParams] = useSearchParams();

    // const id = searchParams.get("id");

    const [selectedClassId, setSelectedClassId] = useState(null)
    const [selectedStudentId, setSelectedStudentId] = useState(null)


    const transformMarksheetData_Old = (data) => {

        const subjects = {};
        const exams = new Set();

        data.forEach(item => {
            const subject = item.subject.subject_name || item.subject;
            const exam = item.examination.examination_name || item.examination;

            exams.add(exam);

            if (!subjects[subject]) {
                subjects[subject] = {};
            }

            subjects[subject][exam] = {
                marks: item.marksheetDetails[0]?.marks || 0,
                marksLimit: item.marksheetDetails[0]?.marksLimit || 0
            };
        });

        return {
            exams: Array.from(exams),
            subjects
        };
    };

    const transformMarksheetData_Old_1 = (data) => {

        const subjects = {};
        const exams = new Set();

        data.forEach(item => {
            const subject = item.subject.subject_name || item.subject;
            const exam = item.examination.examination_name || item.examination;

            exams.add(exam);

            if (!subjects[subject]) {
                subjects[subject] = {};
            }

            subjects[subject][exam] = {
                marks: item?.marks || 0,
                marksLimit: item?.marksLimit || 0
            };
        });

        return {
            exams: Array.from(exams),
            subjects
        };
    };

    const transformMarksheetData = (data) => {

        const subjects = {};
        const exams = new Set();

        data.forEach(item => {
            const subject = item.subject.subject_name || item.subject;
            const exam = item.examination.name || item.examination;

            exams.add(exam);

            if (!subjects[subject]) {
                subjects[subject] = {};
            }

            subjects[subject][exam] = {
                marks: item?.marks || 0,
                marksLimit: item?.marksLimit || 0
            };
        });

        return {
            exams: Array.from(exams),
            subjects
        };
    };

    const id = "69b1de716debb1c7d5a431ed";
    useEffect(() => {


        const params = new URLSearchParams(window.location.search);

        const dataParam = params.get("data");


        if (dataParam) {

            const data = JSON.parse(decodeURIComponent(dataParam));

            // console.log("Class:", data.class);
            console.log("Student:", data.student);
            // setSelectedClassId(data.class);
            setSelectedStudentId(data.student);
        }



        // const tableData = transformMarksheetData(testData);

        // const examNames = tableData.exams;
        // const subjects = tableData.subjects;

        // console.log("examNames", examNames);
        // console.log("subjects", subjects);
        // setExamNames(examNames);
        // setSubjects(subjects);


    }, []);


    useEffect(() => {




        const fetchPrintMarksheet = async () => {

            if (!selectedStudentId) return;

            try {


                if (selectedStudentId) {
                    const marksheetPrintResponse = await axios.get(`${baseUrl}/schoolreports/progresscard-print`, {
                        params: {
                            student: selectedStudentId
                        }
                    });
                    console.log("marksheetPrintResponse", marksheetPrintResponse.data.data);
                    const tableData = transformMarksheetData(marksheetPrintResponse.data.data);

                    const examNames = tableData.exams;
                    const subjects = tableData.subjects;

                    console.log("examNames", tableData.exams);
                    console.log("subjects", tableData.subjects);


                    console.log(reportHeader.school_image);
                    const rptHeader = {
                        school_name: marksheetPrintResponse.data.data[0].school.school_name,
                        address: marksheetPrintResponse.data.data[0].school.address,
                        city: marksheetPrintResponse.data.data[0].school.city,
                        state: marksheetPrintResponse.data.data[0].school.state,
                        country: marksheetPrintResponse.data.data[0].school.country,
                        class: marksheetPrintResponse.data.data[0].class.class_text,
                        section: marksheetPrintResponse.data.data[0].section.section_name,
                        student: marksheetPrintResponse.data.data[0].student.name,
                        school_image: marksheetPrintResponse.data.data[0].school.school_image
                    }

                    setReportHeader(rptHeader);



                    setExamNames(tableData.exams);
                    setSubjects(tableData.subjects);
                    // setPrintData(marksheetPrintResponse.data.data);
                    // console.log("printData", printData);
                }



                setLoading(false);
            } catch (error) {
                console.error('Error fetching marksheet for print:', error);
            }
        };

        fetchPrintMarksheet();



    }, [selectedStudentId]);

    // url(/images/uploaded/school/${reportHeader.school_image})
    //  src={`./images/uploaded/school/${reportHeader.school_image}?w=248&fit=crop&auto=format`}
    // src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
    const PrintPDF = () => (

        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>


                <View style={styles.header}>
                    <View style={styles.leftHeader}>
                        <Image
                            src={`${frontendUrl}/images/uploaded/school/${reportHeader?.school_image}?w=248&fit=crop&auto=format`}
                            style={{ width: 100, height: 100 }}
                        />
                    </View>
                    <View style={styles.centerHeader}>
                        <Text style={[styles.title, styles.textBold]}>Progress Card</Text>
                    </View>


                    {/* Right Side */}
                    <View style={styles.rightHeader}>
                        <Text style={[styles.schoolText, styles.textBold]}>
                            {reportHeader.school_name}
                        </Text>

                        <Text style={styles.schoolText}>
                            {reportHeader.address} - {reportHeader.city}
                        </Text>

                        <Text style={styles.schoolText}>
                            {reportHeader.state} - {reportHeader.country}
                        </Text>
                    </View>



                </View>


                <View>




                    <View style={styles.rowStyle}>

                        <Text style={styles.labelStyle}>Class :</Text>
                        <Text style={styles.valueStyle}>
                            {reportHeader.class}
                        </Text>

                        <Text style={styles.labelStyle}>Section :</Text>
                        <Text style={styles.valueStyle}>
                            {reportHeader.section}
                        </Text>
                    </View>

                    <View style={styles.rowStyle}>
                        <Text style={styles.labelStyle}>Student :</Text>
                        <Text style={styles.valueStyle}>
                            {reportHeader.student}
                        </Text>


                    </View>





                </View>

                <View style={styles.table}>

                    {/* Header Row 1 */}
                    <View style={styles.row}>
                        <Text style={[styles.cellHeader, { width: 150 }]}>Subjects</Text>

                        {examNames.map((exam, i) => (
                            <Text key={i} style={[styles.cellHeader, { width: 110 }]}>
                                {exam}
                            </Text>
                        ))}
                    </View>

                    {/* Header Row 2 */}
                    <View style={styles.row}>
                        <Text style={[styles.cellHeader, { width: 150 }]}></Text>

                        {examNames.map((exam, i) => (
                            <View key={i} style={{ flexDirection: "row" }}>
                                <Text style={[styles.cellHeader, { width: 55 }]}>Marks</Text>
                                <Text style={[styles.cellHeader, { width: 55 }]}>Limit</Text>
                            </View>
                        ))}
                    </View>

                    {/* Subjects */}
                    {Object.keys(subjects).map((subject, index) => (
                        <View key={index} style={styles.row} wrap={false}>

                            <Text style={[styles.cell, { width: 150 }]}>
                                {subject}
                            </Text>

                            {examNames.map((exam, i) => {
                                const examData = subjects[subject][exam] || {};

                                return (
                                    <View key={i} style={{ flexDirection: "row" }}>
                                        <Text style={[styles.cell, { width: 55 }]}>
                                            {examData.marks || "-"}
                                        </Text>

                                        <Text style={[styles.cell, { width: 55 }]}>
                                            {examData.marksLimit || "-"}
                                        </Text>
                                    </View>
                                );
                            })}

                        </View>
                    ))}

                </View>

            </Page>
        </Document>
    );

    const downloadMarksheetExcel = () => {
        // 1️⃣ Prepare row data


        const rows = [];

        // Header Row
        const header = ["Subjects"];

        examNames.forEach(exam => {
            header.push(`${exam} Marks`);
            header.push(`${exam} Limit`);
        });

        rows.push(header);

        // Subject rows
        Object.keys(subjects).forEach(subject => {

            const row = [subject];

            examNames.forEach(exam => {

                const examData = subjects[subject][exam] || {};

                row.push(examData.marks || "-");
                row.push(examData.marksLimit || "-");

            });

            rows.push(row);

        });



        // 3️⃣ Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(rows);

        // 4️⃣ Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Progress-Card");

        // 5️⃣ Download
        XLSX.writeFile(workbook, `Progress-Card_${date}.xlsx`);
    };

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

                <PDFDownloadLink document={<PrintPDF />} fileName="Progress-Card.pdf">
                    <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                        Download PDF
                    </button>
                </PDFDownloadLink>


                <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300" onClick={downloadMarksheetExcel}>
                    Download Excel
                </button>


            </div>
        </div>
    );
}
