import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Typography, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import CreateDepartmentModal from "../../components/admin/CreateDepartmentModal";
import EditDepartmentModal from "../../components/admin/EditDepartmentModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AppTable from "../../components/common/AppTable";

import { deleteDepartment, getDepartments } from "../../api/adminApi";

export default function AdminDepartments() {

    const [departments, setDepartments] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [editOpen, setEditOpen] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState(null);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();

            const formatted = data.map(dep => ({
                id: dep.id,
                name: dep.name
            }));

            setDepartments(formatted);

        } catch (err) {
            console.error("Departments fetch error", err);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleEdit = (dept) => {
        setSelectedDept(dept);
        setEditOpen(true);
    };

    const openDeleteConfirm = (dept)=>{
        setDeptToDelete(dept);
        setConfirmOpen(true);
    };

    const handleDelete = async ()=>{
        try{
            await deleteDepartment(deptToDelete.id);
            fetchDepartments();
            showSnackbar("Department deleted successfully", "success");
        }catch(err){
            console.error(err?.response?.data?.message || "Delete failed");
        }finally{
            setConfirmOpen(false);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Department Name', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            renderCell: (params) => {

                const dept = params.row;

                return (
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(dept)}
                        >
                            Edit
                        </Button>

                        <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => openDeleteConfirm(dept)}
                        >
                            Delete
                        </Button>
                    </Stack>
                )
            }
        }
    ];

    return (
        <DashboardLayout>

            <Typography variant="h4" mb={3} fontWeight={700}>
                Departments
            </Typography>

            <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mb: 2 }}
                onClick={() => setOpen(true)}
            >
                Create Department
            </Button>

            <AppTable
                rows={departments}
                columns={columns}
            />

            <CreateDepartmentModal
                open={open}
                handleClose={() => setOpen(false)}
                refresh={fetchDepartments}
            />

            <EditDepartmentModal
                open={editOpen}
                handleClose={() => {
                    setEditOpen(false);
                    setSelectedDept(null)
                }}
                department={selectedDept}
                refresh={fetchDepartments}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Department"
                message="Are you sure you want to delete this department?"
                onConfirm={handleDelete}
                onClose={()=>setConfirmOpen(false)}
            />

        </DashboardLayout>
    )
}
