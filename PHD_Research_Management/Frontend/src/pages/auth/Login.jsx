import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../api/authApi'
import { useAuth } from '../../context/AuthContext'
import { Box, TextField, Typography, Button, Paper } from '@mui/material'
import { motion } from 'framer-motion'
import logo from '../../assets/logo.png'   // ✅ safer path
import { useSnackbar } from '../../context/SnackbarContext'

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async () => {

        // 🔥 basic frontend validation
        if (!email || !password) {
            showSnackbar("Please enter email and password", "error")
            return
        }

        try {

            setLoading(true);

            const data = await loginUser({ email, password });

            // save user in context + localStorage
            login(data);

            const role = data.role || data?.user?.role;   // ✅ SAFE ACCESS

            if (!role) {
                throw new Error("Role missing in response")
            }

            // 🔥 clean redirect pattern
            navigate(`/${role}`, { replace: true });
            showSnackbar("Login successfully", "success");

        } catch (error) {

            console.error(error)
            showSnackbar("Invalid email or password", "error");

        } finally {

            setLoading(false);

        }
    }


    return (
        <Box
            sx={{
                height: '100vh',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
            }}
        >

            {/* LEFT SIDE */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #B11226, #7A0C1A)',
                    color: 'white',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <motion.img
                    src={logo}
                    style={{ width: 140 }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                />

                <Typography variant="h4" fontWeight={700}>
                    PhD Research Portal
                </Typography>

                <Typography sx={{ opacity: 0.85 }}>
                    University Management System
                </Typography>
            </Box>


            {/* RIGHT SIDE */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f4f6f8',
                    p: 2
                }}
            >

                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >

                    <Paper
                        elevation={6}
                        sx={{
                            padding: 5,
                            width: {
                                xs: '90%',
                                sm: 380
                            },
                            borderRadius: 3
                        }}
                    >

                        <Typography variant="h5" mb={3} fontWeight={600}>
                            Login
                        </Typography>

                        <TextField
                            label="Email"
                            fullWidth
                            sx={{ mb: 2 }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />


                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            sx={{ mb: 3 }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />


                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>

                    </Paper>
                </motion.div>

            </Box>

        </Box>

    )
}

export default Login
