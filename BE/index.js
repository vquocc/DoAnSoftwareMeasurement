const express = require("express");
const multer = require("multer");
const Tesseract = require('tesseract.js');
const axios = require('axios');
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const cors = require("cors");
const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
const port = 5000;

// Cho phép React gọi
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const upload = multer({ dest: "uploads/" });

app.post('/analyze', upload.single('file'), async (req, res) => {
  const file = req.file;
  let text = '';

  try {
    // 📄 Trích xuất nội dung dựa theo định dạng
    if (file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ path: file.path });
      text = result.value;
    } else if (file.mimetype === 'text/plain') {
      text = fs.readFileSync(file.path, 'utf8');
    } else if (
      file.mimetype.startsWith('image/')
    ) {
      // Xử lý ảnh bằng Tesseract OCR
      const result = await Tesseract.recognize(file.path, 'eng');
      text = result.data.text;
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Lỗi khi xử lý nội dung file' });
  } finally {
    fs.unlink(file.path, () => { }); // 🧹 Xóa file tạm
  }
console.log(text)

  // 📥 Prompt gửi đến Gemini
  const prompt = `
Dựa trên tài liệu yêu cầu phần mềm sau đây, hãy phân tích và cho biết:

1. Số lượng các chức năng phần mềm:
   - EI (External Input)
   - EO (External Output)
   - EQ (External Query)
   - ILF (Internal Logical File)
   - EIF (External Interface File)

2. Đánh giá 14 yếu tố điều chỉnh giá trị (Value Adjustment Factors - VAFs) trên thang điểm từ 0 (không liên quan) đến 5 (rất quan trọng), bao gồm:
   - Độ phức tạp của giao tiếp xử lý dữ liệu
   - Yêu cầu xử lý phân tán
   - Hiệu suất hệ thống
   - Mức độ sử dụng lại mã nguồn
   - Dễ sử dụng của người dùng cuối
   - Dễ bảo trì
   - Số lượng giao dịch và truy vấn
   - Độ phức tạp của xử lý nội bộ
   - Khả năng xử lý sai lệch và lỗi
   - Dễ thay đổi môi trường vận hành
   - Mức độ hỗ trợ đa nền tảng
   - Sự phức tạp trong cài đặt
   - Mức độ đào tạo cần thiết
   - Mức độ cập nhật và thay đổi yêu cầu

Vui lòng trả kết quả dưới dạng JSON với định dạng sau:
{
  "FunctionCounts": {
    "EI": {det: number, ftr: number},
    "EO": {det: number, ftr: number},
    "EQ": {det: number, ftr: number},
    "ILF": {det: number, ftr: number},
    "EIF": {det: number, ftr: number}
  },
  "VAF": {
    "DataCommunications": number,
    "DistributedDataProcessing": number,
    "Performance": number,
    "HeavilyUsedConfiguration": number,
    "TransactionRate": number,
    "On_lineDataEntry": number,
    "EndUserEfficiency": number,
    "On_lineUpdate": number,
    "ComplexProcessing": number,
    "Reusability": number,
    "InstallationEase": number,
    "OperationalEase": number,
    "MultipleSites": number,
    "FacilitateChange": number
  }
}

Tài liệu: """${text}"""
  `;

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsedJson = extractJsonFromGeminiResponse(result);
    res.json({ parsedJson });
  } catch (err) {
    console.error('❌ Lỗi gọi Gemini API:', err.response?.data || err.message);
    res.status(500).json({ error: 'Lỗi khi gọi Gemini API' });
  }
});

function extractJsonFromGeminiResponse(responseText) {
  const match = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (err) {
      console.error("❌ JSON parse error:", err);
    }
  }
  return null;
}

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
