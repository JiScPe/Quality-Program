const express = require('express');
const mysql = require('mysql');
const app = express();

// Database 1 connection configuration
const db1Config = {
    connectionLimit: Infinity,
    host: '10.35.10.78',
    user: 'root',
    password: '78mes@haier',
    database: 'quality_control'
};
// Database 2 connection configuration
const db2Config = {
    connectionLimit: Infinity,
    host: '10.35.10.77',
    user: 'mes_it',
    password: 'Haier@2022',
    database: 'cosmo_im_9771'
};


// Create connections to both databases
const db1_charge = mysql.createConnection(db1Config);
const db1_cooling = mysql.createConnection(db1Config);
const db1_compressor = mysql.createConnection(db1Config);
const db2_9771 = mysql.createConnection(db2Config);

// Connect to databases
db1_charge.connect(err => {
    if (err) {
        console.error('Error connecting to 10.35.10.78 - oilcharger:', err);
        return;
    }
    console.log('Connected to 10.35.10.78 - oilcharger');
});

db1_cooling.connect(err => {
    if (err) {
        console.error('Error connecting to 10.35.10.78 - coolingtest:', err);
        return;
    }
    console.log('Connected to 10.35.10.78 - coolingtest');
});

db1_compressor.connect(err => {
    if (err) {
        console.error('Error connecting to 10.35.10.78 - compressor:', err);
        return;
    }
    console.log('Connected to 10.35.10.78 - compressor');
});

db2_9771.connect(err => {
    if (err) {
        console.error('Error connecting to 10.35.10.77 - MES9771:', err);
        return;
    }
    console.log('Connected to 10.35.10.77 - MES9771');
});


// API endpoint to join data from both databases
app.get('/oilcharger', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Query data from Database 1
    const query1 = 'SELECT model, barcode, datetime, program, r600_setpoint, r600_actum, status, alarm FROM oilcharger';
    db1_charge.query(query1, (err1, result1) => {
        if (err1) {
            console.error('Error querying data from Database - oilcharger:', err1);
            res.status(500).send('Error querying data from Database - oilcharger');
            return;
        }

        // Query data from Database 2
        const query2 = 'SELECT WorkUser_MOrderCode, WorkUser_BarCode, WorkUser_LineName FROM bns_pm_operation';
        db2_9771.query(query2, (err2, result2) => {
            if (err2) {
                console.error('Error querying data from Database - MES9771:', err2);
                res.status(500).send('Error querying data from Database - MES9771');
                return;
            }

            // Perform the join operation
            const joinedData = joinData_charge(result1, result2);
            res.json(joinedData);
        });
    });
});

app.get('/coolingtest', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Query data from Database 1
    const query1 = 'SELECT model, barcode, StartTime, Remark FROM cooling_test';
    db1_cooling.query(query1, (err1, result1) => {
        if (err1) {
            console.error('Error querying data from Database - coolingtest:', err1);
            res.status(500).send('Error querying data from Database - coolingtest');
            return;
        }

        // Query data from Database 2
        const query2 = 'SELECT WorkUser_MOrderCode, WorkUser_BarCode, WorkUser_LineName FROM bns_pm_operation';
        db2_9771.query(query2, (err2, result2) => {
            if (err2) {
                console.error('Error querying data from Database - MES9771:', err2);
                res.status(500).send('Error querying data from Database - MES9771');
                return;
            }

            // Perform the join operation
            const joinedData = joinData_cooling(result1, result2);
            res.json(joinedData);
        });
    });
});

app.get('/compressor', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Query data from Database 1
    const query1 = 'SELECT * FROM compressor';
    db1_cooling.query(query1, (err1, result1) => {
        if (err1) {
            console.error('Error querying data from Database - compressor:', err1);
            res.status(500).send('Error querying data from Database - compressor');
            return;
        }

        // Query data from Database 2
        const query2 = 'SELECT WorkUser_MOrderCode, WorkUser_BarCode, WorkUser_LineName FROM bns_pm_operation';
        db2_9771.query(query2, (err2, result2) => {
            if (err2) {
                console.error('Error querying data from Database - MES9771:', err2);
                res.status(500).send('Error querying data from Database - MES9771');
                return;
            }

            // Query data from Database 1 again
            const query3 = 'SELECT model FROM oilcharger';
            db1_charge.query(query3, (err3, result3) => {
                if (err3) {
                    console.error('Error querying data from Database - oilcharger:', err3);
                    res.status(500).send('Error querying data from Database - oilcharger');
                    return;
                }

                // Perform the join operation
                const joinedData = joinData_compressor(result1, result2, result3);
                res.json(joinedData);
            });
        });
    });
});


// Function to join data based on common field (barcode = WorkUser_BarCode)
function joinData_charge(data1, data2) {
    const joinedData = [];
    const map = new Map();
    
    // Store data from Database 2 in a map for quick lookup
    data2.forEach(entry => {
        map.set(entry.WorkUser_BarCode, entry);
    });

    // Perform the join operation
    data1.forEach(entry => {
        const matchingEntry = map.get(entry.barcode);
        if (matchingEntry) {
            const joinedEntry = {
                ...entry,
                ...matchingEntry
            };
            joinedData.push(joinedEntry);
        }
    });
    return joinedData;
}

function joinData_cooling(data1, data2) {
    const joinedData = [];
    const map = new Map();
    
    // Store data from Database 2 in a map for quick lookup
    data2.forEach(entry => {
        map.set(entry.WorkUser_BarCode, entry);
    });

    // Perform the join operation
    data1.forEach(entry => {
        const matchingEntry = map.get(entry.barcode);
        if (matchingEntry) {
            const joinedEntry = {
                ...entry,
                ...matchingEntry
            };
            joinedData.push(joinedEntry);
        }
    });
    return joinedData;
}

function joinData_compressor(data1, data2, data3) {
    const joinedData = [];
    const map = new Map();
    
    // Store data from Database 2 in a map for quick lookup
    data2.forEach(entry => {
        map.set(entry.WorkUser_BarCode, entry);
    });

    data3.forEach(entry2 => {
        map.set(entry2.barcode, entry2);
    });

    // Perform the join operation
    data1.forEach(entry => {
        const matchingEntry = map.get(entry.material_barcode);
        if (matchingEntry) {
            const joinedEntry = {
                ...entry,
                ...entry2,
                ...matchingEntry
            };
            joinedData.push(joinedEntry);
        }
    });
    return joinedData;
}


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});