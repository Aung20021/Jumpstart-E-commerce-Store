import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Image data is required" });
  }

  try {
    // Step 1: Upload Base64 image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBase64}`,
      { folder: "product-descriptions" }
    );

    const imageUrl = uploadResponse.secure_url;

    // Step 2: Request description from OpenRouter
    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-medium-3",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "In 2–3 sentences, describe the good qualities of the product shown in this image as if promoting it to customers.",
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await aiResponse.json();
    console.log("OpenRouter response:", data);

    if (!aiResponse.ok) {
      return res.status(400).json({
        error: data.error?.message || "OpenRouter API error",
      });
    }

    const description =
      data.choices?.[0]?.message?.content || "No description generated.";

    res.status(200).json({ description });
  } catch (error) {
    console.error("Error generating description:", error);
    res.status(500).json({ error: "Failed to generate description." });
  }
}
