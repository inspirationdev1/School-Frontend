import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    color: "#262626",
    fontFamily: "Helvetica",
    fontSize: "12px",
    padding: "30px 50px",
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
  },
  textBold: {
    fontFamily: "Helvetica-Bold",
  },
  spaceY: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  billTo: {
    marginBottom: 10,
  },
  table: {
    width: "100%",
    borderColor: "1px solid #f3f4f6",
    margin: "20px 0",
  },
  tableHeader: {
    backgroundColor: "#e5e5e5",
  },
  td: {
    padding: 5,
    // fontSize: 9,
    // justifyContent: "center",
  },
  totals: {
    display: "flex",
    alignItems: "flex-end",
  },
  rowStyle: {
    flexDirection: "row",
    marginBottom: 6,
  },
  labelStyle: {
    width: "20%",
    fontWeight: "bold",
  },
  valueStyle: {
    width: "30%",
  },
  rightText: {
    width: "100%",       // 🔥 REQUIRED
    textAlign: "right",  // 🔥 NOW it works
  },
});
