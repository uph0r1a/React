import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Typography, Box } from '@mui/material';
import axios from 'axios';


const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const fetchUsers = async () => {
    const res = await axios.get('https://jsonplaceholder.typicode.com/users');
    return res.data;
  };

  useEffect(() => {
    fetchUsers().then(data => {
      setUser(data.find(u => u.id === parseInt(id)));
    });
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDetail;
