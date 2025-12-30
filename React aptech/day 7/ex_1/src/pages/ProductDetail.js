import { Card, CardContent, Typography, CardMedia, Box, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios
      .get(`https://fakestoreapi.com/products/${id}`)
      .then(res => setProduct(res.data));
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
          <Typography variant="h6">{product.title}</Typography>
          <Typography>Price: ${product.price}</Typography>
          <Typography>Category: {product.category}</Typography>
          <Typography sx={{ mt: 1 }}>
            {product.description}
          </Typography>

          <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
            Back
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductDetail;
