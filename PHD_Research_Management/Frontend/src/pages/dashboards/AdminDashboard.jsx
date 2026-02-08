
import { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getTotalCoordinators, getTotalDepartments, getTotalStudents, getTotalSupervisors } from "../../api/adminApi";
import StatCard from "../../components/dashboard/StatCard";
import AdminChart from "../../components/dashboard/AdminChart";
import ActivityPanel from "../../components/dashboard/ActivityPanel";



export default function AdminDashboard() {

    const [stats, setStats] = useState([]);

    useEffect(()=> {

    const fetchData = async () => {

        try{

            const [
                students,
                supervisors,
                coordinators,
                departments
                
            ] = await Promise.all([
                getTotalStudents(),
                getTotalSupervisors(),
                getTotalCoordinators(),
                getTotalDepartments()
            ]);

            setStats([
                { title:"Total Students", value:students, color:"#B11226" },
                { title:"Total Supervisors", value:supervisors, color:"#7A0C1A" },
                { title:"Total Coordinators", value:coordinators, color:"#B11226" },
                { title:"Total Departments", value:departments, color:"#7A0C1A" },
            ]);

        }catch(err){
            console.error("Dashboard error:", err);
        }
    }

    fetchData();

}, [])


    return (
        <DashboardLayout>
            <Typography variant="h4" mb={3} fontWeight={700}>
                Admin Dashboard
            </Typography>

            <Grid container spacing={3}>
                {stats.map((stat) => (
                    <Grid size={{ xs:12, sm:6, md:4, lg:3 }} key={stat.title}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>
            <Grid container spacing={3} mt={1}>

                <Grid size={{ xs:12, md:8 }}>
                    <AdminChart stats={stats} />
                </Grid>

                <Grid size={{ xs:12, md:4 }}>
                    <ActivityPanel/>
                </Grid>

            </Grid>




        </DashboardLayout>
    )
}