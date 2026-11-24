import * as React from 'react';
import { ThemeProvider } from '@elementor/ui';
import { type Range, type VirtualizerOptions } from '@tanstack/react-virtual';
import { render } from '@testing-library/react';

import { IconLibraryGrid } from '../icon-library-grid';

type CapturedConfig = Pick< VirtualizerOptions< HTMLDivElement, Element >, 'count' | 'rangeExtractor' >;

const capturedConfigs: CapturedConfig[] = [];

jest.mock( '@tanstack/react-virtual', () => ( {
	...jest.requireActual( '@tanstack/react-virtual' ),
	useVirtualizer: jest.fn().mockImplementation( ( config: CapturedConfig ) => {
		capturedConfigs.push( config );

		return {
			getVirtualItems: jest.fn().mockReturnValue( [] ),
			getTotalSize: jest.fn().mockReturnValue( 0 ),
			getVirtualIndexes: jest.fn().mockReturnValue( [] ),
			scrollToIndex: jest.fn(),
			measure: jest.fn(),
		};
	} ),
} ) );

const TOTAL_ICONS = 40;
const SELECTED_ICON_INDEX = 30;
const SEARCH_RESULT_COUNT = 2;

const createItem = ( index: number ) => ( {
	id: `fa-solid:icon-${ index }`,
	name: `icon-${ index }`,
	label: `icon-${ index }`,
	library: 'fa-solid' as const,
	value: `fa-solid fa-icon-${ index }`,
	aliases: [],
	width: 512,
	height: 512,
	paths: [ 'M0 0h10v10H0z' ],
} );

const renderGrid = ( items: ReturnType< typeof createItem >[], selectedValue: string ) => (
	<ThemeProvider>
		<IconLibraryGrid items={ items } selectedValue={ selectedValue } onSelect={ jest.fn() } onClose={ jest.fn() } />
	</ThemeProvider>
);

const getRequestedRows = ( { count, rangeExtractor }: CapturedConfig ) => {
	const range: Range = { startIndex: 0, endIndex: 0, overscan: 0, count };

	return rangeExtractor?.( range ) ?? [];
};

describe( 'IconLibraryGrid', () => {
	beforeEach( () => {
		capturedConfigs.length = 0;
	} );

	it( 'should only request existing rows when a search removes the selected icon', () => {
		// Arrange.
		const allItems = Array.from( { length: TOTAL_ICONS }, ( _, index ) => createItem( index ) );
		const selectedValue = allItems[ SELECTED_ICON_INDEX ].id;
		const searchResults = allItems.slice( 0, SEARCH_RESULT_COUNT );
		const { rerender } = render( renderGrid( allItems, selectedValue ) );
		const firstSearchRender = capturedConfigs.length;

		// Act.
		rerender( renderGrid( searchResults, selectedValue ) );

		// Assert.
		const searchConfigs = capturedConfigs.slice( firstSearchRender );

		expect( searchConfigs.length ).toBeGreaterThan( 0 );
		expect( searchConfigs[ 0 ].count ).toBe( 1 );

		searchConfigs.forEach( ( config ) => {
			getRequestedRows( config ).forEach( ( row ) => {
				expect( row ).toBeLessThan( config.count );
			} );
		} );
	} );
} );
