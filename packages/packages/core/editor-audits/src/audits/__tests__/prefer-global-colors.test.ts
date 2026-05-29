import { descriptor, evaluator } from '../prefer-global-colors';
import { makeContext, makeWidget } from './fixtures';

describe( descriptor.id, () => {
	it( 'is skipped when the kit has no global colors', async () => {
		const result = await evaluator( makeContext( { kit: { id: 1, globals: { colors: [], fonts: [] } } } ) );

		expect( result.status ).toBe( 'skipped' );
	} );

	it( 'fails for a widget with a hex color value', async () => {
		const tree = [ makeWidget( 'b1', 'button', { background_color: '#ff0000' } ) ];
		const result = await evaluator( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].label ).toContain( '#ff0000' );
		}
	} );

	it( 'passes when no hex values are in widget settings', async () => {
		const tree = [ makeWidget( 'b1', 'button', { background_color: 'globals/colors/primary' } ) ];
		expect( await evaluator( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );
} );
