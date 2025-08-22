// Fetch images from Pexels API by category
exports.getPexelsImages = async (req, res) => {
  try {
    const { category, perPage } = req.query;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    const images = await aiClient.getPexelsImages(
      category,
      perPage ? parseInt(perPage) : 5
    );
    res.json(images);
  } catch (error) {
    console.error("Error fetching images from Pexels:", error);
    res.status(500).json({ message: "Failed to fetch images from Pexels" });
  }
};
const Content = require("../models/content");
const aiClient = require("../aiClient");

// Generate image using AI
exports.generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate request
    if (!prompt) {
      return res.status(400).json({ message: "Image prompt is required" });
    }

    // Generate image using AI
    const { imageData, description } = await aiClient.generateImage(prompt);

    // Save to database
    const newContent = new Content({
      topic: prompt,
      type: "image",
      content: description,
      imageUrl: imageData,
    });

    const savedContent = await newContent.save();

    res.status(201).json(savedContent);
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ message: "Failed to generate image" });
  }
};

// Generate content using AI
exports.generateContent = async (req, res) => {
  try {
    let topic = req.body.topic;
    let type = req.body.type;
    let fileContent = null;

    // If a file is uploaded, read its content
    if (req.file) {
      const fs = require("fs");
      const path = require("path");
      const filePath = req.file.path;
      fileContent = fs.readFileSync(filePath, "utf-8");
      topic = topic || req.file.originalname;
      type = type || "file";
    }

    // Validate request
    if ((!topic || !type) && !fileContent) {
      return res
        .status(400)
        .json({ message: "Topic and type or file are required" });
    }

    // Generate content using AI or save direct content
    let generatedContent;
    if (fileContent) {
      generatedContent = await aiClient.generateContentFromFile(
        fileContent,
        type
      );
    } else if (req.body.content) {
      generatedContent = req.body.content;
    } else {
      generatedContent = await aiClient.generateContent(topic, type);
    }

    // Save to database
    const newContent = new Content({
      topic,
      type,
      content: generatedContent,
      imageUrl: req.body.imageUrl, // Add image URL if provided
    });

    const savedContent = await newContent.save();

    res.status(201).json(savedContent);
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ message: "Failed to generate content" });
  }
};

// Get all contents
exports.getAllContents = async (req, res) => {
  try {
    const contents = await Content.find().sort({ createdAt: -1 });
    res.json(contents);
  } catch (error) {
    console.error("Error fetching contents:", error);
    res.status(500).json({ message: "Failed to fetch contents" });
  }
};

// Get content by ID
exports.getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ message: "Failed to fetch content" });
  }
};
