import { motion } from 'framer-motion';
import logo from "../assets/logo.png";

export default function Loader () {
    return (
        <div style={{
            height:'100vh',
            display:'flex',
            justifyContent:'centre',
            alignItems: 'centre',
            flexDirection: 'column'
        }}>
            <motion.img
                src={logo}
                alt='logo'
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 90 }}
            />
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                PHD Research Portal
            </motion.h2>
        </div>
    );
}