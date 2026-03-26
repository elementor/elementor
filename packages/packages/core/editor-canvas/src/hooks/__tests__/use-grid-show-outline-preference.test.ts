import { extractGridShowOutline, extractGridTrackCountsFromStyles } from '../use-grid-show-outline-preference';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementStyles: jest.fn(),
} ) );

import { getElementStyles } from '@elementor/editor-elements';

describe( 'extractGridShowOutline', () => {
	beforeEach( () => {
		jest.mocked( getElementStyles ).mockReturnValue( null );
	} );

	it( 'returns true when there are no styles', () => {
		expect( extractGridShowOutline( 'el-1', 'desktop' ) ).toBe( true );
	} );

	it( 'matches variant when desktop is stored as null breakpoint', () => {
		jest.mocked( getElementStyles ).mockReturnValue( {
			local: {
				id: 'local',
				label: 'local',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: {
							grid: {
								$$type: 'grid',
								value: {
									showOutline: { $$type: 'boolean', value: false },
								},
							},
						},
						custom_css: null,
					},
				],
			},
		} );

		expect( extractGridShowOutline( 'el-1', 'desktop' ) ).toBe( false );
	} );

	it( 'reads plain boolean showOutline', () => {
		jest.mocked( getElementStyles ).mockReturnValue( {
			local: {
				id: 'local',
				label: 'local',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: 'desktop', state: null },
						props: {
							grid: {
								$$type: 'grid',
								value: {
									showOutline: false,
								},
							},
						},
						custom_css: null,
					},
				],
			},
		} );

		expect( extractGridShowOutline( 'el-1', 'desktop' ) ).toBe( false );
	} );

	it( 'extractGridTrackCountsFromStyles reads columnsCount and rowsCount', () => {
		jest.mocked( getElementStyles ).mockReturnValue( {
			local: {
				id: 'local',
				label: 'local',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: 'desktop', state: null },
						props: {
							grid: {
								$$type: 'grid',
								value: {
									columnsCount: { $$type: 'number', value: 4 },
									rowsCount: { $$type: 'number', value: 2 },
								},
							},
						},
						custom_css: null,
					},
				],
			},
		} );

		expect( extractGridTrackCountsFromStyles( 'el-1', 'desktop' ) ).toEqual( { columns: 4, rows: 2 } );
	} );
} );
