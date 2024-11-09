import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Now you can access the environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const GROUP_CHAT_ID = process.env.GROUP_CHAT_ID;

// Initialize bot
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// Store already seen IDs to avoid duplicate messages
let loggedIds = new Set();
let currentOffset = 30; // Start with an initial offset

// Controller function to send updates to Telegram
const sendTelegramUpdates = async (req, res) => {
  const apiUrl = process.env.COURSES_API_1; // Replace with the actual external API URL

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offset: currentOffset, // Send the current offset with the request
      }),
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Log data to check structure

    // Check if `data` is an array before calling `.filter()`
    if (!Array.isArray(data)) {
      throw new TypeError("Expected data to be an array");
    }

    // Filter new entries and only take the first three
    const newEntries = data
      .filter((item) => !loggedIds.has(item.id))
      .slice(0, 3);

    if (newEntries.length > 0) {
      for (const entry of newEntries) {
        const messageContent = `
<b>🖥️ ${entry.title}</b>

📝 ${entry.headline}
⏳ ${entry.content_info_short}
🆓 ${entry.coupon_uses_remaining} Enrolls Left
⭐ ${entry.rating || "0"} ${entry.num_reviews} ratings
📂 ${entry.primary_category}.${entry.primary_subcategory}
        `;

        // Options for sending the image with the formatted caption and button
        const options = {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Enroll Now 🚀",
                  url: `https://www.udemy.com/course/${entry.id_name}/?couponCode=${entry.coupon_code}`,
                },
              ],
            ],
          },
        };

        // Send the image with the caption and inline button
        await bot.sendPhoto(GROUP_CHAT_ID, entry.image, {
          caption: messageContent,
          ...options,
        });

        console.log(`Message sent for course: ${entry.title}`);

        // Mark entry as logged to prevent duplicate messages
        loggedIds.add(entry.id);
      }

      // Increase the offset by 30 for the next batch
      currentOffset += 30;
    } else {
      console.log("No new data to send, resetting offset to 30");
      currentOffset = 30; // Reset to the starting offset
      loggedIds.clear(); // Optionally clear the set to restart data tracking
    }

    if (res) res.status(200).send("Data processed successfully");
  } catch (err) {
    console.error("Error fetching or sending data:", err);
    if (res) res.status(500).send("Error processing data");
  }
};

// Schedule to call the controller function every 60 seconds
setInterval(async () => {
  await sendTelegramUpdates();
}, 60000);

// Export the controller as the default export
export default sendTelegramUpdates;
