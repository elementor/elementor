import { parseIcomoonSelection } from '../icomoon-selection';

const SELECTION = JSON.stringify( {
	preferences: { fontPref: { prefix: 'icon-' } },
	icons: [
		{
			icon: { paths: [ 'M0 0H1024V1024H0Z' ], width: 1024, tags: [ 'home' ] },
			properties: { name: 'home', code: 59648 },
		},
	],
} );

describe( 'parseIcomoonSelection', () => {
	it( 'builds themed svg from selection.json paths', () => {
		// Act.
		const map = parseIcomoonSelection( SELECTION, 'icon-', '', [ 'home' ] );

		// Assert.
		expect( map[ 'icon icon-home' ] ).toContain( 'M0 0H1024V1024H0Z' );
		expect( map[ 'icon icon-home' ] ).toContain( 'fill="currentColor"' );
		expect( map[ 'icon icon-home' ] ).toContain( 'viewBox="0 0 1024 1024"' );
	} );
} );
