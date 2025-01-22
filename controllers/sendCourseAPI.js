import dotenv from "dotenv";
dotenv.config();

// Store already seen IDs to avoid duplicate processing
let loggedIds = new Set();
let currentOffset = 30; // Start with an initial offset
let intervalRunning = false; // Flag to ensure only one interval runs

// Controller function to fetch and process courses
const fetchCourses = async (req, res) => {
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

       const rawResponse = await response.text(); // Get raw response as text

         // Check if the response is empty or not JSON
       if (
         !rawResponse ||
         response.headers.get("Content-Type") !== "application/json"
       ) {
         console.warn(
           "Response is not valid JSON or is empty. Skipping parsing."
         );
         if (res) res.status(204).send("No valid data received");
         return [];
       }

       const data = JSON.parse(rawResponse);

    // Check if `data` is an array
    if (!Array.isArray(data)) {
      throw new TypeError("Expected data to be an array");
    }

    // Filter new entries and only take the first three
    const newEntries = data
      .filter((item) => !loggedIds.has(item.id))
      .slice(0, 3);

    // Mark entries as logged
    newEntries.forEach((entry) => {
      console.log(entry.title);

      loggedIds.add(entry.id);
    });

    if (newEntries.length > 0) {
      // Increase the offset by 30 for the next batch
      currentOffset += 30;
    } else {
      // Reset offset and clear logged IDs if no new data
      console.log("No new data, resetting offset and clearing logged IDs.");
      currentOffset = 30;
      loggedIds.clear();
    }

    if (res) res.status(200).json(newEntries);
    return newEntries;
  } catch (err) {
    console.error("Error fetching data:", err);
    if (res) res.status(500).send("Error processing data");
  }
};

// Function to initialize the interval
// const startInterval = () => {
//   if (!intervalRunning) {
//     intervalRunning = true;
//     setInterval(async () => {
//       await fetchCourses();
//     }, 90000); // 90 seconds
//     console.log("Interval started!");
//   } else {
//     console.log("Interval already running!");
//   }
// };
export { fetchCourses };
