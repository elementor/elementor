import { findMatchingPresetOption } from '../use-preset-match';
import { background, BREAKPOINTS_TREE, BUTTON_STYLE_PRESET, color, createParts } from './preset-fixtures';

const OVERLAY = { $$type: 'background-overlay', value: [] };

const findMatch = ( parts: ReturnType< typeof createParts >, breakpoint: 'desktop' | 'mobile' ) =>
	findMatchingPresetOption( {
		options: BUTTON_STYLE_PRESET.options,
		parts,
		breakpoint,
		breakpointsTree: BREAKPOINTS_TREE,
	} );

describe( 'findMatchingPresetOption', () => {
	it( 'should match an option whose values cascade from desktop to the current breakpoint', () => {
		// Arrange.
		const parts = createParts( {
			root: {
				desktop: { background: background( { color: color( '#111111' ) } ) },
				mobile: { padding: { $$type: 'size', value: { size: 8, unit: 'px' } } },
			},
			label: { desktop: { color: color( '#ffffff' ) } },
		} );

		// Act & Assert.
		expect( findMatch( parts, 'desktop' ) ).toBe( 'filled' );
		expect( findMatch( parts, 'mobile' ) ).toBe( 'filled' );
	} );

	it( 'should compare only the keys the preset sets in an object prop', () => {
		// Arrange.
		const parts = createParts( {
			root: {
				desktop: { background: background( { 'background-overlay': OVERLAY, color: color( 'transparent' ) } ) },
			},
			label: { desktop: { color: color( '#111111' ) } },
		} );

		// Act & Assert.
		expect( findMatch( parts, 'desktop' ) ).toBe( 'outline' );
	} );

	it( 'should return null (Custom) after an atom value changes at the current breakpoint', () => {
		// Arrange.
		const parts = createParts( {
			root: { desktop: { background: background( { color: color( 'transparent' ) } ) } },
			label: { desktop: { color: color( '#111111' ) }, mobile: { color: color( 'red' ) } },
		} );

		// Act & Assert.
		expect( findMatch( parts, 'desktop' ) ).toBe( 'outline' );
		expect( findMatch( parts, 'mobile' ) ).toBeNull();
	} );
} );
