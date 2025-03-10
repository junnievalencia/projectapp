# Backend Integration Guide for BuFood Orders

This document outlines how the frontend application interfaces with the backend API.

## API Setup

The frontend is configured to communicate with the backend API using the following structure:

- Base URL: `http://localhost:3001/api` (development) or `https://api.bufood.com/api` (production)
- Authentication: JWT tokens stored in localStorage
- Timeout: 10 seconds (development) or 30 seconds (production)

## Environment Configuration

The application uses environment variables to configure API settings:

- `.env` - Development environment settings
- `.env.production` - Production environment settings

You can modify these files to point to your actual backend API.

## API Services

The frontend uses service modules to interact with the backend API. Each service corresponds to a specific domain:

### Authentication (`auth.service.js`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/send-otp` | POST | Send OTP for verification during registration |
| `/auth/verify-otp` | POST | Verify OTP code entered by user |
| `/auth/register` | POST | User registration |
| `/auth/me` | GET | Get current user profile |
| `/auth/logout` | POST | User logout |
| `/auth/profile` | PUT | Update user profile |

### Cart (`cart.service.js`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cart` | GET | Get current cart |
| `/cart/items` | POST | Add item to cart |
| `/cart/items/:id` | PUT | Update cart item quantity |
| `/cart/items/:id` | DELETE | Remove item from cart |
| `/cart` | DELETE | Clear cart |
| `/cart/total` | GET | Get cart total |
| `/orders/checkout` | POST | Checkout cart |

### Food/Restaurants (`food.service.js`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/restaurants/featured` | GET | Get featured restaurants |
| `/restaurants` | GET | Get all restaurants |
| `/restaurants/:id` | GET | Get restaurant details |
| `/restaurants/:id/menu` | GET | Get restaurant menu items |
| `/food/:id` | GET | Get food item details |
| `/categories` | GET | Get food categories |
| `/food/search` | GET | Search food items |

### Orders (`order.service.js`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/orders` | GET | Get order history |
| `/orders/:id` | GET | Get order details |
| `/orders` | POST | Place new order |
| `/orders/:id/cancel` | PUT | Cancel order |
| `/orders/:id/track` | GET | Track order status |
| `/orders/:id/review` | POST | Rate and review order |

## Required Backend Responses

Each API endpoint should return data in the following format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Success message (optional)"
}
```

For errors:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Authentication Flow

1. User enters credentials and calls `/auth/login`
2. Backend validates credentials and returns a JWT token
3. Frontend stores token in localStorage
4. Subsequent API requests include the token in the Authorization header
5. If a 401 response is received, user is redirected to login

## Implementation Steps

1. Set up your backend server with the required API endpoints
2. Configure CORS on the backend to allow requests from your frontend
3. Implement JWT authentication
4. Ensure API responses follow the expected format
5. Update the frontend environment variables to point to your backend API

## Testing Integration

You can test the integration by:

1. Running the backend server
2. Setting the correct API URL in `.env`
3. Running the frontend application
4. Using the browser dev tools to monitor API requests/responses

## Common Issues

- CORS errors: Ensure your backend allows requests from the frontend origin
- Authentication errors: Check that tokens are properly generated and validated
- Data format mismatch: Verify that API responses match what the frontend expects