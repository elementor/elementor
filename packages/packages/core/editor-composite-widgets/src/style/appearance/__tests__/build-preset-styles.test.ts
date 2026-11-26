import { getElementLocalStyle, getElementStylesInheritance } from '@elementor/editor-editing-panel';
import { getBreakpointsTree } from '@elementor/editor-responsive';
import { getStylesSchema } from '@elementor/editor-styles';

import { buildPresetStyles } from '../build-preset-styles';
import {
	background,
	BREAKPOINTS_TREE,
	BUTTON_STYLE_PRESET,
	CLASS_STYLE_ID,
	color,
	createContainers,
	createInheritance,
	type ElementStylesTable,
	LOCAL_STYLE_ID,
	size,
	STYLES_SCHEMA,
} from './preset-test-utils';

jest.mock( '@elementor/editor-editing-panel', () => ( {
	...jest.requireActual( '@elementor/editor-editing-panel' ),
	getElementLocalStyle: jest.fn(),
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

const [ FILLED ] = BUTTON_STYLE_PRESET.options;
const OVERLAY = { $$type: 'background-overlay', value: [] };

const arrangeStyles = ( tables: Record< string, ElementStylesTable > ) => {
	jest.mocked( getElementStylesInheritance ).mockImplementation( ( elementId ) =>
		createInheritance( tables[ elementId ] ?? {} )
	);
};

describe( 'buildPresetStyles', () => {
	beforeEach( () => {
		jest.mocked( getBreakpointsTree ).mockReturnValue( BREAKPOINTS_TREE );
		jest.mocked( getStylesSchema ).mockReturnValue( STYLES_SCHEMA );
		jest.mocked( getElementLocalStyle ).mockReturnValue( { styleId: LOCAL_STYLE_ID } as ReturnType<
			typeof getElementLocalStyle
		> );
		arrangeStyles( {} );
	} );

	it( 'should write the desktop values and the explicit mobile values on a desktop click', () => {
		// Act.
		const entries = buildPresetStyles( {
			option: FILLED,
			containers: createContainers( [ 'root', 'label' ] ),
			breakpoint: 'desktop',
		} );

		// Assert.
		expect(
			entries.map( ( { container, variants } ) => [
				container.id,
				variants.map( ( { meta } ) => meta.breakpoint ),
			] )
		).toEqual( [
			[ 'root-id', [ 'desktop', 'mobile' ] ],
			[ 'label-id', [ 'desktop' ] ],
		] );
		expect( entries[ 0 ].variants[ 1 ].props ).toEqual( { padding: size( 8 ) } );
	} );

	it( 'should write only the mobile breakpoint on a mobile click, resolving the desktop values down', () => {
		// Act.
		const [ root ] = buildPresetStyles( {
			option: FILLED,
			containers: createContainers( [ 'root', 'label' ] ),
			breakpoint: 'mobile',
		} );

		// Assert.
		expect( root.variants ).toEqual( [
			{
				meta: { breakpoint: 'mobile', state: null },
				props: { background: background( { color: color( '#111111' ) } ), padding: size( 8 ) },
			},
		] );
	} );

	it( "should merge an object prop into the part's local value only, not into a class value", () => {
		// Arrange.
		arrangeStyles( {
			'root-id': {
				desktop: {
					background: [
						{
							styleId: LOCAL_STYLE_ID,
							value: background( { 'background-overlay': OVERLAY, color: color( 'red' ) } ),
						},
						{ styleId: CLASS_STYLE_ID, value: background( { clip: 'text' } ) },
					],
				},
			},
		} );

		// Act.
		const [ root ] = buildPresetStyles( {
			option: FILLED,
			containers: createContainers( [ 'root' ] ),
			breakpoint: 'desktop',
		} );

		// Assert.
		expect( root.variants[ 0 ].props.background ).toEqual(
			background( { 'background-overlay': OVERLAY, color: color( '#111111' ) } )
		);
	} );

	it( 'should skip parts that are not in the widget', () => {
		// Act.
		const entries = buildPresetStyles( {
			option: FILLED,
			containers: createContainers( [ 'root' ] ),
			breakpoint: 'desktop',
		} );

		// Assert.
		expect( entries.map( ( { container } ) => container.id ) ).toEqual( [ 'root-id' ] );
	} );
} );
