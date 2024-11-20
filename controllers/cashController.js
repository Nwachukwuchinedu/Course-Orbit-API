import User from "../models/User.js"; // Adjust the path to your model if needed

// Generate a random whole number between 1000 and 3000, rounded to 3 significant figures
const generateRandomAmount = () => {
  const randomNumber = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000; // Random whole number between 1000 and 3000
  return Number(randomNumber.toPrecision(3)); // Round to 3 significant figures
};

export const updateCashByEmail = async (req, res) => {
  const { email } = req.body; // Email is expected in the request body

  try {
    const user = await User.findOne({ email }); // Find user by email

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.cash > 0) {
      // Check if the user already has a discount (cash > 0)
      return res
        .status(201)
        .json({ message: "You can't get a discount more than once.", discount: user.cash });
    }

    const randomCash = generateRandomAmount(); // Generate new cash amount

    // Update user's cash
    user.cash = randomCash;
    await user.save();

    res
      .status(200)
      .json({ message: "Discount applied successfully", discount: randomCash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
