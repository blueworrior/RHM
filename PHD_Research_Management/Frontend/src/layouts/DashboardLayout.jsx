import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function DashboardLayout({children}){
    return(
        <Box sx={{display:'flex'}}>

            <Sidebar/>

            <Box sx={{flexGrow:1}}>

                <Topbar/>

                <Box sx={{
                    padding:3,
                    background:'#f4f6f8',
                    minHeight:'100vh',
                    overflow:'auto'
                }}>
                    {children}
                </Box>
                
            </Box>
        </Box>
    )
}