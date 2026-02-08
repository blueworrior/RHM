import { Box, Typography, Avatar, IconButton } from "@mui/material";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Topbar(){

    const { user } = useAuth();

    return(
        <Box
            component={motion.div}
            initial={{y:-20, opacity:0}}
            animate={{y:0, opacity:1}}
            sx={{
                height:70,
                display:'flex',
                alignItems:'center',
                justifyContent:'space-between',
                padding:'0 25px',
                background:"rgba(255,255,255,0.7)",
                backdropFilter:"blur(8px)",
                borderBottom:"1px solid #eee",
                position:"sticky",
                top:0,
                zIndex:100
            }}
        >

            <Typography fontWeight={700}>
                Welcome, {user ? `${user?.first_name}` : "User"}
            </Typography>


            <Box sx={{display:'flex',alignItems:'center',gap:2}}>

                <IconButton>
                    <NotificationsNoneIcon/>
                </IconButton>

                <Avatar sx={{background:"#B11226"}}>
                    {user?.user?.name?.charAt(0).toUpperCase()}
                </Avatar>

            </Box>

        </Box>
    );
}
