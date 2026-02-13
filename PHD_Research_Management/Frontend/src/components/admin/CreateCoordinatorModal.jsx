import { useState, useEffect } from "react";
import { TextField, MenuItem } from "@mui/material";
import FormModal from "../common/FormModal";

import { createCoordinator, getDepartments } from "../../api/adminApi";
import { useSnackbar } from "../../context/SnackbarContext";

export default function CreateCoordinatorModal({ open, handleClose, refresh }) {

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        dept_id: ""
    });

    useEffect(() => {
        if (open) {
            getDepartments().then(setDepartments);
        }
    }, [open]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {

        if (Object.values(form).some(v => !v))
            return showSnackbar("All fields required", "error");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email))
            return showSnackbar("Invalid email", "error");

        if (form.password.length < 8)
            return showSnackbar("Password must be 8+ chars", "error");

        try {
            setLoading(true);

            await createCoordinator(form);

            refresh();
            handleClose();

            setForm({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                dept_id: ""
            });
            showSnackbar("Coordinator created successfully", "success");

        } catch (err) {
            showSnackbar(err?.response?.data?.message || "Creation failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormModal
            open={open}
            handleClose={handleClose}
            title="Create Coordinator"
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Create"
        >
            <TextField label="First Name" name="first_name" onChange={handleChange}/>
            <TextField label="Last Name" name="last_name" onChange={handleChange}/>
            <TextField label="Email" name="email" onChange={handleChange}/>
            <TextField label="Password" name="password" type="password" onChange={handleChange}/>

            <TextField select label="Department" name="dept_id" onChange={handleChange}>
                {departments.map(dep => (
                    <MenuItem key={dep.id} value={dep.id}>
                        {dep.name}
                    </MenuItem>
                ))}
            </TextField>
        </FormModal>
    );
}
