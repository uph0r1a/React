import { Box, Grid, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Dashboard
            </Typography>

            <Grid container spacing={2} mt={4}>
                <Grid item>
                    <Button variant="contained" onClick={() => navigate('/users')}>
                        Manage Users
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="secondary" onClick={() => navigate('/products')}>
                        Manage Products
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
