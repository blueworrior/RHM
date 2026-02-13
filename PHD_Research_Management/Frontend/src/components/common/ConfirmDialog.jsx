import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from "@mui/material";

export default function ConfirmDialog({
    open,
    handleClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure?",
    confirmText = "Confirm",
    color = "error"
}) {

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>

            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <Typography>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions>

                <Button onClick={handleClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    color={color}
                    onClick={() => {
                        onConfirm();
                        handleClose();
                    }}
                >
                    {confirmText}
                </Button>

            </DialogActions>

        </Dialog>
    );
}
