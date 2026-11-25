import { buildPresetWrites } from '../build-preset-writes';
import { background, BREAKPOINTS_TREE, BUTTON_STYLE_PRESET, color, createParts } from './preset-fixtures';

const [ FILLED ] = BUTTON_STYLE_PRESET.options;
const OVERLAY = { $$type: 'background-overlay', value: [] };

describe( 'buildPresetWrites', () => {
	it( 'should write the desktop values and the explicit mobile values on a desktop click', () => {
		// Arrange.
		const parts = createParts( { root: {}, label: {} } );

		// Act.
		const writes = buildPresetWrites( {
			option: FILLED,
			parts,
			breakpoint: 'desktop',
			breakpointsTree: BREAKPOINTS_TREE,
		} );

		// Assert.
		expect( writes.map( ( { target, meta } ) => [ target.elementId, meta.breakpoint ] ) ).toEqual( [
			[ 'root-id', 'desktop' ],
			[ 'root-id', 'mobile' ],
			[ 'label-id', 'desktop' ],
		] );
		expect( writes[ 1 ].props ).toEqual( { padding: { $$type: 'size', value: { size: 8, unit: 'px' } } } );
	} );

	it( 'should write only the mobile breakpoint on a mobile click, resolving the desktop values down', () => {
		// Arrange.
		const parts = createParts( { root: {}, label: {} } );

		// Act.
		const writes = buildPresetWrites( {
			option: FILLED,
			parts,
			breakpoint: 'mobile',
			breakpointsTree: BREAKPOINTS_TREE,
		} );

		// Assert.
		expect( writes.map( ( { target, meta } ) => [ target.elementId, meta.breakpoint ] ) ).toEqual( [
			[ 'root-id', 'mobile' ],
			[ 'label-id', 'mobile' ],
		] );
		expect( writes[ 0 ].props ).toEqual( {
			background: background( { color: color( '#111111' ) } ),
			padding: { $$type: 'size', value: { size: 8, unit: 'px' } },
		} );
	} );

	it( 'should merge an object prop into the current value, keeping keys the preset does not set', () => {
		// Arrange.
		const parts = createParts( {
			root: { desktop: { background: background( { 'background-overlay': OVERLAY, color: color( 'red' ) } ) } },
			label: {},
		} );

		// Act.
		const [ rootDesktop ] = buildPresetWrites( {
			option: FILLED,
			parts,
			breakpoint: 'desktop',
			breakpointsTree: BREAKPOINTS_TREE,
		} );

		// Assert.
		expect( rootDesktop.props.background ).toEqual(
			background( { 'background-overlay': OVERLAY, color: color( '#111111' ) } )
		);
	} );

	it( 'should skip parts that are not in the widget', () => {
		// Arrange.
		const parts = createParts( { root: {} } );

		// Act.
		const writes = buildPresetWrites( {
			option: FILLED,
			parts,
			breakpoint: 'desktop',
			breakpointsTree: BREAKPOINTS_TREE,
		} );

		// Assert.
		expect( writes.every( ( { target } ) => target.elementId === 'root-id' ) ).toBe( true );
	} );
} );
