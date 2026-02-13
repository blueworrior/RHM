import { useEffect, useState } from "react";
import { Typography, Button, Box, Chip } from "@mui/material";

import CreateAdminModal from "../../components/admin/CreateAdminModal";
import DashboardLayout from "../../layouts/DashboardLayout";
import AppTable from "../../components/common/AppTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import { getAllUsers, toggleUserStatus } from "../../api/adminApi";
import { useAuth } from "../../context/AuthContext";
import ResetPasswordModal from "../../components/admin/ResetPasswordModal";
import { useSnackbar } from "../../context/SnackbarContext";

export default function AdminUsers() {

    const { user } = useAuth();

    const [users, setUsers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const { showSnackbar } = useSnackbar();

    // confirm dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionType, setActionType] = useState("");

    // reset password modal
    const [passwordOpen, setPasswordOpen] = useState(false);

    // ✅ FETCH USERS
    const fetchUsers = async () => {
        try {

            const data = await getAllUsers();

            const formatted = data.map(user => ({
                ...user,
                name: `${user.first_name} ${user.last_name}`
            }));

            setUsers(formatted);

        } catch (err) {

            console.error("Users fetch error", err);

        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // ✅ OPEN CONFIRM
    const openConfirm = (userRow, type) => {
        setSelectedUser(userRow);
        setActionType(type);
        setConfirmOpen(true);
    };

    // ✅ HANDLE CONFIRM ACTION
    const handleConfirm = async () => {

        if (!selectedUser) return;

        try {

            // 🔥 TOGGLE STATUS
            if (actionType === "toggle") {

                await toggleUserStatus(
                    selectedUser.id,
                    selectedUser.status === "active" ? "inactive" : "active"
                );

                fetchUsers();
                showSnackbar("Status Changed successfully", "success");
            }
            
            // 🔥 RESET PASSWORD
            if (actionType === "reset") {
                
                setPasswordOpen(true);
                showSnackbar("Password reset successfully", "success");
            }

        } catch (err) {

            console.error(err?.response?.data?.message || "Action failed");

        } finally {

            setConfirmOpen(false);
        }
    };

    // ✅ TABLE COLUMNS
    const columns = [

        { field: 'id', headerName: 'ID', flex: 0.2 },

        { field: 'name', headerName: 'Name', flex: 1 },

        { field: 'email', headerName: 'Email', flex: 1.4 },

        {
            field: 'role',
            headerName: 'Role',
            flex: 0.7,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'admin' ? 'error' : 'primary'}
                />
            )
        },

        {
            field: 'status',
            headerName: 'Status',
            flex: 0.6,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'active' ? 'success' : 'default'}
                />
            )
        },

        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1.4,
            renderCell: (params) => {

                const row = params.row;
                const isSuperAdmin = row.is_super_admin;
                const isSelf = row.id === user.id;

                // 🔥 PROTECTED USER
                if (isSuperAdmin) {
                    return <Chip label="Protected" color="warning" />;
                }

                // 🔥 PERMISSION LOGIC
                const canResetPassword =
                    !isSelf && (
                        user.is_super_admin || row.role !== "admin"
                    );

                return (
                    <>
                        <Button
                            size="small"
                            onClick={() => openConfirm(row, "toggle")}
                        >
                            Toggle
                        </Button>

                        {canResetPassword && (
                            <Button
                                size="small"
                                color="secondary"
                                onClick={() => openConfirm(row, "reset")}
                            >
                                Reset Password
                            </Button>
                        )}
                    </>
                );
            }
        }
    ];

    return (
        <DashboardLayout>

            <Typography variant="h4" mb={3} fontWeight={700}>
                User Management
            </Typography>

            <Box mb={2} display="flex" justifyContent="flex-end">

                {user?.is_super_admin && (
                    <Button
                        variant="contained"
                        onClick={() => setOpenModal(true)}
                    >
                        Create Admin
                    </Button>
                )}

            </Box>

            <AppTable
                rows={users}
                columns={columns}
            />

            {/* CREATE ADMIN */}
            <CreateAdminModal
                open={openModal}
                handleClose={() => setOpenModal(false)}
                refresh={fetchUsers}
            />

            {/* CONFIRM DIALOG */}
            <ConfirmDialog
                open={confirmOpen}
                title="Confirm Action"
                message={`Are you sure you want to ${actionType === "toggle"
                        ? "change this user's status"
                        : "reset this user's password"
                    }?`}
                onConfirm={handleConfirm}
                onClose={() => setConfirmOpen(false)}
            />

            {/* RESET PASSWORD MODAL */}
            <ResetPasswordModal
                open={passwordOpen}
                handleClose={() => setPasswordOpen(false)}
                userId={selectedUser?.id}
                refresh={fetchUsers}
            />

        </DashboardLayout>
    );
}
