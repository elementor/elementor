import { audit } from '../prefer-global-fonts';
import { makeContainer, makeContext, makeWidget } from './fixtures';

const KIT_WITH_BODY_FONT = {
	id: 1,
	globals: {
		colors: [],
		fonts: [ { id: 'body', value: 'Roboto', title: 'Body' } ],
	},
};

describe( audit.id, () => {
	it( 'is skipped with an empty tree', async () => {
		expect( await audit.evaluate( makeContext( { tree: [], kit: KIT_WITH_BODY_FONT } ) ) ).toEqual( {
			status: 'skipped',
			reason: 'No elements',
		} );
	} );

	it( 'is skipped when the kit has no global fonts', async () => {
		const tree = [ makeWidget( 'text1', 'text-editor', { typography_font_family: 'Roboto' } ) ];

		expect(
			await audit.evaluate( makeContext( { tree, kit: { id: 1, globals: { colors: [], fonts: [] } } } ) )
		).toEqual( {
			status: 'skipped',
			reason: 'No global fonts',
		} );
	} );

	it( 'passes when font does not match any global', async () => {
		const tree = [ makeWidget( 'text1', 'text-editor', { typography_font_family: 'Georgia' } ) ];

		expect( await audit.evaluate( makeContext( { tree, kit: KIT_WITH_BODY_FONT } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'passes when font uses a globals/ reference', async () => {
		const tree = [ makeWidget( 'text1', 'text-editor', { typography_font_family: 'globals/typography?id=body' } ) ];

		expect( await audit.evaluate( makeContext( { tree, kit: KIT_WITH_BODY_FONT } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'passes when setting is linked via __globals__', async () => {
		const tree = [
			makeWidget( 'text1', 'text-editor', {
				typography_font_family: 'Roboto',
				__globals__: { typography_font_family: 'globals/typography?id=body' },
			} ),
		];

		expect( await audit.evaluate( makeContext( { tree, kit: KIT_WITH_BODY_FONT } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails with one violation per duplicate instance on the same widget', async () => {
		const tree = [
			makeWidget( 'text1', 'text-editor', {
				title_typography_font_family: 'Roboto',
				content_typography_font_family: 'Roboto',
			} ),
		];
		const result = await audit.evaluate( makeContext( { tree, kit: KIT_WITH_BODY_FONT } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 2 );
			expect( result.violations[ 0 ].label ).toBe( 'replace hardcoded typography with "Body" global font' );
			expect( result.violations[ 1 ].label ).toBe( 'replace hardcoded typography with "Body" global font' );
		}
	} );

	it( 'fails for a container with a matching font setting', async () => {
		const tree = [ makeContainer( 'c1', { typography_font_family: 'Roboto' } ) ];
		const result = await audit.evaluate( makeContext( { tree, kit: KIT_WITH_BODY_FONT } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].label ).toBe( 'replace hardcoded typography with "Body" global font' );
		}
	} );
} );
