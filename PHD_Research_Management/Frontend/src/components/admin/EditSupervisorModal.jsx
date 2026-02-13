import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent,
    TextField, Button, DialogActions, MenuItem
} from "@mui/material";

import { updateSupervisor, getDepartments } from "../../api/adminApi";
import { useSnackbar } from "../../context/SnackbarContext";

export default function EditSupervisorModal({open, handleClose, supervisor, refresh }){

    const [departments,setDepartments] = useState([]);
    const [form,setForm] = useState({});
    const {showSnackbar } = useSnackbar();

    useEffect(()=>{

        if(supervisor){
            setForm(supervisor);
            getDepartments().then(setDepartments);
        }

    },[supervisor]);

    const handleChange = (e)=>{
        setForm({...form,[e.target.name]:e.target.value});
    };

    const handleSubmit = async ()=>{

        try{

            await updateSupervisor(form.id, form);

            handleClose();
            refresh();
            showSnackbar("Supervisor updated successfully", "success");

        }catch(err){
            showSnackbar(err?.response?.data?.message, "error");
        }
    };

    return(
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">

            <DialogTitle>Edit Supervisor</DialogTitle>

            <DialogContent sx={{display:'flex',flexDirection:'column',gap:2,mt:1}}>

                <TextField
                    label="First Name"
                    name="first_name"
                    value={form.first_name || ""}
                    onChange={handleChange}
                />

                <TextField
                    label="Last Name"
                    name="last_name"
                    value={form.last_name || ""}
                    onChange={handleChange}
                />

                <TextField
                    label="Email"
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                />

                <TextField
                    label="Designation"
                    name="designation"
                    value={form.designation || ""}
                    onChange={handleChange}
                />

                <TextField
                    label="Expertise"
                    name="expertise"
                    value={form.expertise || ""}
                    onChange={handleChange}
                />

                <TextField
                    select
                    label="Department"
                    name="dept_id"
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
