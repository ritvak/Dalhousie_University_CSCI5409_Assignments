const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 80;

const dbConfig = {
  host: 'db2-instance-1.cte2jn1ibpaj.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'admin123',
  database: 'productdb'
};

const pool = mysql.createPool(dbConfig);

app.use(bodyParser.json());

app.post('/store-products', (req, res) => {
  const products = req.body.products;

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Select the database
    connection.query('USE productdb', (err) => {
      if (err) {
        console.error('Error selecting database:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const insertQuery = 'INSERT INTO products (name, price, availability) VALUES ?';
      const values = products.map(product => [product.name, product.price, product.availability]);

      connection.query(insertQuery, [values], (err, results) => {
        connection.release();

        if (err) {
          console.error('Error inserting products:', err);
          return res.status(500).json({ error: 'Error inserting products' });
        }

        return res.status(200).json({ message: 'Success.' });
      });
    });
  });
});

app.get('/list-products', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const selectQuery = 'SELECT name, price, availability FROM products';

    connection.query(selectQuery, (err, results) => {
      connection.release();

      if (err) {
        console.error('Error retrieving products:', err);
        return res.status(500).json({ error: 'Error retrieving products' });
      }

      const products = results.map(row => ({
        name: row.name,
        price: row.price.toString(),
        availability: Boolean(row.availability)
      }));

      return res.status(200).json({ products });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
