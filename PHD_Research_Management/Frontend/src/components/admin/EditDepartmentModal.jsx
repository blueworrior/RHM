import { useState, useEffect, use } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    DialogActions
} from "@mui/material";

import { updateDepartment } from "../../api/adminApi";
import { useSnackbar } from "../../context/SnackbarContext";

export default function EditDepartmentModal({open, handleClose, department, refresh}){

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const {showSnackbar } = useSnackbar();

    useEffect(()=>{
        if(department){
            setName(department.name);
        }
    }, [department]);

    const handleSubmit = async ()=>{

        if(!name.trim()){
            showSnackbar("Department name required", "error");
            return;
        }

        try{
            setLoading(true);

            await updateDepartment(department.id, {name});

            handleClose();
            refresh();
            showSnackbar("Department name updated successfully", "success");
            
        }catch(err){
            showSnackbar(err?.response?.data?.message || "Update failed", "error");
        }
        finally{
            setLoading(false);
        }
    };
    if(!department) return null;

    return(
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
            <DialogTitle>Edit Department</DialogTitle>

            <DialogContent>
                <TextField
                    label="Department Name"
                    fullWidth
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                    sx={{mt:2}}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update"}
                </Button>
            </DialogActions>

        </Dialog>
    )
}
