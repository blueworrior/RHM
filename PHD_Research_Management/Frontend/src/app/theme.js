import { createTheme } from '@mui/material/styles'

const theme = createTheme({

    palette: {
        primary: {
            main: '#B11226', // University red
        },
        secondary: {
            main: '#1a1a1a',
        },
        background: {
            default: '#f4f6f8',
        }
    },

    typography: {
        fontFamily: 'Inter, sans-serif',
        h4: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        }
    },

    shape: {
        borderRadius: 12,
    }

})

export default theme
