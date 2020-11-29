module.exports = async function( renderer, scenario, vp, isReference ) {
	await renderer.evaluate( () => {
		return new Promise( ( resolve ) => {
			let totalHeight = 0;
			const distance = 100,
				timer = setInterval( () => {
					const scrollHeight = document.body.scrollHeight;
					window.scrollBy( 0, distance );
					totalHeight += distance;

					if ( totalHeight >= scrollHeight ) {
						clearInterval( timer );
						resolve();
					}
				}, 100 );
		} );
	} );
};
