import puppeteer from "puppeteer-extra";
import chromium from "@sparticuz/chromium";

// In-memory cache for storing excess courses
let cachedCourses = [];

const courses = async (req, res) => {
  const apiUrl = "https://courson.xyz/load-more-coupons"; // Replace with actual external API URL

  // Check if client requested new data or wants more courses from the cache
  if (cachedCourses.length >= 10) {
    // Send 10 items from cache to the frontend
    const coursesToSend = cachedCourses.slice(0, 10);
    cachedCourses = cachedCourses.slice(10); // Remove the sent items from cache

    res.status(200).json(coursesToSend);
  } else {
    // Fetch new 30 items from the external API
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

      const response = await page.evaluate(() =>
        fetch(window.location.href, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }).then((res) => res.json())
      );

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
      }));

      // Send the first 20 items to the frontend and cache the remaining 10
      cachedCourses = allData.slice(10); // Store the last 10 items in the cache
      res.status(200).json(allData.slice(0, 10)); // Send the first 20 items

      await browser.close();
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Failed to fetch courses." });
    }
  }
};

export default courses;
