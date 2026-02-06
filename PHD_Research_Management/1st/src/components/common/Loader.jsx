import { motion } from 'framer-motion'
import logo from '/logo.png'
import { Box } from '@mui/material'

const Loader = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f6f8'
      }}
    >
      <motion.img
        src={logo}
        alt="logo"
        style={{ width: 120 }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </Box>
  )
}

export default Loader