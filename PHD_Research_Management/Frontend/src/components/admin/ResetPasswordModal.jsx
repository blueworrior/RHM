import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    DialogActions
} from "@mui/material";

import { resetUserPassword } from "../../api/adminApi";
import { useSnackbar } from "../../context/SnackbarContext";

export default function ResetPasswordModal({ open, handleClose, userId, refresh }) {

    const [password, setPassword] = useState("");
    const [conPassword, setConPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const {showSnackbar } = useSnackbar();

    const handleSubmit = async () => {

        
        if(password.length < 8){
            return showSnackbar("Password must be at least 8 characters", "error");
        }
        
        if(password !== conPassword){
            return showSnackbar("Password did not match", "error");
        }

        try{
            setLoading(true);

            await resetUserPassword(userId, { password });

            showSnackbar("Password reset successfully", "error");

            setPassword("");
            handleClose();
            refresh();

        }catch(err){
            showSnackbar(err?.response?.data?.message || "Reset failed", "error");
        }
        finally{
            setLoading(false);
        }
    };

    return(
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>

            <DialogTitle>Reset Password</DialogTitle>

            <DialogContent>
                <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    sx={{mt:2}}
                />
                <TextField
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    value={conPassword}
                    onChange={(e)=>setConPassword(e.target.value)}
                    sx={{mt:2}}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Resetting..." : "Reset"}
                </Button>
            </DialogActions>

        </Dialog>
    );
}
