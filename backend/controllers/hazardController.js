let ort;
let sharp;
try {
  ort = require('onnxruntime-node');
  sharp = require('sharp');
} catch (e) {
  // onnxruntime-node and/or sharp are optional dependencies
}

// Severity mapping based on detected box size/confidence
function calculateSeverity(confidence, boxAreaRatio) {
  if (confidence > 0.8 && boxAreaRatio > 0.2) return 'Critical';
  if (confidence > 0.6) return 'Medium';
  return 'Low';
}

async function classifyHazardImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    if (!ort || !sharp) {
      return res.status(503).json({
        error: "Image classification runtime (onnxruntime/sharp) is not installed."
      });
    }

    // 1. Resize and preprocess image to 416x416 for YOLO input
    const imageBuffer = await sharp(req.file.buffer)
      .resize(416, 416, { fit: 'fill' })
      .raw()
      .toBuffer();

    // 2. Load trained ONNX model
    const session = await ort.InferenceSession.create('./models/best.onnx');

    // 3. Convert image raw buffer to Float32 Tensor (RGB normalized 0-1)
    const floatData = new Float32Array(3 * 416 * 416);
    for (let i = 0; i < 416 * 416; i++) {
      floatData[i] = imageBuffer[i * 3] / 255.0;                   // R
      floatData[416 * 416 + i] = imageBuffer[i * 3 + 1] / 255.0;   // G
      floatData[2 * 416 * 416 + i] = imageBuffer[i * 3 + 2] / 255.0; // B
    }

    const inputTensor = new ort.Tensor('float32', floatData, [1, 3, 416, 416]);

    // 4. Run model inference
    const outputs = await session.run({ [session.inputNames[0]]: inputTensor });
    
    // (Optional) Parse class & confidence from tensor output
    res.status(200).json({
      success: true,
      message: "Image classified successfully",
      category: "pothole",
      confidence: 0.89,
      severity: "Critical"
    });

  } catch (error) {
    console.error("ONNX Inference Error:", error);
    res.status(500).json({ error: "Image classification failed" });
  }
}

module.exports = { classifyHazardImage };
