const fs = require("fs");
const { exec } = require("child_process");
const PDFDocument = require("pdfkit");

const pdfPath = "./Booklet-Final.pdf";
const outputDir = "./pages/";

// Check if output directory exists, if not create it
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Execute the command to convert PDF to images using GhostScript
exec(
  `gs -dNOPAUSE -sDEVICE=jpeg -r144 -o ${outputDir}PAGE_%03d.jpg ${pdfPath}`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    // Get list of generated image files
    const imageFiles = fs.readdirSync(outputDir);

    // Group images into pairs of opposite pages
    const pairs = [];
    for (let i = 0; i < imageFiles.length / 2; i++) {
      pairs.push([imageFiles[i], imageFiles[imageFiles.length - 1 - i]]);
    }

    // Create a new PDF with landscape pages
    const pdfDoc = new PDFDocument({ layout: "landscape" });
    const outputStream = fs.createWriteStream("./landscape_booklet.pdf");

    pdfDoc.pipe(outputStream);

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const leftPagePath = `${outputDir}${pair[i % 2 ? 0 : 1]}`;
      const rightPagePath = `${outputDir}${pair[i % 2 ? 1 : 0]}`;

      pdfDoc
        .addPage()
        .image(leftPagePath, 0, 0, {
          width: pdfDoc.page.width / 2,
          height: pdfDoc.page.height
        })
        .image(rightPagePath, pdfDoc.page.width / 2, 0, {
          width: pdfDoc.page.width / 2,
          height: pdfDoc.page.height
        });
    }

    pdfDoc.end();

    console.log("Landscape PDF created successfully!");
  }
);
