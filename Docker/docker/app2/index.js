const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
const PORT = 6006;

let hasProductHeader = false;
let hasAmountHeader = false;
let hasMatchingProduct = false;
app.use(express.json());

app.post('/calculate', (req, res) => {
  const { file, product } = req.body;

  if (!file || !product) {
    return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
  }

  if (!fs.existsSync(file)) {
    return res.status(404).json({ file, error: 'File not found.' });
  }

  let hasData = false;
  let hasCSVFormat = true;

  const results = [];

  fs.createReadStream(file)
    .pipe(csv())
    .on('headers', (headers) => {
      if (headers.includes('product')) {
        hasProductHeader = true;
      }
      if (headers.includes('amount')) {
        hasAmountHeader = true;
      }
    })
    .on('data', (data) => {
      if (!hasProductHeader || !hasAmountHeader) {
        hasMatchingProduct = false;
        hasCSVFormat = false;
        return;
      }
      if (!data.product || !data.amount) { 
        hasCSVFormat = false;
        return;
      }
      if (data.product === product) {
        hasMatchingProduct = true;
        const amount = parseInt(data.amount);
        if (!isNaN(amount)) {
          results.push(amount);
          hasData = true;
        }
      }
    })
    .on('end', () => {
      if (!hasCSVFormat) {
        return res
          .status(500)
          .json({ file, error: 'Input file not in CSV format.' });
      }

      if (!hasProductHeader || !hasAmountHeader) {
        return res
          .status(500)
          .json({ file, error: 'Input file not in CSV format.' });
      }

      if (!hasMatchingProduct) {
        return res.json({ file: file.substring(file.lastIndexOf('/') + 1), sum: 0 });
      }

      if (!hasData) {
        return res
          .status(500)
          .json({ file: file.substring(file.lastIndexOf('/') + 1), error: 'No matching amounts found.' });
      }

      const sum = results.reduce((acc, curr) => acc + curr, 0);

      return res.json({ file: file.substring(file.lastIndexOf('/') + 1), sum });
    });
});

app.listen(PORT, () => {
  console.log(`Container 2 listening on port ${PORT}`);
});

