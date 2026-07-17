# 📚 Bookstore Management Application

A full-stack, responsive bookstore application built with the MERN (MongoDB, Express.js, React, Node.js) stack. It features a complete user interface for managing books, favorites, shopping carts, and orders, along with dedicated admin workflows.

---

## 🚀 Features

### **User Features**
- **User Authentication**: Secure sign-up and login with hashed passwords (bcrypt) and JWT-based session handling.
- **Book Discovery**: View all books, detail views, and recently added books.
- **Favorites Management**: Add/remove books to/from your personal favorites page.
- **Shopping Cart**: Manage items, calculate total pricing, and prepare for checkout.
- **Order Placement**: Place orders and view complete purchase history with status updates.
- **Profile Customization**: Update user details and delivery addresses directly in the settings panel.

### **Admin Features**
- **Book Administration**: Add, update, and manage book listings (title, author, price, description, language, and cover image).
- **Order Management**: Oversee all user orders, view customer information, and update delivery statuses (e.g., "Placed", "Out for Delivery", "Delivered", "Cancelled").

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19 (via Vite)
- **State Management**: Redux Toolkit & React-Redux
- **Styling**: Tailwind CSS v4 (using `@tailwindcss/vite`)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios (for communication with backend APIs)
- **Icons**: React Icons

### **Backend**
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (connected using Mongoose)
- **Security**: JSON Web Tokens (JWT) for authorization, BcryptJS for password hashing
- **Middleware**: CORS, JSON parser

---

## 📂 Project Structure

```text
BOOK-STORE/
├── backend/
│   ├── connections/      # Database configuration & Mongoose connection setup
│   ├── models/           # Mongoose schemas (Book, User, Order)
│   ├── routes/           # Express API endpoints grouped by controller
│   ├── app.js            # Express server entry point
│   ├── package.json      # Backend dependencies & scripts
│   └── .env              # Environment configurations
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Navbar, Footer, BookCard, Loaders)
│   │   ├── pages/        # Views (Home, AllBooks, Profile, Cart, Signup, Login)
│   │   ├── store/        # Redux store slices (Auth management)
│   │   ├── App.jsx       # Main layout & router settings
│   │   └── main.jsx      # Vite entry point
│   ├── package.json      # Frontend dependencies & configurations
│   └── vite.config.js    # Vite configuration
│
└── README.md             # Project documentation
```

---

## 🔧 Getting Started

### **Prerequisites**
Make sure you have [Node.js](https://nodejs.org/) (v16+ recommended) and a running instance of MongoDB (or a MongoDB Atlas URI) ready.

### **Backend Setup**

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory (a template is provided below):
   ```env
   PORT=1000
   URI="your_mongodb_connection_uri"
   ```

4. Start the backend development server (using nodemon):
   ```bash
   npm run dev
   # or
   nodemon app.js
   ```

---

### **Frontend Setup**

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).

---

## 🔌 API Endpoints Summary

All backend API paths are prefixed with `/api/v1`.

### **Auth & User Routes** (`/api/v1/`)
- `POST /sign-up` - Create a new account.
- `POST /sign-in` - Login and receive a JWT.
- `GET /get-user-information` - Fetch authenticated user profile data (requires token).
- `PUT /update-address` - Update delivery address (requires token).

### **Book Routes** (`/api/v1/`)
- `POST /add-book` - Add a new book listing (Admin only).
- `PUT /update-book` - Edit details of an existing book (Admin only).
- `DELETE /delete-book` - Remove a book from the bookstore (Admin only).
- `GET /get-all-books` - Retrieve all available books.
- `GET /get-recent-books` - Retrieve recently added books.
- `GET /get-book-by-id/:id` - Fetch details for a specific book.

### **Favorites Routes** (`/api/v1/`)
- `PUT /add-book-to-favourite` - Add a book to favorites (requires token).
- `PUT /delete-book-from-favourite` - Remove a book from favorites (requires token).
- `GET /get-favourite-books` - Fetch all favorite books for the user (requires token).

### **Cart Routes** (`/api/v1/`)
- `PUT /add-to-cart` - Add a book to the user's shopping cart (requires token).
- `PUT /delete-from-cart/:bookid` - Remove a book from the cart (requires token).
- `GET /get-user-cart` - Fetch all items in the user's cart (requires token).

### **Order Routes** (`/api/v1/`)
- `POST /place-order` - Checkout/place an order from the cart items (requires token).
- `GET /get-order-history` - View personal order history (requires token).
- `GET /get-all-orders` - Retrieve all orders in the system (Admin only).
- `PUT /update-status/:id` - Update delivery status of a specific order (Admin only).
