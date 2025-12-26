import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Button, Card, CardMedia, CardContent, Stack, } from "@mui/material";

function Item() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios
      .get(`https://fakestoreapi.com/products/${id}`)
      .then((res) => setProduct(res.data));
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart");
  };

  if (!product) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Card>
        <CardMedia
          component="img"
          height="300"
          image={product.image}
          alt={product.title}
          sx={{ objectFit: "contain", p: 2 }}
        />
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {product.title}
          </Typography>

          <Typography variant="body1" color="text.secondary" gutterBottom>
            {product.description}
          </Typography>

          <Typography variant="h6" gutterBottom>
            ${product.price}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={addToCart}>
              Add to Cart
            </Button>

            <Button variant="outlined" onClick={() => navigate("/home")}>
              Back
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Item;
