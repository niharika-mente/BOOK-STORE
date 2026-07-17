const router = require("express").Router();
const User = require("../models/user");
const { authenticateToken } = require("./userAuth");

// ──────────────────────────────────────────────
// ADD / INCREMENT a book in cart
// Headers: id (userId), bookid
// Body (optional): { quantity } — defaults to 1
// ──────────────────────────────────────────────
router.put("/add-to-cart", authenticateToken, async (req, res) => {
  try {
    const { bookid, id } = req.headers;
    const qty = parseInt(req.body?.quantity) || 1;

    const userData = await User.findById(id);

    const existingItem = userData.cartItems.find(
      (item) => item.book.toString() === bookid
    );

    if (existingItem) {
      // Book already in cart — increase quantity
      await User.findOneAndUpdate(
        { _id: id, "cartItems.book": bookid },
        { $inc: { "cartItems.$.quantity": qty } }
      );
      return res.json({
        status: "Success",
        message: `Quantity updated in cart`,
      });
    }

    // New item — push with quantity
    await User.findByIdAndUpdate(id, {
      $push: { cartItems: { book: bookid, quantity: qty } },
    });

    return res.json({
      status: "Success",
      message: "Book added to cart",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// ──────────────────────────────────────────────
// UPDATE quantity of a cart item
// Headers: id (userId)
// Params: bookid
// Body: { quantity }
// ──────────────────────────────────────────────
router.put("/update-cart-quantity/:bookid", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.params;
    const { id } = req.headers;
    const qty = parseInt(req.body?.quantity);

    if (!qty || qty < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const userData = await User.findById(id);
    const item = userData.cartItems.find(
      (item) => item.book.toString() === bookid
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await User.findOneAndUpdate(
      { _id: id, "cartItems.book": bookid },
      { $set: { "cartItems.$.quantity": qty } }
    );

    return res.json({
      status: "Success",
      message: "Cart quantity updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// ──────────────────────────────────────────────
// REMOVE a book from cart entirely
// ──────────────────────────────────────────────
router.put("/remove-from-cart/:bookid", authenticateToken, async (req, res) => {
  try {
    const { bookid } = req.params;
    const { id } = req.headers;

    await User.findByIdAndUpdate(id, {
      $pull: { cartItems: { book: bookid } },
    });

    return res.json({
      status: "Success",
      message: "Book removed from cart",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

// ──────────────────────────────────────────────
// GET cart for a user (populated)
// Returns: [{ book: {...bookFields}, quantity }]
// ──────────────────────────────────────────────
router.get("/get-user-cart", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;

    const userData = await User.findById(id).populate("cartItems.book");

    // Reverse so newest items appear first
    const cart = [...userData.cartItems].reverse();

    return res.json({
      status: "Success",
      data: cart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;