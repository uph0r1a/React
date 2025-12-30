import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(`https://jsonplaceholder.typicode.com/users/${id}`)
      .then(res => setUser(res.data));
  }, [id]);

  if (!user) return <p>Loading...</p>;

  return (
    <Box sx={{ width: 400, mx: 'auto', mt: 5 }}>
      <Card>
        <CardContent>
          <Typography variant="h5">{user.name}</Typography>
          <Typography>Email: {user.email}</Typography>
          <Typography>Phone: {user.phone}</Typography>
          <Typography>Website: {user.website}</Typography>

          <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
            Back
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDetail;
