import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { mockTrackGlobalClasses, mockTrackingModule } from '../../../../../__tests__/mocks';
import { useFilters } from '../../../../../hooks/use-filters';
import { type SearchAndFilterContextType, useSearchAndFilters } from '../../../context';
import { ActiveFilters } from '../active-filters';
import { mockOnClearFilter, mockSetFilters, setupMocks } from './test-utils';

jest.mock( '../../../context' );
jest.mock( '../../../../../hooks/use-filters' );

jest.mock( '../../../../../utils/tracking', () => mockTrackingModule );

describe( 'ActiveFilters', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		setupMocks();
	} );

	it( 'should render active filters as chips', () => {
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			search: {} as SearchAndFilterContextType[ 'search' ],
			filters: {
				filters: {
					unused: true,
					empty: true,
					onThisPage: false,
				},
				setFilters: mockSetFilters,
				onClearFilter: mockOnClearFilter,
			},
		} );

		render( <ActiveFilters /> );

		expect( screen.getByText( 'Unused' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Empty' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'On this page' ) ).not.toBeInTheDocument();
	} );

	it( 'should remove filter when clicking chip delete button', async () => {
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			search: {} as SearchAndFilterContextType[ 'search' ],
			filters: {
				filters: {
					unused: true,
					empty: false,
					onThisPage: false,
				},
				setFilters: mockSetFilters,
				onClearFilter: mockOnClearFilter,
			},
		} );

		render( <ActiveFilters /> );

		// eslint-disable-next-line testing-library/no-test-id-queries
		const deleteIcon = screen.getByTestId( 'CancelIcon' );

		fireEvent.click( deleteIcon );

		expect( mockSetFilters ).toHaveBeenCalled();
		expect( mockTrackGlobalClasses ).toHaveBeenCalledWith( {
			event: 'classManagerFilterUsed',
			action: 'remove',
			type: 'unused',
			trigger: 'header',
		} );
	} );

	it( 'should show clear all button when filters are active', () => {
		jest.mocked( useFilters ).mockReturnValue( [ 'empty' ] );
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			search: {} as SearchAndFilterContextType[ 'search' ],
			filters: {
				filters: {
					unused: true,
					empty: false,
					onThisPage: false,
				},
				setFilters: mockSetFilters,
				onClearFilter: mockOnClearFilter,
			},
		} );

		render( <ActiveFilters /> );

		expect( screen.getByRole( 'button', { name: /clear filters/i } ) ).toBeInTheDocument();
	} );

	it( 'should track filter cleared when clicking clear all button', () => {
		jest.mocked( useFilters ).mockReturnValue( [ 'empty' ] );
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			search: {} as SearchAndFilterContextType[ 'search' ],
			filters: {
				filters: {
					unused: true,
					empty: true,
					onThisPage: false,
				},
				setFilters: mockSetFilters,
				onClearFilter: mockOnClearFilter,
			},
		} );

		render( <ActiveFilters /> );

		const clearButton = screen.getByRole( 'button', { name: /clear filters/i } );
		fireEvent.click( clearButton );

		expect( mockTrackGlobalClasses ).toHaveBeenCalledWith( {
			event: 'classManagerFilterCleared',
			trigger: 'header',
		} );
	} );

	it( 'should not show clear all button when no filters are active', () => {
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			search: {} as SearchAndFilterContextType[ 'search' ],
			filters: {
				filters: {
					unused: false,
					empty: false,
					onThisPage: false,
				},
				setFilters: mockSetFilters,
				onClearFilter: mockOnClearFilter,
			},
		} );

		render( <ActiveFilters /> );

		expect( screen.queryByRole( 'button', { name: /clear filters/i } ) ).not.toBeInTheDocument();
	} );
} );
