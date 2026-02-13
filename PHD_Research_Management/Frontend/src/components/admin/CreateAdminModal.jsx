import { useState } from "react";
import { Snackbar, TextField } from "@mui/material";
import FormModal from "../common/FormModal";

import { createAdmin } from "../../api/adminApi";
import { useSnackbar } from "../../context/SnackbarContext";

export default function CreateAdminModal({ open, handleClose, refresh }) {

    const [loading, setLoading] = useState(false);

    const { showSnackbar } = useSnackbar();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        conPass: ""
    });

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
            return showSnackbar("Password must be atleast 8 characters", "error");

        if (form.password !== form.conPass)
            return showSnackbar("Password doesn't match", "error");

        try {

            setLoading(true);

            await createAdmin(form);

            refresh();
            handleClose();
            showSnackbar("Admin created successfully", "success");

        } catch (err) {
            showSnackbar(err?.response?.data?.message || "Error creating admin", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormModal
            open={open}
            handleClose={handleClose}
            title="Create Admin"
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Create"
        >
            <TextField label="First Name" name="first_name" onChange={handleChange}/>
            <TextField label="Last Name" name="last_name" onChange={handleChange}/>
            <TextField label="Email" name="email" onChange={handleChange}/>
            <TextField label="Password" name="password" type="password" onChange={handleChange}/>
            <TextField label="Confirm Password" name="conPass" type="password" onChange={handleChange}/>
        </FormModal>
    );
}
