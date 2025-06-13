require('dotenv').config();
const express = require('express');
const cors = require('cors');

const accountRoutes = require('./routes/accountRoutes');
const nftRoutes = require('./routes/nftRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', accountRoutes);
app.use('/api', nftRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
