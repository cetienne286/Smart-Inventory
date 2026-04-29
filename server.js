const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'optical_portal'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/api/orders', (req, res) => {
  const sql = `
    SELECT 
      o.order_id,
      p.name AS patient,
      d.name AS doctor,
      s.name AS store,
      l.name AS lab,
      pr.frame,
      pr.lens,
      o.status
    FROM Orders o
    JOIN Patient p ON o.patient_id = p.patient_id
    JOIN Prescription rx ON o.prescription_id = rx.prescription_id
    JOIN Doctor d ON rx.doctor_id = d.doctor_id
    JOIN Store s ON o.store_id = s.store_id
    JOIN Lab l ON o.lab_id = l.lab_id
    JOIN Product pr ON o.product_id = pr.product_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Query failed' });
    }
    res.json(results);
  });
});

app.get('/api/patients', (req, res) => {
  db.query('SELECT * FROM Patient', (err, results) => {
    if (err) return res.status(500).json({ error: 'Query failed' });
    res.json(results);
  });
});

app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM Product', (err, results) => {
    if (err) return res.status(500).json({ error: 'Query failed' });
    res.json(results);
  });
});

app.get('/api/prescriptions', (req, res) => {
  db.query('SELECT * FROM Prescription', (err, results) => {
    if (err) return res.status(500).json({ error: 'Query failed' });
    res.json(results);
  });
});

app.post('/api/orders', (req, res) => {
  const {
    patient_id,
    prescription_id,
    store_id,
    lab_id,
    product_id,
    order_date,
    status
  } = req.body;

  const sql = `
    INSERT INTO Orders
    (patient_id, prescription_id, store_id, lab_id, product_id, order_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [patient_id, prescription_id, store_id, lab_id, product_id, order_date, status],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Insert failed' });
      res.json({ message: 'Order created successfully', order_id: result.insertId });
    }
  );
});

app.put('/api/orders/:id/status', (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  db.query(
    'UPDATE Orders SET status = ? WHERE order_id = ?',
    [status, orderId],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Update failed' });
      res.json({ message: 'Order status updated successfully' });
    }
  );
});

app.post('/api/orders', (req, res) => {
  const {
    patient_id,
    prescription_id,
    store_id,
    lab_id,
    product_id,
    order_date,
    status
  } = req.body;

  const sql = `
    INSERT INTO Orders
    (patient_id, prescription_id, store_id, lab_id, product_id, order_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [patient_id, prescription_id, store_id, lab_id, product_id, order_date, status],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Insert failed' });
      }
      res.json({
        message: 'Order created successfully',
        order_id: result.insertId
      });
    }
  );
});

app.put('/api/orders/:id/status', (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const sql = 'UPDATE Orders SET status = ? WHERE order_id = ?';

  db.query(sql, [status, orderId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Update failed' });
    }
    res.json({ message: 'Order status updated successfully' });
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});