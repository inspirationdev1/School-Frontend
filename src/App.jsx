/* eslint-disable react/no-children-prop */
import("./css/button.css");
import("./css/text.css");

import "./App.css";
import { BrowserRouter, Route, Routes, useSearchParams } from "react-router-dom";

import Client from "./client/Client";
import Home from "./client/components/home/Home";
import Contact from "./client/components/contact/Contact";
import Login from "./client/components/login/Login";
import Register from "./client/components/register/Register";

import Logout from "./client/components/logout/Logout";
import School from "./school/School";
import SchoolDashboard from "./school/components/dashboard/SchoolDashboard";
import UserDashboard from "./user/components/dashboard/UserDashboard";
import Class from "./school/components/class/Class";
import Students from "./school/components/students/Students";
import Teachers from "./school/components/teachers/Teachers";
import Employees from "./school/components/employees/Employees";
import Parents from "./school/components/parents/Parents";
import Users from "./school/components/users/Users";
import Subject from "./school/components/subjects/Subjects";
import Section from "./school/components/sections/Sections";
import Department from "./school/components/departments/Departments";
import Feestype from "./school/components/feestypes/Feestypes";
import Feestructure from "./school/components/feestructures/Feestructures";
import Examtype from "./school/components/examtypes/Examtypes";
import Salesinvoice from "./school/components/salesinvoices/Salesinvoices";
import SalesinvoicePrint from './school/components/salesinvoices/SalesinvoicePrint';
import Receipts from "./school/components/receipts/Receipts";
import ReceiptPrint from './school/components/receipts/ReceiptPrint';
import Expensetypes from "./school/components/expensetypes/Expensetypes";
import Expenses from "./school/components/expenses/Expenses";

import Marksheet from "./school/components/marksheets/Marksheets";
import MarksheetPrint from './school/components/marksheets/MarksheetPrint';

import ClassDetails from "./school/components/class details/ClassDetails";
import StudentDetails from "./student/components/student details/StudentDetails";
import Student from "./student/Student";
import Menu from "./school/components/menu/Menu";
import Role from "./school/components/role/Role";
import Screen from "./school/components/screen/Screen";

import Numberseq from "./school/components/numberseqs/Numberseqs";

import ParentDetails from "./parent/components/parent details/ParentDetails";
import Parent from "./parent/Parent";

import UserDetails from "./user/components/user details/UserDetails";
import User from "./user/User";


import StudentExaminations from "./student/components/examination/StudentExaminations";
import Teacher from "./teacher/Teacher";
import TeacherDetails from "./teacher/components/teacher details/TeacherDetails";
import TeacherExaminations from "./teacher/components/teacher examinations/TeacherExaminations";
import TeacherSchedule from "./teacher/components/periods/TeacherSchedule";
import AssignPeriod2 from "./school/components/assign period/AssignPeriod2";
import AttendanceDetails from "./school/components/attendance/attendance details/AttendanceDetails";
import StudentAttendanceList from "./school/components/attendance/StudentAttendanceList";
import Schedule from "./school/components/periods/Schedule";
import Examinations from "./school/components/examinations/Examinations";
import Questionpapers from "./school/components/questionpapers/Questionpapers";
import AttendanceTeacher from "./teacher/components/attendance/AttendanceTeacher";
import Invoice2 from './teacher/components/attendance/invoice';
import AttendancePrint from './teacher/components/attendance/AttendancePrint'
import AttendanceStudent from "./student/components/attendance/AttendanceStudent";
import AttendanceParent from "./parent/components/attendance/AttendanceParent";
import ScheduleStudent from "./student/components/schedule/ScheduleStudent";
import NoticeSchool from "./school/components/notice/NoticeSchool";
import NoticeTeacher from "./teacher/components/notice/Notice";
import NoticeStudent from "./student/components/notice/NoticeStudent";
import ProtectedRoute from "./guards/ProtectedRoute";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "@emotion/react";
import darkTheme from "./basic utility components/darkTheme";
import lightTheme from "./basic utility components/lightTheme";
import ThemeToggleButton from "./basic utility components/ThemeToggleButton";
import { useContext, useEffect, useState } from "react";
import ParentExaminations from "./parent/components/examination/ParentExaminations";
import ScheduleParent from "./parent/components/schedule/ScheduleParent";
import NoticeParent from "./parent/components/notice/NoticeParent";
import SchoolReports from "./school/components/reports/SchoolReports";
import SchoolReportsPrint from "./school/components/reports/SchoolReportsPrint";
import ProgressCardPDF from "./school/components/reports/ProgressCardPDF";
import ExpensePrint from "./school/components/expenses/ExpensePrint";
import FinanceReports from "./school/components/reports/FinanceReports";
import FinanceReportsPrint from "./school/components/reports/FinanceReportsPrint";
import ExpenseReportPrint from "./school/components/reports/ExpenseReportPrint";
import IncomeReportPrint from "./school/components/reports/IncomeReportPrint";
import StudentReports from "./school/components/reports/StudentReports";
import AttendanceReportPrint from "./school/components/reports/AttendanceReportPrint";
import PendingFeesReportPrint from "./school/components/reports/PendingFeesReportPrint";
import PaidFeesReportPrint from "./school/components/reports/PaidFeesReportPrint";
import Payments from "./school/components/payments/Payments";
import PaymentPrint from "./school/components/payments/PaymentPrint";
import PendingExpensesReportPrint from "./school/components/reports/PendingExpensesReportPrint";
import PaidExpensesReportPrint from "./school/components/reports/PaidExpensesReportPrint";
import Numberseqs from "./school/components/numberseqs/Numberseqs";




function App() {
  const { authenticated, login, themeDark } = useContext(AuthContext);

  return (
    <>
      <ThemeProvider theme={themeDark ? darkTheme : lightTheme}>
        <ThemeToggleButton />
        <BrowserRouter>
          <Routes>

            <Route path="school" element={<ProtectedRoute allowedRoles={['SCHOOL','USER']}><School /></ProtectedRoute>}>
              <Route index element={<SchoolDashboard />} />
              <Route path="class" element={<Class />} />
              <Route path="class-details" element={<ClassDetails />} />
              <Route path="subject" element={<Subject />} />
              <Route path="section" element={<Section />} />
              <Route path="department" element={<Department />} />
              <Route path="feestype" element={<Feestype />} />
               <Route path="examtype" element={<Examtype />} />
              <Route path="feestructure" element={<Feestructure />} />
              <Route path="salesinvoice" element={<Salesinvoice />} />
              <Route path="salesinvoiceprint" element={<SalesinvoicePrint />} />
              <Route path="receipt" element={<Receipts />} />
              <Route path="receiptprint" element={<ReceiptPrint />} />
              <Route path="payment" element={<Payments />} />
              <Route path="paymentprint" element={<PaymentPrint />} />                  
              <Route path="expensetype" element={<Expensetypes />} />
              <Route path="expense" element={<Expenses />} />
              <Route path="expenseprint" element={<ExpensePrint />} />  

              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="employees" element={<Employees />} />
              <Route path="parents" element={<Parents />} />
              <Route path="users" element={<Users />} />

              <Route path="menu" element={<Menu />} />
              <Route path="role" element={<Role />} />
              <Route path="screen" element={<Screen />} />

              <Route path="numberseq" element={<Numberseqs />} />

              <Route path="assign-period" element={<AssignPeriod2 />} />
              <Route path="periods" element={<Schedule />} />
              <Route path="attendance" element={<StudentAttendanceList />} />
              <Route path="attendance-student/:studentId" element={<AttendanceDetails />} />
              <Route path="examinations" element={<Examinations />} />
              <Route path="questionpapers" element={<Questionpapers />} />
              
              
              <Route path="marksheet" element={<Marksheet />} />
              <Route path="marksheetprint" element={<MarksheetPrint />} />
              <Route path="schoolreports" element={<SchoolReports />} />
              <Route path="schoolreportsprint" element={<SchoolReportsPrint />} />
              <Route path="financereports" element={<FinanceReports />} />
              <Route path="financereportsprint" element={<FinanceReportsPrint />} />
              <Route path="expensereportprint" element={<ExpenseReportPrint />} />
              <Route path="incomereportprint" element={<IncomeReportPrint />} />
              <Route path="studentreports" element={<StudentReports />} />
              <Route path="attendancereportprint" element={<AttendanceReportPrint />} />

              <Route path="pendingfeesreportprint" element={<PendingFeesReportPrint />} />
              <Route path="paidfeesreportprint" element={<PaidFeesReportPrint />} />

              <Route path="pendingexpensesreportprint" element={<PendingExpensesReportPrint />} />
              <Route path="paidexpensesreportprint" element={<PaidExpensesReportPrint />} />
              
              <Route path="progressCardPDF" element={<ProgressCardPDF />} />

              
              
              
              <Route path="notice" element={<NoticeSchool />} />
            </Route>

            <Route path="student" element={<ProtectedRoute allowedRoles={['STUDENT']}><Student /></ProtectedRoute>}>
              <Route index element={<StudentDetails />} />
              <Route path="student-details" element={<StudentDetails />} />
              <Route path="examinations" element={<StudentExaminations />} />
              <Route path='periods' element={<ScheduleStudent />} />
              <Route path="attendance" element={<AttendanceStudent />} />
              <Route path="notice" element={<NoticeStudent />} />
            </Route>

            <Route path="teacher" element={<ProtectedRoute allowedRoles={['TEACHER']}><Teacher /></ProtectedRoute>}>
              <Route index element={<TeacherDetails />} />
              <Route path="details" element={<TeacherDetails />} />
              <Route path="examinations" element={<TeacherExaminations />} />
              <Route path="periods" element={<TeacherSchedule />} />
              {/* <Route path='sub-teach' element={<StudentSubjectTeacher/>} /> */}
              <Route path="attendance" element={<AttendanceTeacher />} />
              <Route path="invoice2" element={<Invoice2 />} />
              <Route path="AttendancePrint" element={<AttendancePrint />} />
              <Route path="notice" element={<NoticeTeacher />} />
            </Route>

            <Route path="/" element={<Client />}>
              <Route index element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="logout" element={<Logout />} />
            </Route>

            <Route path="parent" element={<ProtectedRoute allowedRoles={['PARENT']}><Parent /></ProtectedRoute>}>
              <Route index element={<ParentDetails />} />
              <Route path="parent-details" element={<ParentDetails />} />
              <Route path="examinations" element={<ParentExaminations />} />
              <Route path='periods' element={<ScheduleParent />} />
              <Route path="attendance" element={<AttendanceParent />} />
              <Route path="notice" element={<NoticeParent/>} />
            </Route>

            <Route path="user" element={<ProtectedRoute allowedRoles={['USER']}><User /></ProtectedRoute>}>
              <Route index element={<UserDashboard />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </ThemeProvider>


    </>
  );

}


export default App;
