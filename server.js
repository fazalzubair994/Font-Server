const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

app.use("/get-font", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Adjust this to allow specific domains in production
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
}, express.static(path.join(__dirname, "fonts")));


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "fonts"); // Save files to 'fonts' directory
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
  const fontPath = path.join(__dirname, "fonts", fontName);

  fs.unlink(fontPath, (err) => {
    if (err) {
      return res.status(404).send("Font not found: " + err);
    }
    res.send(`Font ${fontName} deleted successfully.`);
  });
});

// Route to list available fonts
app.get("/fonts", (req, res) => {
  fs.readdir(path.join(__dirname, "fonts"), (err, files) => {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
