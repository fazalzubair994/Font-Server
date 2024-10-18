const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve fonts from the 'fonts' directory
app.use("/get-font", express.static(path.join(__dirname, "fonts")));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "fonts");

    // Check if the 'fonts' directory exists, if not create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir); // Save files to 'fonts' directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  },
});
const upload = multer({ storage });

// Route to add a font
app.post("/add-font", upload.single("font"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.status(201).send(`Font ${req.file.originalname} uploaded successfully.`);
});

// Route to delete a font
app.delete("/delete-font/:fontName", (req, res) => {
  const fontName = req.params.fontName;
  const fontPath = path.join(__dirname, "fonts", fontName); // Ensure correct path resolution

  fs.unlink(fontPath, (err) => {
    if (err) {
      return res.status(404).send(`Font not found: ${fontName}`);
    }
    res.send(`Font ${fontName} deleted successfully.`);
  });
});

// Route to list available fonts
app.get("/fonts", (req, res) => {
  const fontsDir = path.join(__dirname, "fonts");

  // Check if fonts directory exists
  if (!fs.existsSync(fontsDir)) {
    return res.status(404).send("Fonts directory not found.");
  }

  fs.readdir(fontsDir, (err, files) => {
    if (err) {
      return res.status(500).send("Error reading fonts directory.");
    }

    // Filter only font files (optional)
    const fontFiles = files.filter((file) =>
      /\.(ttf|woff|woff2|otf)$/.test(file)
    );
    res.json(fontFiles);
  });
});

// Route to provide information about all available routes
app.get("/routes-info", (req, res) => {
  const routesInfo = [
    {
      route: "/get-font/{fontName}",
      method: "GET",
      description: "Retrieve a font file by its name from the server.",
    },
    {
      route: "/add-font",
      method: "POST",
      description:
        "Upload a new font file to the server. (Multipart file upload required).",
      example:
        "curl -X POST -F 'font=@path/to/font.ttf' http://localhost:3000/add-font",
    },
    {
      route: "/delete-font/{fontName}",
      method: "DELETE",
      description: "Delete a font by its name from the server.",
      example: "curl -X DELETE http://localhost:3000/delete-font/fontName.ttf",
    },
    {
      route: "/fonts",
      method: "GET",
      description: "List all available font files on the server.",
    },
  ];

  res.json(routesInfo);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
