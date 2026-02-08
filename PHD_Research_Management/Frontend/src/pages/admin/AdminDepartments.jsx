import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import DepartmentsTable from "../../components/admin/DepartmentTable";
import CreateDepartmentModal from "../../components/admin/CreateDepartmentModal";

import { getDepartments } from "../../api/adminApi";

export default function AdminDepartments(){

    const [departments, setDepartments] = useState([]);
    const [open, setOpen] = useState(false);

    const fetchDepartments = async()=>{
        try{
            const data = await getDepartments();

            const formatted = data.map(dep=>({
                id:dep.id,
                name:dep.name
            }));

            setDepartments(formatted);

        }catch(err){
            console.error("Departments fetch error", err);
        }
    };

    
    useEffect(()=>{
        fetchDepartments();
    },[]);


    return(
        <DashboardLayout>

            <Typography variant="h4" mb={3} fontWeight={700}>
                Departments
            </Typography>

            <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{mb:2}}
                onClick={()=>setOpen(true)}
            >
                Create Department
            </Button>

            <DepartmentsTable departments={departments}/>

            <CreateDepartmentModal
                open={open}
                handleClose={()=>setOpen(false)}
                refresh={fetchDepartments}
            />

        </DashboardLayout>
    )
}