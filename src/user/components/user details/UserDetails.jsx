import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../../../environment";
// import "./UserDetails.css"
export default function UserDetails(){
    const [user, setUser] = useState(null)

    const getUserDetails = ()=>{
        axios.get(`${baseUrl}/user/fetch-own`).then(resp=>{
            setUser(resp.data.data)
    console.log("user",  resp)
        }).catch(e=>{
            console.log("Error in user", e)
        })
    }

    useEffect(()=>{
        getUserDetails()
    },[])
    return(
        <>
                <Typography variant="h3"  sx={{textAlign:'center',marginBottom:"15px" }}>User Details</Typography>
                {user && <>

                    <Box component={"div"} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",padding:"5px" }}>
                          <img src={`${user.user_image}`} alt='image' height={'370px'} width={'450px'} style={{borderRadius:"50%"}} />
                        </Box>
                    <TableContainer sx={{margin:"auto", width:"80%",border:'1px solid transparent',  borderRadius:"17px", boxShadow:"0 10px 8px -5px lightgray"
                    }} component={'div'}>
                  <Table sx={{ minWidth: 250 }} aria-label="simple table">
                    <TableBody>
                        <TableRow>
                        <TableCell className="table-cell" align="left">
                          Email
                        </TableCell>
                        <TableCell className="table-cell" align="left" >
                            {user.email}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                          Name
                        </TableCell>
                        <TableCell className="table-cell" align="left" >
                            {user.name}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Class
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                         {user.user_class.class_text}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Age
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                         {user.age}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Gender
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                         {user.gender}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Guardian
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                        {user.guardian}
                         </TableCell>
                      </TableRow>

                    </TableBody>
                  </Table>
                </TableContainer>
                </>}
              
        
        </>
    )
}