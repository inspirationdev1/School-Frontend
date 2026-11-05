import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
  Select,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Autocomplete,
  Tabs,
  Tab,
} from "@mui/material";
// import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem, Alert, FormControl, InputLabel, Autocomplete, TextField, Box } from '@mui/material';
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { receiptSchema } from "../../../yupSchema/receiptSchema";

// import { AuthContext } from '../../../context/AuthContext';
import { AuthContext } from "../../../context/AuthContext";
import { useSearchParams } from "react-router-dom";

const Razorpay = () => {
  const [searchParams] = useSearchParams();

  const studentId = searchParams.get("studentId");
  const amount1 = searchParams.get("amount");
  const studentName = searchParams.get("studentName");
  //   MESSAGE
  const [message, setMessage] = useState("");
  const [type, setType] = useState("succeess");

  const [appsettings, setAppsettings] = useState([]);
  const [selectedAppsetting, setSelectedAppsetting] = useState(null);

  const resetMessage = () => {
    setMessage("");
  };

  const initialValues = {
    receiptCode: "",
    receiptDate: "",
    receiptNumber: "",
    receiptTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    paymentMethod: "",
    status: "valid",
    remarks: "",
    year: "",
    academicyear: "",
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: receiptSchema,
    onSubmit: async (values) => {
      

      

      
      

      setIsDataValid(true);

      const payload = {
        ...values,
        student_name: student_name,
        paidAmount: paidAmount,
        receiptDetails: receiptDetails.map((row) => ({
          class: row.class,
          section: row.section,
          student: row.student._id,
          parent: row.parent,
          siId: row.siId._id,
          siCode: row.siId.siCode,
          invAmount: row.invAmount,
          paidAmount: row.paidAmount,
          remarks: "",
          year: values.year,
          month: row?.month,
          monthname: row?.monthname,
        })),
      };
      if (isEdit) {
        console.log("edit id", editId);

        axios
          .patch(`${baseUrl}/receipt/update/${editId}`, payload)
          .then((resp) => {
            console.log("Edit submit", resp);
            setMessage(resp.data.message);
            setType("success");
            clearForm();
            cancelEdit();
            setTab(1); // go to View List
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, edit casting submit", e);
          });
      } else {
        if (
          selectedAppsetting?.RAZORPAY_KEY_ID &&
          values?.paymentMethod != "cash"
        ) {
          axios
            .post(`${baseUrl}/receipt/razororder`, payload)
            .then((respOrder) => {
              console.log("Response after submitting admin casting", respOrder);
              payload.order_id = respOrder.data?.data?.id ?? null;
              payload.payment_id = respOrder.data?.data?.id ?? null;

              var options = {
                key: respOrder.data?.data?.RAZORPAY_KEY_ID, //"rzp_test_TtDwiBiRGLDzbB", // Enter the Key ID generated from the Dashboard
                amount: payload.paidAmount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                currency: "INR",
                name: "Acme Corp", //your business name
                description: "Test Transaction",
                image: "https://example.com/your_logo",
                order_id: payload.order_id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
                handler: async function (response) {
                  const body = {
                    ...response,
                  };

                  axios
                    .post(`${baseUrl}/receipt/razorvalidate`, body)
                    .then((validateRes) => {
                      console.log(
                        "Response after submitting admin casting",
                        validateRes,
                      );
                      payload.order_id = validateRes?.data?.orderId ?? null;
                      payload.payment_id = validateRes?.data?.paymentId ?? null;

                      axios
                        .post(`${baseUrl}/receipt/create`, payload)
                        .then((resp) => {
                          console.log(
                            "Response after submitting admin casting",
                            resp,
                          );
                          clearForm();
                          cancelEdit();
                          setMessage(resp.data.message);
                          setType("success");
                        })
                        .catch((e) => {
                          setMessage(e.response.data.message);
                          setType("error");
                          console.log("Error, response admin casting calls", e);
                        });
                    })
                    .catch((e) => {
                      setMessage(e.response.data.message);
                      setType("error");
                      console.log("Error, response admin casting calls", e);
                    });
                },
                prefill: {
                  //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
                  name: "Web Dev Matrix", //your customer's name
                  email: "webdevmatrix@example.com",
                  contact: "9000000000", //Provide the customer's phone number for better conversion rates
                },
                notes: {
                  address: "Razorpay Corporate Office",
                },
                theme: {
                  color: "#3399cc",
                },
              };
              var rzp1 = new window.Razorpay(options);
              rzp1.on("payment.failed", function (response) {
                alert(response.error.code);
                alert(response.error.description);
                alert(response.error.source);
                alert(response.error.step);
                alert(response.error.reason);
                alert(response.error.metadata.order_id);
                alert(response.error.metadata.payment_id);
              });
              rzp1.open();
              // e.preventDefault();
            })
            .catch((e) => {
              setMessage(e.response.data.message);
              setType("error");
              console.log("Error, response admin casting calls", e);
            });
        } else {
          //Cash is selected or RAZORPAY_KEY_ID is not set
          axios
            .post(`${baseUrl}/receipt/create`, payload)
            .then((resp) => {
              console.log("Response after submitting admin casting", resp);
              clearForm();
              cancelEdit();
              setMessage(resp.data.message);
              setType("success");
            })
            .catch((e) => {
              setMessage(e.response.data.message);
              setType("error");
              console.log("Error, response admin casting calls", e);
            });
        }

        
      }
    },
  });
  const amount = 500;
  const currency = "INR";
  const receiptId = "qwsaq1";

  const paymentHandler = async (e) => {
    const response = await fetch("http://localhost:5001/order", {
      method: "POST",
      body: JSON.stringify({
        amount,
        currency,
        receipt: receiptId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const order = await response.json();
    console.log(order);

    var options = {
      key: "rzp_test_TtDwiBiRGLDzbB", // Enter the Key ID generated from the Dashboard
      amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency,
      name: "Acme Corp", //your business name
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: async function (response) {
        const body = {
          ...response,
        };

        const validateRes = await fetch(
          "http://localhost:5001/order/validate",
          {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const jsonRes = await validateRes.json();
        console.log(jsonRes);
      },
      prefill: {
        //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
        name: "Web Dev Matrix", //your customer's name
        email: "webdevmatrix@example.com",
        contact: "9000000000", //Provide the customer's phone number for better conversion rates
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };
    var rzp1 = new window.Razorpay(options);
    rzp1.on("payment.failed", function (response) {
      alert(response.error.code);
      alert(response.error.description);
      alert(response.error.source);
      alert(response.error.step);
      alert(response.error.reason);
      alert(response.error.metadata.order_id);
      alert(response.error.metadata.payment_id);
    });
    rzp1.open();
    e.preventDefault();
  };

  const fetchAppsettings = () => {
    axios
      .get(`${baseUrl}/appsetting/fetch-all`)
      .then((resp) => {
        console.log("Fetching data in  Casting Calls  admin.", resp);
        setAppsettings(resp.data.data);
        const id = resp.data.data[0]._id;
        setSelectedAppsetting(resp.data.data[0]);
        console.log("selectedAppseting", selectedAppsetting);
      })
      .catch((e) => {
        console.log("Error in fetching casting calls admin data", e);
      });
  };

  useEffect(() => {
    fetchAppsettings();
  }, [message]);

  return (
    <>
      <div>
        <h2>Razorpay Payment</h2>

        <p>Student ID: {studentId}</p>
        <p>Amount: ₹{amount}</p>
        <p>Student Name: {studentName}</p>
      </div>
      {/* <div className="product">
        <h2>Tshirt</h2>
        <p>Solid blue cotton Tshirt</p>
        <img src={TshirtImg} /> 
        <br />
        <button onClick={paymentHandler}>Pay</button>
      </div> */}
    </>
  );
};

export default Razorpay;
