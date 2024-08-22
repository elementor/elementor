import { splitText } from 'elementor/modules/ai/assets/js/editor/pages/form-code/splitTextResult';

describe( 'Split text according to code and the extra details parts', () => {
	const INTRO = 'This is the intro part';
	const CODE = '```html\n' +
		'<!DOCTYPE html>\n' +
		'<html>\n' +
		'<head>\n' +
		'\t<title>Sticky Shrinking Header</title>```';
	const htmlElement = '`<header>`';
	const DETAILS = `In this code snippet, we create a basic HTML page with a ${ htmlElement } element`;

	it( 'renders the result text correctly', () => {
		const text = `
		${ INTRO }
		${ CODE }
		${ DETAILS }`;

		const result = splitText( text );

		expect( result.code ).toBeDefined();
		expect( result.details ).toBeDefined();
	} );

	it( 'renders only the code then there are no other details', () => {
		const text = `
		${ CODE }`;

		const result = splitText( text );

		expect( result.code ).toBeDefined();
		expect( result.details ).toBe( '' );
	} );

	it( 'renders correctly when code block starts with a block and not <html>', () => {
		const code = '```<iframe src="https://open.spotify.com/embed/playlist/1234567890" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>```';
		const text = `
		Here is the iframe code to embed a Spotify widget on your web page with the given ID using HTML:
		${ code }
		Note: You can customize the width and height as per your requirement.
		`;

		const result = splitText( text );

		expect( result.code ).toBeDefined();
		expect( result.details ).toBe( 'Note: You can customize the width and height as per your requirement.' );
	} );

	it( 'returns empty object when empty input', () => {
		const result = splitText( '' );

		expect( result ).toStrictEqual( {} );
	} );
} );
