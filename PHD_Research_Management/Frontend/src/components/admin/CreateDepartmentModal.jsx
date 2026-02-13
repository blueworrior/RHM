import { useState } from "react";
import { TextField } from "@mui/material";
import FormModal from "../common/FormModal";

import { createDepartment } from "../../api/adminApi";
import { useSnackbar } from "../../context/SnackbarContext";

export default function CreateDepartmentModal({ open, handleClose, refresh }) {

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();

    const handleSubmit = async () => {

        if (!name.trim())
            return showSnackbar("Department name required", "error");

        try {

            setLoading(true);

            await createDepartment({ name });

            refresh();
            handleClose();
            setName("");
            showSnackbar("Department created successfully", "success");

        } catch (err) {
            alert(err?.response?.data?.message || "Creation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormModal
            open={open}
            handleClose={handleClose}
            title="Create Department"
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Create"
        >
            <TextField
                label="Department Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
        </FormModal>
    );
}
