import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// We will dynamically import or statically import the apps.
// For now, let's prepare the basic structure. We need to check each service first
// to make sure they are exporting an Express app correctly.

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send('API Gateway OK');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway Monolith running on port ${PORT}`);
});
