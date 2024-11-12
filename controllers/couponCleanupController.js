import Course from "../models/courseModel.js";

// Controller to check and delete courses with coupon_uses_remaining = 0
export const cleanupCoupons = async () => {
  try {
    // Find and delete courses with coupon_uses_remaining of 0
    const deletedCount = await Course.deleteMany({ coupon_uses_remaining: 0 });

    console.log(
      `Deleted ${deletedCount.deletedCount} courses with coupon_uses_remaining = 0`
    );
  } catch (error) {
    console.error(
      "Error deleting courses with coupon_uses_remaining = 0:",
      error
    );
  }
};
