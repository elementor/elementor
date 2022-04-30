module.exports = async function( page ) {
	const fs = require( 'fs' );
	const path = require( 'path' );
	const chalk = require( 'chalk' );
	const pathname = 'backstop_data/html_snapshots';
	await page.evaluateHandle( 'document.fonts.ready' );

	if ( ! fs.existsSync( pathname ) ) {
		const __dirname = path.resolve();
		// Remove leading directory markers, and remove ending /file-name.extension if exists
		pathname.replace( /^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, '' );
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

	const pageTitle = await page.title();
	const cdp = await page.context().newCDPSession( page );
	const { data } = await cdp.send( 'Page.captureSnapshot', { format: 'mhtml' } );
	const filePath = `backstop_data/html_snapshots/${ pageTitle }.mhtml`;
	fs.writeFileSync( filePath, data );
	if ( ! fs.existsSync( filePath ) ) {
		// eslint-disable-next-line no-console
		console.log( chalk.red( `Failed to created file - ${ filePath }` ) );
	}
	await page.reload();
	await page.evaluate( () => window.scrollTo( 0, document.body.scrollHeight ) );
	const urlPathName = await page.url().replace( /\/$/, '' ).split( '/' ).pop();
	const delaydComponents = [ 'audio', 'video', 'image-gallery', 'progress-bar' ];
	const delay = ( ms ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );
	if ( delaydComponents.includes( urlPathName ) ) {
		await delay( 3000 );
	}
	return true;
};
