import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/connection';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/dist'));
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'frontend/dist' });
  });
}

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
