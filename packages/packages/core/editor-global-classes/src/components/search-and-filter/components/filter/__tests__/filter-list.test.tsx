import * as React from 'react';
import { createMockTrackingModule, mockTracking } from 'test-utils';
import { fireEvent, render, screen } from '@testing-library/react';

import { useFilteredCssClassUsage } from '../../../../../hooks/use-filtered-css-class-usage';
import { type SearchAndFilterContextType, useSearchAndFilters } from '../../../context';
import { FilterList } from '../filter-list';
import { mockSetFilters, setupMocks } from './test-utils';

jest.mock( '../../../context' );
jest.mock( '../../../../../hooks/use-filtered-css-class-usage' );

jest.mock( '../../../../../utils/tracking', () => createMockTrackingModule( 'trackGlobalClasses' ) );

describe( 'FilterList', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		setupMocks();
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			search: {} as SearchAndFilterContextType[ 'search' ],
			filters: {
				filters: {
					unused: false,
					empty: false,
					onThisPage: false,
				},
				setFilters: mockSetFilters,
				onClearFilter: jest.fn(),
			},
		} );

		jest.mocked( useFilteredCssClassUsage ).mockReturnValue( {
			unused: [ 'class1', 'class2' ],
			empty: [ 'class3' ],
			onThisPage: [ 'class4', 'class5', 'class6' ],
		} );
	} );

	it( 'should render all filter options with correct counts', () => {
		render( <FilterList /> );

		expect( screen.getByText( 'Unused' ) ).toBeInTheDocument();
		expect( screen.getByText( '2' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Empty' ) ).toBeInTheDocument();
		expect( screen.getByText( '1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'On this page' ) ).toBeInTheDocument();
		expect( screen.getByText( '3' ) ).toBeInTheDocument();
	} );

	it( 'should toggle filter when clicking checkbox', async () => {
		render( <FilterList /> );

		fireEvent.click( screen.getByText( 'Unused' ) );

		expect( mockSetFilters ).toHaveBeenCalledWith( expect.any( Function ) );
		expect( mockTracking ).toHaveBeenCalledWith( {
			event: 'classManagerFilterUsed',
			action: 'apply',
			type: 'unused',
			trigger: 'menu',
		} );
	} );

	it( 'should track filter removal when clicking active filter', () => {
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			search: {} as SearchAndFilterContextType[ 'search' ],
			filters: {
				filters: {
					unused: true,
					empty: false,
					onThisPage: false,
				},
				setFilters: mockSetFilters,
				onClearFilter: jest.fn(),
			},
		} );

		render( <FilterList /> );

		fireEvent.click( screen.getByText( 'Unused' ) );

		expect( mockSetFilters ).toHaveBeenCalledWith( expect.any( Function ) );
		expect( mockTracking ).toHaveBeenCalledWith( {
			event: 'classManagerFilterUsed',
			action: 'remove',
			type: 'unused',
			trigger: 'menu',
		} );
	} );
} );
