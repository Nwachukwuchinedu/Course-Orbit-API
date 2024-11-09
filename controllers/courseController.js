import puppeteer from "puppeteer-extra";
import chromium from "@sparticuz/chromium";
import dotenv from "dotenv";
dotenv.config();

const courses = async (req, res) => {
  const apiUrl = process.env.COURSES_API; // Replace with the actual external API URL
  const offset = req.body.offset || 30; // Use the offset from the request or default to 30

  try {
    // Launch Puppeteer with Chromium configurations for server environments
    //  const browser = await puppeteer.launch({ headless: true });
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

    // Navigate to the API URL and wait for the page to load
    await page.goto(apiUrl, { waitUntil: "networkidle2" });

    // Extract data by simulating a fetch request in the page's context with the provided offset
    const response = await page.evaluate(
      (offset) =>
        fetch(window.location.href, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ offset }),
        }).then((res) => res.json()),
      offset // Pass the offset as an argument to the evaluate function
    );

    // Extract course data from the response
    const coursesData = response["coupons"];
    const allData = coursesData.map((course) => ({
      id: atob(String(course.id)),
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
      primary_subcategory: course.primary_subcategory,
    }));

    // Close the browser
    await browser.close();

    // Send the fetched courses to the frontend
    res.status(200).json(allData);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export default courses;
