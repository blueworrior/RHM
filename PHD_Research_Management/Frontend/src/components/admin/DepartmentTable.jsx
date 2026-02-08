import { DataGrid } from '@mui/x-data-grid';
import { Paper } from "@mui/material";

export default function DepartmentsTable({departments}){

    const columns = [
        {
            field:'id',
            headerName:'ID',
            width:90
        },
        {
            field:'name',
            headerName:'Department Name',
            flex:1
        }
    ];

    return(
        <Paper sx={{height:500, borderRadius:3}}>
            <DataGrid
                rows={departments}
                columns={columns}
                pageSize={8}
                rowsPerPageOptions={[8]}
                disableRowSelectionOnClick
                sx={{border:0}}
            />
        </Paper>
    )
}
