module.exports = async function( page ) {
	const config = require( '../config' );
	const url = require( 'url' );
	const fs = require( 'fs' );
	const path = require( 'path' );
	const chalk = require( 'chalk' );

	const pathname = 'backstop_data/html_snapshots';
	if ( ! fs.existsSync( pathname ) ) {
		const __dirname = path.resolve();
		// Remove leading directory markers, and remove ending /file-name.extension if exists
		pathname.replace( /^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, '' );
		fs.mkdir( path.resolve( __dirname, pathname ), { recursive: true }, ( e ) => {
			if ( e ) {
				console.error( e );
			} else {
				console.log( chalk.green( 'Success created folder - snapshot' ) );
			}
		} );
	}

	page.setRequestInterception( true );

	page
		.on( 'request', async ( request ) => {
			const requestUrl = request.url();
			const host = url.parse( config.url_origin, true ).host;
			const requestHost = url.parse( requestUrl, true ).host;

			// Intercept if request url.host=localhost
			if ( 'localhost' === requestHost ) {
				// Send response
				request.respond( {
					body: fs.readFileSync(
						path.replace( requestHost, host ),
					),
				} );
			} else {
				request.continue();
			}
		} )
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
		.on( 'pageerror', ( { message } ) => {
			console.log( chalk.red( message ) );
		} )
		.on( 'response', async ( response ) => {
			// const fixResponse = await fixUrlAdrress( response );
			console.log( chalk.green( `${ response.status() } ${ response.url() }` ) );
			// return fixResponse;
		} )
		.on( 'requestfailed', ( request ) => {
			console.log( chalk.magenta( `${ request.failure().errorText } ${ request.url() }` ) )
		} )
		.on( 'load', async () => {
			const pageTitle = await page.title();
			const cdp = await page.target().createCDPSession();
			const { data } = await cdp.send( 'Page.captureSnapshot', { format: 'mhtml' } );
			const filePath = `backstop_data/html_snapshots/${ pageTitle }.mhtml`;
			fs.writeFileSync( filePath, data );
			if ( ! fs.existsSync( filePath ) ) {
				console.log( chalk.red( `Failed to created file - ${ filePath }` ) );
			}
		} );
};
