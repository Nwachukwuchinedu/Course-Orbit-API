import { promises as fs } from "fs";

fs.readFile("data.json", "utf8")
  .then((data) => {
    const jsonData = JSON.parse(data);
    const d = jsonData["coupons"][0]
    const newData = {
      id: atob(String(d.id)),
      title: d.title,
      image: d.image,
      description: d.description,
      id_name: d.id_name,
      instructional_level_simple: d.instructional_level_simple,
      instructors: d.instructors,
      coupon_max_uses: d.coupon_max_uses,
      coupon_uses_remaining: d.coupon_uses_remaining,
      coupon_code: d.coupon_code,
      caption_languages: d.caption_languages,
      content_info_short: d.content_info_short,
      has_certificate: d.has_certificate,
      has_closed_caption: d.has_closed_caption,
      headline: d.headline,
      num_lectures: d.num_lectures,
      primary_category: d.primary_category,
      primary_subcategory: d.primary_subcategory,
      rating: d.rating,
      requirements_data: d.requirements_data,
      target_audiences: d.target_audiences,
      what_you_will_learn_data: d.what_you_will_learn_data,
      who_should_attend_data: d.who_should_attend_data,
      who_should_attend_data: d.who_should_attend_data,
      who_should_attend_data: d.who_should_attend_data,
      who_should_attend_data: d.who_should_attend_data,
    };
    console.log(newData);
  })
  .catch((error) => {
    console.error("There was a problem with reading the file:", error);
  });
