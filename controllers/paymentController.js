// controllers/paymentController.js
import User from "../models/User.js";

export const togglePaidStatus = async (req, res) => {
  const { email } = req.body; // Assuming you pass the email to identify the user

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle the 'paid' status
    user.paid = !user.paid;

    // Save the updated user
    await user.save();

    return res
      .status(200)
      .json({ message: "User payment status updated", paid: user.paid });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
