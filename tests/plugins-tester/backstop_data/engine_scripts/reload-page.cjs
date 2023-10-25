// Lazy scroll to bottom in order to allow some animations and motion effects to complete.
module.exports = async ( page ) => {
	await page.goto( 'http://localhost:7777/law-firm-about/?elementor' );
	await page.waitForSelector( '#elementor-panel-elements-categories' );
};
