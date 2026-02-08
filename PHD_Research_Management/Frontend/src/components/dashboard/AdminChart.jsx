import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

import { Paper, Typography } from "@mui/material";

export default function AdminChart({stats}){

    const data = stats.map(stat => ({
        name: stat.title.replace("Total ", ""),
        value: stat.value
    }));

    return(
        <Paper sx={{padding:3, borderRadius:3, height:350}}>

            <Typography fontWeight={700} mb={2}>
                System Overview
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="name"/>
                    <YAxis/>
                    <Tooltip/>
                    <Bar dataKey="value" fill="#B11226"/>
                </BarChart>
            </ResponsiveContainer>

        </Paper>
    )
}
