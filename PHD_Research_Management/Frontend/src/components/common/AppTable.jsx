import { DataGrid } from "@mui/x-data-grid";
import { Paper } from "@mui/material";

export default function AppTable({rows=[], columns=[], height=500}){

    // VERY IMPORTANT — DataGrid MUST have id
    const safeRows = rows.map((row, index) => ({
        id: row.id ?? index,
        ...row
    }));

    return(
        <Paper
            sx={{
                height,
                borderRadius:3,
                overflow: 'hidden'
            }}
        >
            <DataGrid
                rows={safeRows}
                columns={columns}
                pageSize={8}
                disableRowSelectionOnClick
                sx={{ boeder: 0 }}
            />
        </Paper>
    );
}