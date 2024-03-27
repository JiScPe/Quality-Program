const express = require("express");
const mysql = require("mysql");
const app = express();
const bodyParser = require("body-parser");
const oilChargerRoute = require("./routes/oilcharger");
const coolingTestRoute = require("./routes/coolingtest");
const compressorRoute = require("./routes/compressor");
// ------------------------------------------------------------------------
const db1Pool = mysql.createPool({
  connectionLimit: 10,
  host: "10.35.10.78",
  user: "root",
  password: "78mes@haier",
  database: "quality_control",
});
// const db2Pool = mysql.createPool({
//   connectionLimit: 10,
//   host: "10.35.10.77",
//   user: "mes_it",
//   password: "Haier@2022",
//   database: "cosmo_im_9771",
// });
// ------------------------------------------------------------------------
//App use
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  next();
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});
// ------------------------------------------------------------------------
//Insert compressor
app.post("/Saved", (req, res) => {
  const { materialBarcode, compressorBarcode, scanTime } = req.body;
  const sql =
    "INSERT INTO compressor (material_barcode, compressor_barcode, scan_time) VALUES (?, ?, ?)";
  const values = [materialBarcode, compressorBarcode, scanTime];
  db1Pool.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error saving data to database:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    console.log("Data saved to compressor table:", result);
    res.status(200).send("Data saved successfully");
  });
});
// ------------------------------------------------------------------------
app.get("/History", (req, res) => {
  db1Pool.query(
    "SELECT material_barcode, compressor_barcode, scan_time FROM compressor WHERE DATE(scan_time) = CURDATE() ORDER BY ID DESC;",
    (error, results) => {
      if (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.json(results);
      }
    }
  );
});
// ------------------------------------------------------------------------
//Report-API
app.use('/oilcharger', oilChargerRoute);
app.use('/coolingtest', coolingTestRoute);
app.use('/compressor', compressorRoute);
// ------------------------------------------------------------------------
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});