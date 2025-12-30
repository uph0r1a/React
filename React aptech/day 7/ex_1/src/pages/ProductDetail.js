import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Typography, Box, CardMedia } from '@mui/material';
import axios from 'axios';


const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const fetchProducts = async () => {
    const res = await axios.get('https://fakestoreapi.com/products');
    return res.data;
  };

  useEffect(() => {
    fetchProducts().then(data => {
      setProduct(data.find(p => p.id === parseInt(id)));
    });
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <Box sx={{ width: 400, mx: 'auto', mt: 5 }}>
      <Card>
        <CardMedia
          component="img"
          height="200"
          image={product.image}
          alt={product.title}
        />
        <CardContent>
          <Typography variant="h5">{product.title}</Typography>
          <Typography>Price: ${product.price}</Typography>
          <Typography>Category: {product.category}</Typography>
          <Typography>Description: {product.description}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductDetail;
