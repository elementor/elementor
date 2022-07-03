module.exports = async function( page ) {
	const fs = require( 'fs' );
	const path = require( 'path' );
	const chalk = require( 'chalk' );

	const pathname = 'backstop_data/html_snapshots';
	if ( ! fs.existsSync( pathname ) ) {
		const __dirname = path.resolve();
		// Remove leading directory markers, and remove ending /file-name.extension if exists
		pathname.replace( /^\.*\/|\/?[^/]+\.[a-z]+|\/$/g, '' );
		fs.mkdir( path.resolve( __dirname, pathname ), { recursive: true }, ( e ) => {
			if ( e ) {
				// eslint-disable-next-line no-console
				console.error( e );
			} else {
				// eslint-disable-next-line no-console
				console.log( chalk.green( 'Success created folder - snapshot' ) );
			}
		} );
	}

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
			// eslint-disable-next-line no-console
			console.log( color( `${ type } ${ message.text() }` ) );
		} )
		.on( 'pageerror', ( { message } ) => {
			// eslint-disable-next-line no-console
			console.log( chalk.red( message ) );
		} )
		.on( 'requestfailed', ( request ) => {
			// eslint-disable-next-line no-console
			console.log( chalk.magenta( `${ request.failure().errorText } ${ request.url() }` ) );
		} )
		.on( 'load', async () => {
			// Hack to fix placeholders URLs
			await page.evaluate( () => {
				const placeholders = document.querySelectorAll(
					`[src='http://localhost/wp-content/plugins/elementor/assets/images/placeholder.png']`,
				);
				placeholders.forEach( ( img ) => {
					img.setAttribute(
						'src',
						'http://localhost:8080/wp-content/plugins/elementor/assets/images/placeholder.png',
					);
				} );
			} );

			const pageTitle = await page.title();
			const cdp = await page.target().createCDPSession();
			const { data } = await cdp.send( 'Page.captureSnapshot', { format: 'mhtml' } );
			const filePath = `backstop_data/html_snapshots/${ pageTitle }.mhtml`;
			fs.writeFileSync( filePath, data );
			if ( ! fs.existsSync( filePath ) ) {
				// eslint-disable-next-line no-console
				console.log( chalk.red( `Failed to created file - ${ filePath }` ) );
			}
		} );
};
