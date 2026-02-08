import { Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, color }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Paper
                sx={{
                    padding: 3,
                    borderRadius: 3,
                    borderLeft: `6px solid ${color}`,
                    transition: "0.25s",
                    '&:hover': {
                        transform: "translateY(-6px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
                    }
                }}
            >
                <Typography
                    sx={{
                        color,
                        fontWeight: 700,
                        fontSize: 14
                    }}
                >
                    {title}
                </Typography>

                <Typography variant="h5" fontWeight={700}>
                    {value}
                </Typography>

            </Paper>
        </motion.div>
    )
}