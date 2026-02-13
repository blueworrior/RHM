import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from '@mui/icons-material/Edit';

import CreateSupervisorModal from "../../components/admin/CreateSupervisorModal";
import EditSupervisorModal from "../../components/admin/EditSupervisorModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AppTable from "../../components/common/AppTable";

import { getSupervisors } from "../../api/adminApi";

export default function AdminSupervisors(){

    const [supervisors,setSupervisors] = useState([]);
    const [open,setOpen] = useState(false);
    const [editingSupervisor,setEditingSupervisor] = useState(null);

    const [confirmOpen,setConfirmOpen] = useState(false);
    const [selectedSupervisor,setSelectedSupervisor] = useState(null);

    const fetchSupervisors = async ()=>{

        try{

            const data = await getSupervisors();

            const formatted = data.map(s=>({
                id: s.user_id,
                first_name:s.first_name,
                last_name:s.last_name,
                name:`${s.first_name} ${s.last_name}`,
                email:s.email,
                department:s.department,
                designation:s.designation,
                expertise:s.expertise,
            }));

            setSupervisors(formatted);

        }catch(err){
            console.error(err);
        }
    };

    useEffect(()=>{
        fetchSupervisors();
    },[]);

    const openEditConfirm = (supervisor)=>{
        setSelectedSupervisor(supervisor);
        setConfirmOpen(true);
    };

    const handleConfirm = ()=>{
        setEditingSupervisor(selectedSupervisor);
        setConfirmOpen(false);
    };

    const columns = [

        { field: 'id', headerName: 'ID', flex: 0.4 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1.3 },
        { field: 'department', headerName: 'Department', flex: 1 },
        { field: 'designation', headerName: 'Designation', flex: 1 },
        { field: 'expertise', headerName: 'Expertise', flex: 1.5 },

        {
            field: 'actions',
            headerName: 'Actions',
            flex: 0.6,
            renderCell: (params) => (
                <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => openEditConfirm(params.row)}
                >
                    Edit
                </Button>
            )
        }
    ];

    return(
        <DashboardLayout>

            <Typography variant="h4" mb={3}>
                Supervisors
            </Typography>

            <Button
                variant="contained"
                startIcon={<AddIcon/>}
                sx={{mb:2}}
                onClick={()=>setOpen(true)}
            >
                Create Supervisor
            </Button>

            <AppTable
                rows={supervisors}
                columns={columns}
            />

            <CreateSupervisorModal
                open={open}
                handleClose={()=>setOpen(false)}
                refresh={fetchSupervisors}
            />

            <EditSupervisorModal
                open={!!editingSupervisor}
                supervisor={editingSupervisor}
                handleClose={()=>setEditingSupervisor(null)}
                refresh={fetchSupervisors}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Edit Supervisor"
                message="Do you want to edit this supervisor?"
                onConfirm={handleConfirm}
                onClose={()=>setConfirmOpen(false)}
            />

        </DashboardLayout>
    );
}
