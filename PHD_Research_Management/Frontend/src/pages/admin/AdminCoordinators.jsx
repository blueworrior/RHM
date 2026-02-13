import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from '@mui/icons-material/Edit';

import CreateCoordinatorModal from "../../components/admin/CreateCoordinatorModal";
import EditCoordinatorModal from "../../components/admin/EditCoordinatorModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AppTable from "../../components/common/AppTable";

import { getCoordinators } from "../../api/adminApi";

export default function AdminCoordinators(){

    const [coordinators, setCoordinators] = useState([]);
    const [openCreate, setOpenCreate] = useState(false);
    const [editingCoordinator, setEditingCoordinator] = useState(null);

    // confirm state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedCoordinator, setSelectedCoordinator] = useState(null);

    const fetchCoordinators = async ()=>{
        try{
            const data = await getCoordinators();

            const formatted = data.map(c=>({
                id:c.user_id,
                name:`${c.first_name} ${c.last_name}`,
                email:c.email,
                department:c.department
            }));

            setCoordinators(formatted);

        }catch(err){
            console.error("Coordinator fetch error", err);
        }
    };

    useEffect(()=>{
        fetchCoordinators();
    },[]);

    const openEditConfirm = (coordinator)=>{
        setSelectedCoordinator(coordinator);
        setConfirmOpen(true);
    };

    const handleConfirm = ()=>{
        setEditingCoordinator(selectedCoordinator);
        setConfirmOpen(false);
    };

    const columns = [
        { field:'id', headerName:'ID', flex:0.3 },
        { field:'name', headerName:'Name', flex:1 },
        { field:'email', headerName:'Email', flex:1.3 },
        { field:'department', headerName:'Department', flex:1 },
        {
            field:'actions',
            headerName:'Actions',
            flex:0.7,
            renderCell:(params)=>(
                <Button
                    size="small"
                    startIcon={<EditIcon/>}
                    onClick={()=>openEditConfirm(params.row)}
                >
                    Edit
                </Button>
            )
        }
    ];

    return(
        <DashboardLayout>

            <Typography variant="h4" mb={3}>
                Coordinators
            </Typography>

            <Button
                variant="contained"
                startIcon={<AddIcon/>}
                sx={{mb:2}}
                onClick={()=>setOpenCreate(true)}
            >
                Create Coordinator
            </Button>

            <AppTable
                rows={coordinators}
                columns={columns}
            />

            <CreateCoordinatorModal
                open={openCreate}
                handleClose={()=>setOpenCreate(false)}
                refresh={fetchCoordinators}
            />

            <EditCoordinatorModal
                open={!!editingCoordinator}
                handleClose={()=>setEditingCoordinator(null)}
                coordinator={editingCoordinator}
                refresh={fetchCoordinators}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Edit Coordinator"
                message="Do you want to edit this coordinator?"
                onConfirm={handleConfirm}
                onClose={()=>setConfirmOpen(false)}
            />

        </DashboardLayout>
    );
}
