import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography } from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import {motion} from 'framer-motion';

const drawerWidth = 260;

export default function Sidebar(){

    const navigate = useNavigate();
    const {logout, user} = useAuth();

    const menuByRole = {
        admin:[
            {text:'Dashboard', icon:<DashboardIcon/>, path:'/admin'},
            {text:'Users', icon:<AccountTreeIcon/>, path:'/admin/users'},
            {text:'Departments', icon:<AccountTreeIcon/>, path:'/admin/departments'},
            {text:'Programs', icon:<SchoolIcon/>, path:'/admin/programs'},
        ],
        supervisor:[
            {text:'Dashboard', icon:<DashboardIcon/>, path:'/supervisor'},
            {text:'Students', icon:<PeopleIcon/>, path:'/supervisor/students'},
        ],
        student:[
            {text:'Dashboard', icon:<DashboardIcon/>, path:'/student'},
            {text:'My Research', icon:<AssignmentIcon/>, path:'/student/research'},
        ],
        coordinator:[
            {text:'Dashboard', icon:<DashboardIcon/>, path:'/coordinator'},
        ],
        examiner:[
            {text:'Dashboard', icon:<DashboardIcon/>, path:'/examiner'},
        ],
    };

    const menu = menuByRole[user?.role] || [];

    return (
         <Drawer
            variant="permanent"
            sx={{
                width:drawerWidth,
                flexShrink:0,
                '& .MuiDrawer-paper':{
                    width:drawerWidth,
                    boxSizing:'border-box',
                    borderRight:"none",
                    background:"#ffffff",
                    boxShadow:"0 0 20px rgba(0,0,0,0.05)"
                }
            }}
        >

            {/* LOGO */}
            <Box
                component={motion.div}
                initial={{opacity:0}}
                animate={{opacity:1}}
                sx={{
                    display:'flex',
                    flexDirection:'column',
                    alignItems:'center',
                    padding:3,
                    borderBottom:"1px solid #eee"
                }}
            >
                <img src={logo} width={55}/>
                <Typography fontWeight={700} mt={1}>
                    PhD Portal
                </Typography>
            </Box>


            {/* MENU */}
            <List sx={{padding:2}}>

                {menu.map((item)=>(
                    <ListItemButton
                        key={item.text}
                        onClick={()=>navigate(item.path)}
                        sx={{
                            borderRadius:2,
                            marginBottom:1,
                            '&:hover':{
                                background:"#B1122615"
                            }
                        }}
                    >
                        <ListItemIcon sx={{color:"#B11226"}}>
                            {item.icon}
                        </ListItemIcon>

                        <ListItemText primary={item.text}/>
                    </ListItemButton>
                ))}

            </List>


            {/* LOGOUT */}
            <Box sx={{marginTop:'auto', padding:2}}>
                <ListItemButton
                    onClick={()=>{
                        logout();
                        navigate("/login");
                    }}
                    sx={{
                        borderRadius:2,
                        '&:hover':{
                            background:"#ffebee"
                        }
                    }}
                >
                    <ListItemIcon sx={{color:"#B11226"}}>
                        <LogoutIcon/>
                    </ListItemIcon>

                    <ListItemText primary="Logout"/>
                </ListItemButton>
            </Box>

        </Drawer>
    );
}