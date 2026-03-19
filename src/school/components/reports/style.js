import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({

  page: {
    padding: 30,
    fontSize: 11
  },

  // header: {
  //   textAlign: "center",
  //   marginBottom: 15
  // },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,

  },

  leftHeader: {
    width: "40%"
  },

  rightHeader: {
    width: "60%",
    textAlign: "right"
  },

  // centerHeader: {
  //   width: "200%",
  //   textAlign: "center"
  // },
  centerHeader: {
    flex: 1,
    alignItems: "center"
  },


  schoolText: {
    fontSize: 11,
    marginBottom: 3
  },

  title: {
    fontSize: 18,
    fontWeight: "bold"
  },

  rowStyle: {
    flexDirection: "row",
    marginBottom: 6
  },

  labelStyle: {
    width: 80,
    fontWeight: "bold"
  },

  valueStyle: {
    width: 150
  },

  table: {
    borderWidth: 1,
    marginTop: 15
  },

  row: {
    flexDirection: "row"
  },

  cellHeader: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#f2f2f2"
  },

  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    padding: 5,
    fontSize: 10,
    textAlign: "center"
  },
  // spaceY: {
  //   display: "flex",
  //   flexDirection: "column",
  //   gap: "2px",
  // },
  spaceY: {
    flexDirection: "column",
  },
  child: {
    marginBottom: 2
  },

  billTo: {
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50
  }
});

