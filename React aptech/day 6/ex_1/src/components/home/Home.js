import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent, CardMedia, Grid, Stack, } from "@mui/material";

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("https://fakestoreapi.com/products")
      .then((res) => setProducts(res.data));
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, p: 2 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="contained" onClick={() => navigate("/cart")}>
          Go to Cart
        </Button>
        <Button variant="outlined" color="error" onClick={logout}>
          Logout
        </Button>
      </Stack>

      <Typography variant="h4" gutterBottom>
        Products
      </Typography>

      <Grid container spacing={3}>
        {products.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardMedia
                component="img"
                image={p.image}
                alt={p.title}
                sx={{ objectFit: "contain", height: 200, p: 2 }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {p.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  ${p.price}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate(`/detailItem/${p.id}`)}
                >
                  See Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Home;
