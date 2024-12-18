const express = require("express");
const puppeteer1 = require("puppeteer-extra");
const chromium = require("@sparticuz/chromium");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { JSDOM } = require("jsdom");

const app = express();
const PORT = process.env.PORT || 3000;

puppeteer1.use(StealthPlugin());

// app.get("/scrape", async (req, res) => {
//   const url = "https://m.forasm.com/blog";

//   if (!url) {
//     return res.status(400).json({ error: "URL parameter is required" });
//   }

//   try {
//     // const browser = await puppeteer.launch({
//     //   args: [
//     //     "--disable-setuid-sandbox",
//     //     "--no-sandbox",
//     //     "--single-process",
//     //     "--no-zygote",
//     //   ],
//     //   executablePath: await chromium.executablePath(),
//     //   headless: chromium.headless,
//     // });

//     const browser = await puppeteer1.launch({ headless: true });

//     const page = await browser.newPage();
//     await page.setRequestInterception(true);
//     page.on("request", (request) => {
//       const resourceType = request.resourceType();
//       const reqUrl = request.url();

//       // Block images, stylesheets, and fonts
//       if (
//         resourceType === "image" ||
//         resourceType === "stylesheet" ||
//         resourceType === "font"
//       ) {
//         request.abort();
//       }
//       // Block ads (scripts that include 'ads' in the URL)
//       else if (resourceType === "script" && reqUrl.includes("ads")) {
//         request.abort();
//       } else {
//         request.continue();
//       }
//     });

//     // Go to the URL
//     await page.goto(url, { waitUntil: "networkidle2" });

//     // Extract the href attribute and text content
//     const data = await page.evaluate(() => {
//       const allCoursesContainer = document.querySelectorAll(".block-inner")[5];
//       const courseContainer = allCoursesContainer.querySelectorAll(".p-wrap");

//       let idCounter = 1;
//       const eachCourseContainer = Array.from(courseContainer).map((item) => {
//         return {
//           id: idCounter++,
//           link: item.querySelector(".p-flink").href,
//           image: item.querySelector("img").src,
//           hashTag: item.querySelector(".p-category").textContent,
//           title: item.querySelector(".p-url").textContent,
//         };
//       });

//       return { eachCourseContainer };
//     });

//     await browser.close();

//     // Send the data as JSON
//     if (data) {
//       res.json(data);
//     } else {
//       res.status(404).json({ error: "Elements not found" });
//     }
//   } catch (error) {
//     console.error("Error scraping the site:", error);
//     res.status(500).json({ error: "Error scraping the site" });
//   }
// });

app.get("/scrape", async (req, res) => {
  try {
    const url = "https://courson.xyz/coupons";

    // Launch Puppeteer1
    // const browser = await puppeteer1.launch({
    //   args: [
    //     "--disable-setuid-sandbox",
    //     "--no-sandbox",
    //     "--single-process",
    //     "--no-zygote",
    //   ],
    //   executablePath: await chromium.executablePath(),
    //   headless: chromium.headless,
    // });
    const browser = await puppeteer1.launch({ headless: true }); // Set headless to false for debugging
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle2" });

    // Get the page content
    const html = await page.content();

    // Parse the HTML content using JSDOM
    const { document } = new JSDOM(html).window;

    // Scrape dynamic content
    const title = document.title || "No title found";
    const headings = document.querySelectorAll(".course-preview-link");

    const scrapedData = {
      page_title: title,
      courses: [],
    };

    if (headings.length === 0) {
      return res.status(404).json({
        error:
          "No course preview links found. Check the HTML structure and selectors.",
        title: title,
      });
    }

    headings.forEach((element, index) => {
      const coursePreview = element.querySelector(".course-preview");
      const coursePreviewLink = element.getAttribute("href");

      const img = coursePreview.querySelector(".card-img-top")
        ? coursePreview.querySelector(".card-img-top").src
        : "No image found";
      const cardBodyPreview = coursePreview.querySelector(".card-body-preview");
      const previewWrap = cardBodyPreview
        ? cardBodyPreview.querySelector(".preview-wrap")
        : null;

      const previewTitle =
        previewWrap?.querySelector(".preview-title")?.textContent.trim() ||
        "No title";
      const hashTag =
        previewWrap?.querySelector(".category-preview")?.textContent.trim() ||
        "No hash tag";

      const insPreview =
        previewWrap?.querySelector(".ins-preview")?.textContent.trim() ||
        "No instructor";
      const revPreview =
        previewWrap?.querySelector(".rev-preview")?.textContent.trim() ||
        "No reviews";
      const rateText =
        previewWrap?.querySelector(".rate-text")?.textContent.trim() ||
        "No rating";

      scrapedData.courses.push({
        id: index + 1,
        course_title: previewTitle,
        img: img,
        ins_preview: insPreview,
        rev_preview: revPreview,
        rate_text: rateText,
        link: coursePreviewLink,
        hashTag: hashTag,
      });
    });

    // Close the browser
    await browser.close();

    // Return the scraped data as a JSON response
    return res.json(scrapedData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
