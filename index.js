const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000; // Port for the Express server

// Define a route to scrape DuckDuckGo search results based on the query
app.get('/scrape/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const searchUrl = `https://duckduckgo.com/?t=ffab&q=${query}&ia=web`;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(searchUrl);

        // Wait for the content to load
        await page.waitForSelector('#react-layout');

        // Extract all descendants of #react-layout and filter out spans whose text content starts with "http" or "https"
        const spans = await page.$$eval('#react-layout span', spans => {
            return spans.map(span => span.textContent)
                .filter(text => text.startsWith('http') || text.startsWith('https'));
        });

        await browser.close();

        // Send the scraped links as the API response
        res.json({ links: spans });
    } catch (error) {
        console.error('Error scraping DuckDuckGo search results:', error);
        // Send an error response if there's an error
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
