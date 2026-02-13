import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack
} from "@mui/material";

export default function FormModal({
    open,
    handleClose,
    title,
    children,
    onSubmit,
    loading = false,
    submitText = "Submit",
    maxWidth = "sm"
}) {

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth={maxWidth}
        >
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <Stack spacing={2} mt={1}>
                    {children}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={loading}
                >
                    {loading ? "Please wait..." : submitText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
