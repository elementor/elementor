// Using built-in fetch in Node.js 18+

/**
 * Posts CSS to the Elementor CSS Converter endpoint
 * 
 * The endpoint accepts two types of requests:
 * 1. CSS content: Send CSS as 'css' parameter
 * 2. CSS URL: Send URL as 'url' parameter (endpoint will fetch the CSS)
 * 
 * Authentication: X-DEV-TOKEN header with your dev token
 * 
 * @param {string} cssBody - CSS content to convert
 * @param {string} cssUrl - Optional URL to fetch CSS from (alternative to cssBody)
 * @returns {Promise<string|null>} Response from endpoint or null on error
 */
async function postCssToEndpoint(cssBody, cssUrl = null) {
    const endpoint = 'http://elementor.local:10003/wp-json/elementor/v2/css-converter/variables';

    try {
        const formData = new URLSearchParams();
        
        if (cssUrl) {
            formData.append('url', cssUrl);
        } else {
            formData.append('css', cssBody);
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-DEV-TOKEN': 'my-dev-token'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.text(); // or .json() if endpoint returns JSON
        console.log('Response:', data);
        return data;
    } catch (error) {
        console.error('Error posting CSS:', error);
        return null;
    }
}

// Load Figma extracted CSS variables
const fs = require('fs');
const path = require('path');

try {
    const figmaCssPath = '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/figma-extracted-variables.css';
    const figmaCss = fs.readFileSync(figmaCssPath, 'utf8');
    
    console.log('Posting Figma extracted CSS variables...');
    postCssToEndpoint(figmaCss);
} catch (error) {
    console.error('Error reading Figma CSS file:', error);
    // Fallback to example
    const css = ':root { --main-color: #cccccc; --font-size: 16px; }';
    postCssToEndpoint(css);
}
