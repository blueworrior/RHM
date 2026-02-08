import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Chip } from "@mui/material";
import { toggleUserStatus, resetUserPassword } from "../../api/adminApi";

export default function UsersTable({ users, refresh }) {

    const handleToggle = async (user) => {

        const confirm = window.confirm(
            `Are you sure you want to ${user.status === 'active' ? 'deactivate' : 'activate'} this user?`
        );

        if (!confirm) return;

        try {

            await toggleUserStatus(
                user.id,
                user.status === 'active' ? 'inactive' : 'active'
            );

            alert("Status updated");

            refresh(); // VERY IMPORTANT

        } catch (err) {
            alert(err.response?.data?.message || "Error updating status");
        }
    }


    const handleResetPassword = async (user) => {

        const confirm = window.confirm(
            `Reset password for ${user.name}?`
        );

        if (!confirm) return;
        
        const newPass = window.prompt("Enter new password:");

        if (!newPass) return;

        if (newPass.length < 8) {
            alert("Password must be atleast 8 character");
            return;
        }

        try {

            await resetUserPassword(user.id, {
                password: newPass
            });

            alert("Password reset successfully");

        } catch (err) {

            alert(err?.response?.data?.message || "Error resetting password");

        }
    };



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
            flex: 0.5,
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
            flex: 1.2,
            renderCell: (params) => {

                const isSuperAdmin = params.row.is_super_admin;

                if (isSuperAdmin) {
                    return <Chip label="Protected" color="warning" />;
                }

                return (
                    <>
                        <Button
                            size="small"
                            onClick={() => handleToggle(params.row)}
                        >
                            Toggle
                        </Button>

                        <Button
                            size="small"
                            color="secondary"
                            onClick={() => handleResetPassword(params.row)}
                        >
                            Reset Password
                        </Button>
                    </>
                );
            }
        }
    ];

    return (
        <Box sx={{display:'flex', gap:1}}>
            <DataGrid
                autoHeight
                rows={users}
                columns={columns}
                pageSize={8}
            />
        </Box>

    );
}
