import { Typography, Card, CardContent, Grid } from "@mui/material";
import {  Search, ShoppingCart, Receipt } from "@mui/icons-material";
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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Header */}
      <Typography
        variant="h4"
        className="mb-8 text-center font-bold"
        style={{
          fontWeight: "bold",
          color: "#333",
          letterSpacing: "1px",
        }}
      >
        Welcome to ONDC Marketplace
      </Typography>

      {/* Feature Cards */}
      <Grid container spacing={4} justifyContent="center">
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              className="cursor-pointer hover:shadow-2xl transition-transform transform hover:scale-105"
              onClick={() => navigate(feature.path)}
              style={{
                background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                borderRadius: "12px",
              }}
            >
              <CardContent className="text-center">
                <div
                  className="mb-4 flex justify-center items-center"
                  style={{
                    backgroundColor: "#F5F5F5",
                    borderRadius: "50%",
                    width: "70px",
                    height: "70px",
                    margin: "0 auto",
                  }}
                >
                  {feature.icon}
                </div>
                <Typography
                  variant="h6"
                  className="mb-2"
                  style={{ fontWeight: "600", color: "#333" }}
                >
                  {feature.title}
                </Typography>
                <Typography color="textSecondary" style={{ fontSize: "0.9rem" }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
