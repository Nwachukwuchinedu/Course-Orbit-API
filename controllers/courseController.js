import puppeteer from "puppeteer-extra";
import chromium from "@sparticuz/chromium";

const courses = async (req, res) => {
  const apiUrl = "https://courson.xyz/load-more-coupons"; // Replace with actual external API URL
  const { filters, offset } = req.body; // Get filters and offset from the POST request

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

    // Set headers and user agent to mimic a real browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Open the API URL
    await page.goto(apiUrl, { waitUntil: "networkidle2" });

    // Fill in the necessary form data and send the POST request from the page
    const response = await page.evaluate(
      (postData) => {
        return fetch(window.location.href, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        }).then((res) => res.json());
      },
      { filters, offset } // Send the filters and offset in the POST data
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

    // Send the gathered data array as a JSON response
    res.json(allData);
    await browser.close();
  } catch (error) {
    console.error("Error in Puppeteer:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export default courses;
