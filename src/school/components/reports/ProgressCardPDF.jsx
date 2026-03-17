import {
    Page,
    Text,
    View,
    Document,
    StyleSheet
} from "@react-pdf/renderer";
import { useState, useEffect } from 'react';




const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 11
    },

    header: {
        textAlign: "center",
        marginBottom: 15
    },

    title: {
        fontSize: 18,
        fontWeight: "bold"
    },

    studentRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6
    },

    table: {
        borderWidth: 1,
        borderColor: "#000",
        marginTop: 15
    },

    row: {
        flexDirection: "row"
    },

    subjectCell: {
        width: 150,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        padding: 5
    },

    cellHeader: {
        width: 55,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        padding: 5,
        textAlign: "center",
        fontWeight: "bold",
        backgroundColor: "#f2f2f2"
    },

    cell: {
        width: 55,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        padding: 5,
        textAlign: "center"
    },

    footer: {
        marginTop: 15
    },

    signatureRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 40
    }
});





export default function ProgressCardPDF({ }) {


    const [data, setData] = useState({

        school: "ABC Public School",
        address: "Hyderabad, Telangana",

        student: "Student-1",
        class: "5",
        section: "A",
        rollNo: 12,

        maxTotal: 800,
        grade: "A",

        subjects: [
            { subject: "Math", fa1: 18, fa2: 19, sa1: 78, fa3: 20, fa4: 19, sa2: 80, total: 234 },
            { subject: "Science", fa1: 17, fa2: 18, sa1: 75, fa3: 19, fa4: 18, sa2: 76, total: 223 },
            { subject: "English", fa1: 19, fa2: 20, sa1: 82, fa3: 20, fa4: 19, sa2: 85, total: 245 }
        ]
    });

    const subjects = data.subjects;

    const totalMarks = subjects.reduce(
        (sum, s) => sum + s.total,
        0
    );

    const percentage = (totalMarks / data.maxTotal * 100).toFixed(2);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* School Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{data.school}</Text>
                    <Text>{data.address}</Text>
                    <Text style={{ marginTop: 5, fontSize: 14 }}>
                        PROGRESS CARD
                    </Text>
                </View>

                {/* Student Info */}
                <View style={styles.studentRow}>
                    <Text>Student : {data.student}</Text>
                    <Text>Class : {data.class}</Text>
                </View>

                <View style={styles.studentRow}>
                    <Text>Section : {data.section}</Text>
                    <Text>Roll No : {data.rollNo}</Text>
                </View>

                {/* Table */}
                <View style={styles.table}>

                    {/* Header */}
                    <View style={styles.row} wrap={false}>
                        <Text style={styles.subjectCell}>Subject</Text>
                        <Text style={styles.cellHeader}>FA1</Text>
                        <Text style={styles.cellHeader}>FA2</Text>
                        <Text style={styles.cellHeader}>SA1</Text>
                        <Text style={styles.cellHeader}>FA3</Text>
                        <Text style={styles.cellHeader}>FA4</Text>
                        <Text style={styles.cellHeader}>SA2</Text>
                        <Text style={styles.cellHeader}>Total</Text>
                    </View>

                    {subjects.map((s, i) => (
                        <View style={styles.row} key={i} wrap={false}>
                            <Text style={styles.subjectCell}>{s.subject}</Text>
                            <Text style={styles.cell}>{s.fa1}</Text>
                            <Text style={styles.cell}>{s.fa2}</Text>
                            <Text style={styles.cell}>{s.sa1}</Text>
                            <Text style={styles.cell}>{s.fa3}</Text>
                            <Text style={styles.cell}>{s.fa4}</Text>
                            <Text style={styles.cell}>{s.sa2}</Text>
                            <Text style={styles.cell}>{s.total}</Text>
                        </View>
                    ))}

                </View>


                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Total Marks : {totalMarks}</Text>
                    <Text>Percentage : {percentage}%</Text>
                    <Text>Grade : {data.grade}</Text>
                </View>

                {/* Signatures */}
                <View style={styles.signatureRow}>
                    <Text>Class Teacher</Text>
                    <Text>Principal</Text>
                </View>

            </Page>
        </Document>
    );
}
