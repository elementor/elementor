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
    const figmanonColorCssPath = '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/figma-non-color-variables.css';
    const figmanonColorCss = fs.readFileSync(figmanonColorCssPath, 'utf8');
    
    console.log('Importing and pushing Figma App UI Elements NON-COLOR design variables to system...');
    console.log('Source: https://www.figma.com/design/eHczmy48dhw7o9NLrVqAAm/App-UI-Elements--1-?node-id=2-354');
    console.log('Variables include typography, spacing, border radius, shadows, and component dimensions...');
    
    postCssToEndpoint(figmanonColorCss).then(response => {
        if (response) {
            console.log('✅ Successfully pushed Figma NON-COLOR design variables to Elementor CSS Converter system');
        } else {
            console.log('❌ Failed to push non-color variables to system');
        }
    });
} catch (error) {
    console.error('Error reading Figma non-color CSS file:', error);
    // Fallback to basic non-color variables
    const css = ':root { --font-size-base: 12px; --spacing-md: 8px; --radius-md: 8px; }';
    console.log('Using fallback non-color variables...');
    postCssToEndpoint(css);
}
