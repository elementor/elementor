import fs from 'fs';
import _path from 'path';
const headers = {
	'X-WP-Nonce': process.env.WP_REST_NONCE,
};

export async function createDefaultMedia( request, image ) {
	const imagePath = image.filePath ? image.filePath : `../assets/test-images/${ image.title }.${ image.extension }`;
	const response = await request.post( '/index.php', {

		params: { rest_route: '/wp/v2/media' },
		headers,
		multipart: {
			file: fs.createReadStream( _path.resolve( __dirname, imagePath ) ),
			title: image.title,
			status: 'publish',
			description: image.description,
			alt_text: image.alt_text,
			caption: image.caption,
		},
	} );

	if ( ! response.ok() ) {
		throw new Error( `
			Failed to create default media: ${ response.status() }.
			${ await response.text() }
		` );
	}

	const { id } = await response.json();

	return id;
}

export async function deleteDefaultMedia( request, ids ) {
	const requests = [];
	for ( const id in ids ) {
		requests.push( request.delete( `/index.php`, {
			headers,
			params: {
				rest_route: `/wp/v2/media/${ ids[ id ] }`,
				force: 1,
			},
		} ) );
	}
	await Promise.all( requests );
}
