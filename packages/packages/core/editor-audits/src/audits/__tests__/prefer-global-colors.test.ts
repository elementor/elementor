import { audit } from '../prefer-global-colors';
import { makeContainer, makeContext, makeWidget } from './fixtures';

const KIT_WITH_PRIMARY = {
	id: 1,
	globals: {
		colors: [ { id: 'primary', value: '#6EC1E4', title: 'Primary' } ],
		fonts: [],
	},
};

describe( audit.id, () => {
	it( 'is skipped with an empty tree', async () => {
		expect( await audit.evaluate( makeContext( { tree: [], kit: KIT_WITH_PRIMARY } ) ) ).toEqual( {
			status: 'skipped',
			reason: 'No elements',
		} );
	} );

	it( 'is skipped when the kit has no global colors', async () => {
		const tree = [ makeWidget( 'b1', 'button', { background_color: '#ff0000' } ) ];

		expect(
			await audit.evaluate( makeContext( { tree, kit: { id: 1, globals: { colors: [], fonts: [] } } } ) )
		).toEqual( {
			status: 'skipped',
			reason: 'No global colors',
		} );
	} );

	it( 'passes when hex does not match any global', async () => {
		const tree = [ makeWidget( 'b1', 'button', { background_color: '#ff0000' } ) ];

		expect( await audit.evaluate( makeContext( { tree, kit: KIT_WITH_PRIMARY } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'passes when color uses a globals/ reference', async () => {
		const tree = [ makeWidget( 'b1', 'button', { background_color: 'globals/colors?id=primary' } ) ];

		expect( await audit.evaluate( makeContext( { tree, kit: KIT_WITH_PRIMARY } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'passes when setting is linked via __globals__', async () => {
		const tree = [
			makeWidget( 'b1', 'button', {
				background_color: '#6EC1E4',
				__globals__: { background_color: 'globals/colors?id=primary' },
			} ),
		];

		expect( await audit.evaluate( makeContext( { tree, kit: KIT_WITH_PRIMARY } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails with one violation per duplicate instance on the same widget', async () => {
		const tree = [
			makeWidget( 'b1', 'button', {
				background_color: '#6EC1E4',
				title_color: '#6EC1E4',
			} ),
		];
		const result = await audit.evaluate( makeContext( { tree, kit: KIT_WITH_PRIMARY } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 2 );
			expect( result.violations[ 0 ].label ).toBe( 'replace "#6EC1E4" with "Primary" global color' );
			expect( result.violations[ 1 ].label ).toBe( 'replace "#6EC1E4" with "Primary" global color' );
			expect( result.violations.every( ( violation ) => violation.angieFix ) ).toBe( true );
		}
	} );

	it( 'fails for a container with a matching background color', async () => {
		const tree = [ makeContainer( 'c1', { _background_color: '#6EC1E4' } ) ];
		const result = await audit.evaluate( makeContext( { tree, kit: KIT_WITH_PRIMARY } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].label ).toBe( 'replace "#6EC1E4" with "Primary" global color' );
		}
	} );
} );
