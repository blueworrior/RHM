import { createContext, useContext, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" // success | error | warning | info
    });

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleClose = () => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={handleClose}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </SnackbarContext.Provider>
    );
};
