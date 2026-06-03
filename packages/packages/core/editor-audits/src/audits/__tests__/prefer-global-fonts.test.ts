import { descriptor, evaluator } from '../prefer-global-fonts';
import { makeContext, makeWidget } from './fixtures';

describe( descriptor.id, () => {
	it( 'is skipped when the kit has no global fonts', async () => {
		const result = await evaluator( makeContext( { kit: { id: 1, globals: { colors: [], fonts: [] } } } ) );

		expect( result.status ).toBe( 'skipped' );
	} );

	it( 'fails for a widget with a hard-coded font_family value', async () => {
		const tree = [ makeWidget( 'text1', 'text-editor', { typography_font_family: 'Georgia' } ) ];
		const result = await evaluator( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].label ).toContain( 'Georgia' );
		}
	} );

	it( 'passes when font value is a globals reference', async () => {
		const tree = [ makeWidget( 'text1', 'text-editor', { typography_font_family: 'globals/fonts/body' } ) ];

		expect( await evaluator( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'passes when no font-related settings exist', async () => {
		const tree = [ makeWidget( 'btn1', 'button', { background_color: '#ff0000' } ) ];

		expect( await evaluator( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );
} );
