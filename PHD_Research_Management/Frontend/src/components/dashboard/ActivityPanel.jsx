import { Paper, Typography, Box } from "@mui/material";

export default function ActivityPanel(){

    const activities = [
        "New student registered",
        "Supervisor approved proposal",
        "Thesis submitted for evaluation",
        "Examiner assigned"
    ];

    return(
        <Paper sx={{padding:3, borderRadius:3}}>

            <Typography fontWeight={700} mb={2}>
                Recent Activity
            </Typography>

            {activities.map((act, i)=>(
                <Box
                    key={i}
                    sx={{
                        padding:1.5,
                        borderRadius:2,
                        mb:1,
                        background:"#fafafa"
                    }}
                >
                    {act}
                </Box>
            ))}

        </Paper>
    )
}
