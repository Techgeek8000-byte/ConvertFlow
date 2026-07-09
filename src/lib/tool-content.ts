// ConvertFlow — Tool page intro text + FAQ data
export const toolContent: Record<string, { intro: string; faqs: { question: string; answer: string }[] }> = {
  'csv-to-json': {
    intro: 'Convert CSV (comma-separated values) data into clean, structured JSON in seconds. Paste your CSV or upload a .csv file, and our free converter handles quoted fields, embedded commas, and multi-line values correctly — producing valid JSON arrays of objects. Perfect for developers importing spreadsheet data into APIs, migrating databases, or preprocessing data for JavaScript applications.',
    faqs: [
      { question: 'How does CSV to JSON conversion work?', answer: 'Our parser reads each CSV row, uses the first row as JSON object keys (headers), and maps subsequent rows as values. Nested quotes, commas within quoted fields, and Windows/Unix line endings are all handled automatically. The output is a standard JSON array.' },
    ],
  },
  'json-to-csv': {
    intro: 'Export your JSON data to CSV format for Excel, Google Sheets, or database imports. Paste a JSON array of objects, and get a properly formatted CSV with headers from the object keys. Fields with commas or quotes are automatically escaped. Ideal for data analysts, developers, and anyone who needs spreadsheet-compatible output from JSON APIs.',
    faqs: [
      { question: 'What JSON format does the converter expect?', answer: 'Your JSON must be an array of objects, like [{"name":"Alice","age":30},{"name":"Bob","age":25}]. Each object becomes a CSV row, and the keys of the first object become the CSV column headers. Nested objects are flattened where possible.' },
    ],
  },
  'json-formatter': {
    intro: 'Format, validate, and beautify messy JSON data instantly. Paste compressed or malformed JSON and get properly indented, syntax-highlighted, human-readable output. Also minifies JSON to remove whitespace for production use. Catches syntax errors like missing commas, unmatched brackets, and trailing commas. A must-have for every developer\'s toolkit.',
    faqs: [
      { question: 'What is the difference between JSON formatting and minifying?', answer: 'Formatting (beautifying) adds indentation, line breaks, and spacing to make JSON readable for humans. Minifying removes all unnecessary whitespace to make the file as small as possible for production — reducing bandwidth and parse time.' },
    ],
  },
  'image-converter': {
    intro: 'Convert images between PNG, JPEG, WebP, GIF, BMP, and SVG formats — right in your browser. Upload any image and download it in your target format in seconds. No uploads to any server, no quality loss from re-encoding (unless changing format), and support for batch conversion. Perfect for web developers optimizing images, designers converting file types, and anyone managing digital photos.',
    faqs: [
      { question: 'Which image format should I use for the web?', answer: 'WebP offers the best compression-to-quality ratio for modern websites. JPEG is best for photographs, PNG for images requiring transparency or sharp text, and SVG for logos and icons. Use our converter to batch-optimize all your images.' },
      { question: 'Will converting between formats reduce image quality?', answer: 'Converting between lossy formats (JPEG, WebP) may introduce slight quality loss with each conversion. Converting from lossy to lossless (PNG) does not recover lost quality. For best results, start from the highest quality source available.' },
    ],
  },
};
