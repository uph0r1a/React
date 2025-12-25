import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Button, Card, CardContent, CircularProgress, Container, Grid, Tab, Tabs, Toolbar, Typography, } from "@mui/material";

function DashboardPage() {
  const navigate = useNavigate();
  const [tabActive, setTabActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  const getProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://fakestoreapi.com/products");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://fakestoreapi.com/users");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    getUsers();
    getProducts();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f6fa" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Tabs
          value={tabActive}
          onChange={(e, newValue) => setTabActive(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Quản lý người dùng" />
          <Tab label="Quản lý sản phẩm" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tabActive === 0 && (
              <Grid container spacing={2}>
                {users.map((user) => (
                  <Grid item xs={12} md={6} lg={4} key={user.id}>
                    <Card>
                      <CardContent>
                        <Typography fontWeight={600}>
                          {user.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.name.firstname} {user.name.lastname}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {tabActive === 1 && (
              <Grid container spacing={2}>
                {products.map((product) => (
                  <Grid item xs={12} md={6} lg={4} key={product.id}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography fontWeight={600}>
                          {product.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${product.price}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default DashboardPage;
