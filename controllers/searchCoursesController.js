import Course from "../models/courseModel.js";

// Controller to search for courses
export const searchCourses = async (req, res) => {
  try {
    const searchTerm = req.query.q || "";

    // Use a regular expression for partial matching (case-insensitive)
    const courses = await Course.find({
      title: { $regex: searchTerm, $options: "i" },
    }).select("id title image");

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching courses found",
      });
    }

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search for courses",
      error: error.message,
    });
  }
};
