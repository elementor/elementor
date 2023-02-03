// Lazy scroll to bottom in order to allow some animations and motion effects to complete.
module.exports = async ( page ) => {
	await page.evaluate( async () => {
		await new Promise( ( resolve ) => {
			let totalHeight = 0;
			const distance = 100;
			const timer = setInterval( () => {
				const scrollHeight = document.body.scrollHeight;
				window.scrollBy( 0, distance );
				totalHeight += distance;
				if ( totalHeight >= scrollHeight ) {
					clearInterval( timer );
					window.scrollTo( 0, 0 );
					resolve();
				}
			}, 100 );
		} );
	} );
};
