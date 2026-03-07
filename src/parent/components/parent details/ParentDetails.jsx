import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../../../environment";
// import "./ParentDetails.css"
export default function ParentDetails(){
    const [parent, setParent] = useState(null)

    const getParentDetails = ()=>{
        axios.get(`${baseUrl}/parent/fetch-own`).then(resp=>{
            setParent(resp.data.data)
    console.log("parent",  resp)
        }).catch(e=>{
            console.log("Error in parent", e)
        })
    }

    useEffect(()=>{
        getParentDetails()
    },[])
    return(
        <>
                <Typography variant="h3"  sx={{textAlign:'center',marginBottom:"15px" }}>Parent Details</Typography>
                {parent && <>

                    <Box component={"div"} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",padding:"5px" }}>
                            <img src={`/images/uploaded/parent/${parent.parent_image}`} alt='image' height={'370px'} width={'450px'} style={{borderRadius:"50%"}} />
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
                            {parent.email}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                          Name
                        </TableCell>
                        <TableCell className="table-cell" align="left" >
                            {parent.name}
                         </TableCell>
                      </TableRow>

                      

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Age
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                         {parent.age}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Gender
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                         {parent.gender}
                         </TableCell>
                      </TableRow>

                      

                    </TableBody>
                  </Table>
                </TableContainer>
                </>}
              
        
        </>
    )
}