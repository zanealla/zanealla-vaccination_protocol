// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');
const PROTOCOLS_FILE = path.join(DATA_DIR, 'protocols.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize protocols file if it doesn't exist
if (!fs.existsSync(PROTOCOLS_FILE)) {
  fs.writeFileSync(PROTOCOLS_FILE, JSON.stringify({
    protocols: {
      "default": {
        name: "Protocole par défaut",
        description: "Protocole de vaccination standard pour poules pondeuses",
        farmName: "Ma Ferme",
        doctorName: "Dr. Veterinaire",
        hatchDate: new Date().toISOString().split('T')[0],
        vaccines: [
          {
            "id": 1,
            "age": 1,
            "name": "HVT ND IBD + RESPENSE + MA5CLON30",
            "method": "Injection SC",
            "notes": "",
            "image": "",
            "completed": true,
            "customDate": "2025-09-07"
          },
          {
            "id": 2,
            "age": 7,
            "name": "H9 ND",
            "method": "Injection SC",
            "notes": "",
            "image": "",
            "completed": true,
            "customDate": "2025-09-13"
          },
          {
            "id": 3,
            "age": 14,
            "name": "AVINEW + H120",
            "method": "Spray",
            "notes": "",
            "image": "",
            "completed": true,
            "customDate": "2025-09-20"
          },
          {
            "id": 4,
            "age": 21,
            "name": "IBD",
            "method": "Eau de boisson",
            "notes": "",
            "image": "",
            "completed": true,
            "customDate": "2025-09-27"
          },
          {
            "id": 5,
            "age": 28,
            "name": "MA5COLNE30",
            "method": "Spray",
            "notes": "",
            "image": "",
            "completed": true,
            "customDate": "2025-10-04"
          },
          {
            "id": 6,
            "age": 42,
            "name": "H5ND",
            "method": "Injection IM",
            "notes": "",
            "image": "",
            "completed": true,
            "customDate": "2025-10-18"
          },
          {
            "id": 7,
            "age": 56,
            "name": "NEMOVAC",
            "method": "Spray",
            "notes": "",
            "image": "",
            "completed": true,
            "customDate": "2025-11-02"
          },
          {
            "id": 8,
            "age": 63,
            "name": "Variole Aviaire + ND IB EDS",
            "method": "Aile piquage",
            "notes": "",
            "image": "",
            "completed": false,
            "customDate": "2025-11-09"
          },
          {
            "id": 9,
            "age": 77,
            "name": "H120 + AVINEW ",
            "method": "Spray",
            "notes": "",
            "image": "",
            "completed": false,
            "customDate": "2025-11-20"
          },
          {
            "id": 10,
            "age": 85,
            "name": "H5ND",
            "method": "Injection IM",
            "notes": "",
            "image": "",
            "completed": false,
            "customDate": "2025-11-28"
          },
          {
            "id": 1762104198537,
            "age": 100,
            "name": "ENCEFAL VAC",
            "method": "Eau de boisson",
            "notes": "",
            "image": "",
            "completed": false,
            "customDate": "2025-12-12"
          },
          {
            "id": 1762104223666,
            "age": 115,
            "name": "H9 + MEGAMUNE",
            "method": "Injection IM",
            "notes": "",
            "image": "",
            "completed": false,
            "customDate": "2025-12-27"
          }
        ]
      }
    },
    currentProtocol: "default"
  }, null, 2));
}

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Get all protocols data
app.get('/api/protocols', (req, res) => {
  try {
    const data = fs.readFileSync(PROTOCOLS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading protocols:', err);
    res.status(500).json({ error: 'Failed to read protocols data' });
  }
});

// Save all protocols data
app.post('/api/protocols', (req, res) => {
  try {
    const data = JSON.stringify(req.body, null, 2);
    fs.writeFileSync(PROTOCOLS_FILE, data, 'utf8');
    res.json({ message: 'Protocols saved successfully' });
  } catch (err) {
    console.error('Error saving protocols:', err);
    res.status(500).json({ error: 'Failed to save protocols data' });
  }
});

// Export individual protocol
app.get('/api/protocol/export/:protocolId', (req, res) => {
  try {
    const { protocolId } = req.params;
    const data = fs.readFileSync(PROTOCOLS_FILE, 'utf8');
    const protocolsData = JSON.parse(data);
    
    if (!protocolsData.protocols[protocolId]) {
      return res.status(404).json({ error: 'Protocol not found' });
    }
    
    const protocol = protocolsData.protocols[protocolId];
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${protocol.name.replace(/[^a-z0-9]/gi, '_')}.json"`);
    res.send(JSON.stringify(protocol, null, 2));
  } catch (err) {
    console.error('Error exporting protocol:', err);
    res.status(500).json({ error: 'Failed to export protocol' });
  }
});

// Import protocol
app.post('/api/protocol/import', (req, res) => {
  try {
    const { protocol, name } = req.body;
    const data = fs.readFileSync(PROTOCOLS_FILE, 'utf8');
    const protocolsData = JSON.parse(data);
    
    // Generate unique ID
    const protocolId = 'protocol_' + Date.now();
    
    // Add imported protocol
    protocolsData.protocols[protocolId] = {
      ...protocol,
      name: name || protocol.name
    };
    
    // Save updated protocols
    fs.writeFileSync(PROTOCOLS_FILE, JSON.stringify(protocolsData, null, 2), 'utf8');
    
    res.json({ 
      message: 'Protocol imported successfully',
      protocolId: protocolId
    });
  } catch (err) {
    console.error('Error importing protocol:', err);
    res.status(500).json({ error: 'Failed to import protocol' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});