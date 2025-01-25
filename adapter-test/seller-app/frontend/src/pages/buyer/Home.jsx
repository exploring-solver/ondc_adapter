import { Typography, Card, CardContent, Grid, Button, Box } from "@mui/material";
import { Search, ShoppingCart, Receipt } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function BuyerHome() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Search fontSize="large" style={{ color: "#4CAF50" }} />,
      title: "Search Products",
      description: "Browse through our extensive catalog.",
      path: "/buyer/search",
    },
    {
      icon: <ShoppingCart fontSize="large" style={{ color: "#FF9800" }} />,
      title: "Shopping Cart",
      description: "Easily view and manage your cart items.",
      path: "/buyer/cart",
    },
    {
      icon: <Receipt fontSize="large" style={{ color: "#2196F3" }} />,
      title: "Orders",
      description: "Track your past and current orders seamlessly.",
      path: "/buyer/orders",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <Box
        className="hero-section"
        sx={{
          py: 8,
          textAlign: "center",
          background: "linear-gradient(90deg, #6D83F2, #4EADF2)",
          color: "white",
          borderRadius: "0 0 50px 50px",
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
          Welcome to Woo-Chill Marketplace
        </Typography>
        <Typography variant="h6" sx={{ mb: 4 }}>
          Your one-stop destination for all your shopping needs!
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            background: "#FF9800",
            color: "white",
            "&:hover": { background: "#F57C00" },
          }}
        >
          Explore Now
        </Button>
      </Box>

      {/* Intro Section */}
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: "600", color: "#333", mb: 1 }}>
          Discover, Shop, and Enjoy
        </Typography>
        <Typography variant="body1" sx={{ color: "#666", maxWidth: "700px", mx: "auto" }}>
          ONDC Marketplace offers a wide range of products with seamless browsing, a user-friendly
          interface, and secure transactions. Start your shopping journey today!
        </Typography>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} justifyContent="center" sx={{ px: 4, pb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              onClick={() => navigate(feature.path)}
              className="cursor-pointer hover:shadow-xl transition-transform transform hover:scale-105"
              sx={{
                background: "linear-gradient(145deg, #ffffff, #f9f9f9)",
                borderRadius: "20px",
                boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    mb: 2,
                    mx: "auto",
                    width: 80,
                    height: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "#f5f5f5",
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: "600", color: "#333", mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#777", mb: 2 }}>
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    background: "#4CAF50",
                    color: "white",
                    "&:hover": { background: "#388E3C" },
                  }}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
