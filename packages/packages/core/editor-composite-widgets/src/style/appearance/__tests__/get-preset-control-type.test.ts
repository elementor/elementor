import { type CompositeWidgetPreset } from '../../../types';
import { getPresetControlType } from '../get-preset-control-type';

const presetWithOptions = ( count: number ): CompositeWidgetPreset => ( {
	id: 'preset',
	label: 'Preset',
	options: Array.from( { length: count }, ( _, index ) => ( {
		id: `option_${ index }`,
		label: `Option ${ index }`,
		set: [ { part: 'root', style: { desktop: { gap: null } } } ],
	} ) ),
} );

describe( 'getPresetControlType', () => {
	it.each( [
		{ count: 2, expected: 'inline-toggle' },
		{ count: 3, expected: 'full-width-toggle' },
		{ count: 4, expected: 'select' },
		{ count: 6, expected: 'select' },
	] )( 'should pick $expected for $count options', ( { count, expected } ) => {
		// Act & Assert.
		expect( getPresetControlType( presetWithOptions( count ) ) ).toBe( expected );
	} );
} );
