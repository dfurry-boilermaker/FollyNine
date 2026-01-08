import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Basic monitoring middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Serve static files from public directory
app.use(express.static('public'));

// Serve Vercel Analytics packages for browser access
app.use('/node_modules/@vercel/analytics', express.static('node_modules/@vercel/analytics'));
app.use('/node_modules/@vercel/speed-insights', express.static('node_modules/@vercel/speed-insights'));

// Main route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).sendFile(join(__dirname, 'public', '404.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;