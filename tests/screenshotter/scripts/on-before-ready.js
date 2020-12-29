module.exports = async function( page ) {
	const fs = require( 'fs' );
	const chalk = require( 'chalk' );
	page
		.on( 'console', ( message ) => {
			const type = message.type().substr( 0, 3 ).toUpperCase();
			const colors = {
				LOG: ( text ) => text,
				ERR: chalk.red,
				WAR: chalk.yellow,
				INF: chalk.cyan,
			};
			const color = colors[ type ] || chalk.blue;
			console.log( color( `${ type } ${ message.text() }` ) );
		} )
		.on( 'pageerror', ( { message } ) => console.log( chalk.red( message ) ) )
		.on( 'response', ( response ) =>
			console.log( chalk.green( `${ response.status() } ${ response.url() }` ) ) )
		.on( 'requestfailed', ( request ) =>
			console.log( chalk.magenta( `${ request.failure().errorText } ${ request.url() }` ) ) )
		.on( 'load', async () => {
			const pageTitle = await page.title();
			const cdp = await page.target().createCDPSession();
			const { data } = await cdp.send( 'Page.captureSnapshot', { format: 'mhtml' } );
			fs.writeFileSync( `backstop_data/${ pageTitle }.mhtml`, data );
		} );
};
