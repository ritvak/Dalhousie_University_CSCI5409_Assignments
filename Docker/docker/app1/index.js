const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 6000;

app.use(express.json());

app.post('/calculate', async (req, res) => {
  const { file, product } = req.body;

  if (!file || !product) {
    return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
  }

  try {   
    const response = await axios.post('http://container_2:6006/calculate', {
      file: `/app/filedata/${file}`, 
      product,
    });

    const fileName = file.substring(file.lastIndexOf('/') + 1);

    return res.json({ file: fileName, sum: response.data.sum });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ file, error: 'File not found.' });
    } else if (error.response && error.response.status === 500) {
      return res
        .status(500)
        .json({ file, error: 'Input file not in CSV format.' });
    } else {
      return res
        .status(500)
        .json({ file, error: 'Internal server error.' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Container 1 listening on port ${PORT}`);
});
