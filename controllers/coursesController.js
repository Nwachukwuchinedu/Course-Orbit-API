import puppeteer from "puppeteer-extra";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";
import chromium from "@sparticuz/chromium";
dotenv.config();

const courses = async (req, res) => {
  const apiUrl = process.env.COURSES_API;
  const offset = req.body.offset || 30;

  try {
    // const browser = await puppeteer.launch({ headless: true });
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto(apiUrl, { waitUntil: "networkidle2" });

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
    if (!coursesData) {
      throw new Error("Invalid response structure or 'coupons' field missing.");
    }

    const updatedCourses = [];

    for (const course of coursesData) {
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
        instructional_level_simple: course.instructional_level_simple,
      };

      // Save or update the course in MongoDB and store it in the array
      await Course.updateOne(
        { id: updatedCourse.id },
        { $set: updatedCourse },
        { upsert: true }
      );
      updatedCourses.push(updatedCourse);
    }

    await browser.close();

    // Return only the courses that were sent to the database
    res.status(200).json(updatedCourses);
  } catch (error) {
    console.error("Error fetching course data:", error);
    res.status(500).json({
      message: "Failed to fetch or store courses",
      error: error.message,
    });
  }
};

export default courses;
