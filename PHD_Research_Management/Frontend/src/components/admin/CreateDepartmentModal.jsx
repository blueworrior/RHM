import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    DialogActions
} from "@mui/material";

import { createDepartment } from "../../api/adminApi";

export default function CreateDepartmentModal({ open, handleClose, refresh }) {

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return;

        try {
            setLoading(true);

            await createDepartment({ name });

            setName("");
            handleClose();

            //reload department table
            refresh();
        } catch (err) {
            alert(err?.response?.data?.message || 'Error creating department');
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
            <DialogTitle>Create Department</DialogTitle>

            <DialogContent>
                <TextField
                    label='Department Name'
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mt: 2 }}
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
                    {loading ? "Creating..." : "Create"}
                </Button>
            </DialogActions>

        </Dialog>
    )
}