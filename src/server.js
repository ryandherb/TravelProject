import express from 'express'; 
import axios from 'axios'; 
import cors from 'cors'; 

const app = express(); 
app.use(cors()); 

app.get("/images", async(req, res) => {
    try {
        const { q, location, apiKey } = req.query; 
        const response = await axios.get('https://serpapi.com/search', {
            params: {
                engine: "google_images",
                q,
                hl: "en",
                api_key: apiKey
            }
        });

        res.json(response.data);
    } catch (err) {
        console.error(err.response?.data || err.message); 
        res.status(500).json({ error: err.message});
    }
});

app.listen(3000, () => console.log("Server running on port 3000")); 