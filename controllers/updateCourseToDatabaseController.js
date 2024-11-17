import puppeteer from "puppeteer-extra";
import chromium from "@sparticuz/chromium";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";

dotenv.config();

// Function to fetch and upload courses to the database at intervals
const fetchAndUploadCourses = async () => {
  const apiUrl = process.env.COURSES_API;
  let offset = 30;

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto(apiUrl, { waitUntil: "networkidle2" });

    const fetchData = async () => {
      const response = await page.evaluate(
        (offset) =>
          fetch(window.location.href, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ offset }),
          }).then((res) => res.json()),
        offset
      );

      const coursesData = response["coupons"];
      console.log(response["total_count"]);
      
      if (!coursesData) {
        throw new Error(
          "Invalid response structure or 'coupons' field missing."
        );
      }

      const coursePromises = coursesData.map(async (course) => {
        const updatedCourse = {
          id: Math.floor((course.id * 101) / 99),
          title: course.title,
          image: course.image,
          description: course.description,
          id_name: course.id_name,
          instructional_level_simple: course.instructional_level_simple,
          instructors: course.instructors,
          coupon_max_uses: course.coupon_max_uses,
          coupon_uses_remaining: course.coupon_uses_remaining,
          coupon_code: course.coupon_code,
          caption_languages: course.caption_languages,
          content_info_short: course.content_info_short,
          has_certificate: course.has_certificate,
          has_closed_caption: course.has_closed_caption,
          headline: course.headline,
          num_lectures: course.num_lectures,
          primary_category: course.primary_category,
          primary_subcategory: course.primary_subcategory,
          rating: course.rating,
          requirements_data: course.requirements_data,
          target_audiences: course.target_audiences,
          what_you_will_learn_data: course.what_you_will_learn_data,
          num_reviews: course.num_reviews,
          language: course.language,
          badges: course.badges,
        };

        // Log the course ID
        // console.log(`Offset: ${offset}, Course ID: ${updatedCourse.id}`);

        // Save or update the course in MongoDB
        return Course.updateOne(
          { id: updatedCourse.id },
          { $set: updatedCourse },
          { upsert: true }
        );
      });

      await Promise.all(coursePromises);

      // Increment the offset for the next fetch
      offset += 30; // Increase by 30 for each new batch
      if (offset >= 300) {
       offset = 30;
      }
    };

    // Schedule the task to run every 5 seconds
    setInterval(fetchData, 5000);

    // Close the browser after a suitable time or manual handling
 
  } catch (error) {
    console.error("Error fetching and uploading courses:", error);
  }
};

// Start the interval process
fetchAndUploadCourses();

export default fetchAndUploadCourses;