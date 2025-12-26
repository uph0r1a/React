import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent, Divider, Stack, } from "@mui/material";

function Cart() {
  const navigate = useNavigate();
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const clearCart = () => {
    localStorage.removeItem("cart");
    navigate("/home");
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>

      {cart.length === 0 ? (
        <Typography color="text.secondary">
          Cart is empty
        </Typography>
      ) : (
        <>
          <Stack spacing={2}>
            {cart.map((item, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Typography variant="h6">
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary">
                    ${item.price}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5">
            Total: ${totalPrice.toFixed(2)}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="error"
              onClick={clearCart}
            >
              Clear Cart
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/home")}
            >
              Back Home
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}

export default Cart;
