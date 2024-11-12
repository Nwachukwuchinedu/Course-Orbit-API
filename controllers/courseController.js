import Course from "../models/courseModel.js";

// Controller to get a specific course by ID
const getCourseById = async (req, res) => {
  const { courseId } = req.params;

  try {
    // Find the course in the database based on the provided ID
    const course = await Course.findOne({ id: courseId });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Return the course data as JSON
    res.status(200).json(course);
  } catch (error) {
    console.error("Error retrieving course data:", error);
    res.status(500).json({
      message: "Failed to retrieve course",
      error: error.message,
    });
  }
};

export default getCourseById;
