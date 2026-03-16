const express = require('express');
const cors = require('cors');
const promptRoutes = require('./routes/prompts');
const workflowRoutes = require('./routes/workflows');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/prompts', promptRoutes);
app.use('/api/workflows', workflowRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`PromptFlow API running on http://localhost:${PORT}`);
});
