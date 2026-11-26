import { getElementStylesInheritance } from '@elementor/editor-editing-panel';
import { type BreakpointId, getBreakpointsTree } from '@elementor/editor-responsive';
import { getStylesSchema } from '@elementor/editor-styles';

import { findMatchingPresetOption } from '../use-preset-match';
import {
	background,
	BREAKPOINTS_TREE,
	BUTTON_STYLE_PRESET,
	CLASS_STYLE_ID,
	color,
	createContainers,
	createInheritance,
	type ElementStylesTable,
	local,
	size,
	STYLES_SCHEMA,
} from './preset-test-utils';

jest.mock( '@elementor/editor-editing-panel', () => ( {
	...jest.requireActual( '@elementor/editor-editing-panel' ),
	getElementStylesInheritance: jest.fn(),
} ) );
jest.mock( '@elementor/editor-responsive', () => ( {
	...jest.requireActual( '@elementor/editor-responsive' ),
	getBreakpointsTree: jest.fn(),
} ) );
jest.mock( '@elementor/editor-styles', () => ( {
	...jest.requireActual( '@elementor/editor-styles' ),
	getStylesSchema: jest.fn(),
} ) );

const OVERLAY = { $$type: 'background-overlay', value: [] };

const findMatch = ( tables: Record< string, ElementStylesTable >, breakpoint: BreakpointId ) => {
	jest.mocked( getElementStylesInheritance ).mockImplementation( ( elementId ) =>
		createInheritance( tables[ elementId ] ?? {} )
	);

	return findMatchingPresetOption( {
		options: BUTTON_STYLE_PRESET.options,
		containers: createContainers( [ 'root', 'label' ] ),
		breakpoint,
	} );
};

describe( 'findMatchingPresetOption', () => {
	beforeEach( () => {
		jest.mocked( getBreakpointsTree ).mockReturnValue( BREAKPOINTS_TREE );
		jest.mocked( getStylesSchema ).mockReturnValue( STYLES_SCHEMA );
	} );

	it( 'should match an option whose values cascade from desktop to the current breakpoint', () => {
		// Arrange.
		const tables = {
			'root-id': {
				desktop: { background: local( background( { color: color( '#111111' ) } ) ) },
				mobile: { padding: local( size( 8 ) ) },
			},
			'label-id': { desktop: { color: local( color( '#ffffff' ) ) } },
		};

		// Act & Assert.
		expect( findMatch( tables, 'desktop' ) ).toBe( 'filled' );
		expect( findMatch( tables, 'mobile' ) ).toBe( 'filled' );
	} );

	it( 'should compare only the keys the preset sets in an object prop', () => {
		// Arrange.
		const tables = {
			'root-id': {
				desktop: {
					background: local( background( { 'background-overlay': OVERLAY, color: color( 'transparent' ) } ) ),
				},
			},
			'label-id': { desktop: { color: local( color( '#111111' ) ) } },
		};

		// Act & Assert.
		expect( findMatch( tables, 'desktop' ) ).toBe( 'outline' );
	} );

	it( 'should match on the effective value, including a value that comes from a class', () => {
		// Arrange.
		const tables = {
			'root-id': {
				desktop: {
					background: [ { styleId: CLASS_STYLE_ID, value: background( { color: color( 'transparent' ) } ) } ],
				},
			},
			'label-id': { desktop: { color: local( color( '#111111' ) ) } },
		};

		// Act & Assert.
		expect( findMatch( tables, 'desktop' ) ).toBe( 'outline' );
	} );

	it( 'should return null (Custom) after a part value changes at the current breakpoint', () => {
		// Arrange.
		const tables = {
			'root-id': { desktop: { background: local( background( { color: color( 'transparent' ) } ) ) } },
			'label-id': {
				desktop: { color: local( color( '#111111' ) ) },
				mobile: { color: local( color( 'red' ) ) },
			},
		};

		// Act & Assert.
		expect( findMatch( tables, 'desktop' ) ).toBe( 'outline' );
		expect( findMatch( tables, 'mobile' ) ).toBeNull();
	} );
} );
