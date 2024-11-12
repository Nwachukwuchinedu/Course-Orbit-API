import mongoose from "mongoose";

// Define the Course schema
const courseSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: String,
  image: String,
  description: String,
  id_name: String,
  instructional_level_simple: String,
  instructors: Array,
  coupon_max_uses: Number,
  coupon_uses_remaining: Number,
  coupon_code: String,
  caption_languages: Array,
  content_info_short: String,
  has_certificate: Boolean,
  has_closed_caption: Boolean,
  headline: String,
  num_lectures: Number,
  primary_category: String,
  primary_subcategory: String,
  rating: Number,
  requirements_data: Array,
  target_audiences: Array,
  what_you_will_learn_data: Array,
  num_reviews: Number,
  language: String,
  instructional_level_simple: String,
});

// Create the model
const Course = mongoose.model("Course", courseSchema);

export default Course
