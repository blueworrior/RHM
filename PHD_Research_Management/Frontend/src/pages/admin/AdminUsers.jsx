import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Typography } from "@mui/material";
import UsersTable from "../../components/admin/UserTable";
import { getAllUsers } from "../../api/adminApi";

export default function AdminUsers() {

    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            const formatted = data.map(user => ({
                ...user,
                name: `${user.first_name} ${user.last_name}`
            }));
            setUsers(formatted);
        }
        catch (err) {
            console.error("Users fetch error", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <DashboardLayout>

            <Typography variant="h4" mb={3} fontWeight={700}>
                User Management
            </Typography>

            <UsersTable users={users} refresh={fetchUsers} />

        </DashboardLayout>
    );
}
