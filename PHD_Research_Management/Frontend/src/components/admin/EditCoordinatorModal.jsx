import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    DialogActions,
    MenuItem
} from "@mui/material";

import { updateCoordinator, getDepartments } from "../../api/adminApi";
import { useSnackbar } from "../../context/SnackbarContext";

export default function EditCoordinatorModal({open, handleClose, coordinator, refresh}){

    const [form, setForm] = useState({});
    const [departments, setDepartments] = useState([]);

    const {showSnackbar } = useSnackbar();

    useEffect(()=>{

        if(coordinator){
            const names = coordinator.name.split(" ");

            setForm({
                first_name:names[0],
                last_name:names[1] || "",
                email:coordinator.email,
                dept_id:""
            });
        }

        const fetchDepartments = async()=>{
            const data = await getDepartments();
            setDepartments(data);
        };

        if(open) fetchDepartments();

    },[coordinator, open]);

    const handleChange = (e)=>{
        setForm({
            ...form,
            [e.target.name]:e.target.value
        });
    };

    const handleSubmit = async ()=>{

        try{

            await updateCoordinator(coordinator.id, form);

            handleClose();
            refresh();
            showSnackbar("Coordinator updated successfully", "success");

        }catch(err){
            showSnackbar(err?.response?.data?.message || "Update failed", "error");
        }
    };

    return(
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">

            <DialogTitle>Edit Coordinator</DialogTitle>

            <DialogContent sx={{display:'flex',flexDirection:'column',gap:2,mt:1}}>

                <TextField name="first_name" label="First Name" value={form.first_name || ""} onChange={handleChange}/>
                <TextField name="last_name" label="Last Name" value={form.last_name || ""} onChange={handleChange}/>
                <TextField name="email" label="Email" value={form.email || ""} onChange={handleChange}/>

                <TextField
                    select
                    name="dept_id"
                    label="Department"
                    value={form.dept_id || ""}
                    onChange={handleChange}
                >
                    {departments.map(dep=>(
                        <MenuItem key={dep.id} value={dep.id}>
                            {dep.name}
                        </MenuItem>
                    ))}
                </TextField>

            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    Update
                </Button>
            </DialogActions>

        </Dialog>
    );
}
