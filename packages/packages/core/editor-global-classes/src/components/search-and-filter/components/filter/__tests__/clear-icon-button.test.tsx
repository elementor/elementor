import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { mockTrackGlobalClasses, mockTrackingModule } from '../../../../../__tests__/mocks';
import { useSearchAndFilters } from '../../../context';
import { ClearIconButton } from '../clear-icon-button';

jest.mock( '../../../context' );
jest.mock( '../../../../../utils/tracking', () => mockTrackingModule );

describe( 'ClearIconButton', () => {
	const mockOnClearFilter = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			search: {
				inputValue: '',
				debouncedValue: '',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			},
			filters: {
				filters: { empty: false, onThisPage: false, unused: false },
				setFilters: jest.fn(),
				onClearFilter: mockOnClearFilter,
			},
		} );
	} );

	it( 'should track classManagerFilterCleared event with menu trigger when clicking clear button', () => {
		renderWithTheme( <ClearIconButton tooltipText="Clear filters" trigger="menu" /> );

		const clearButton = screen.getByRole( 'button', { name: 'Clear filters' } );
		fireEvent.click( clearButton );

		expect( mockOnClearFilter ).toHaveBeenCalledWith( 'menu' );
		expect( mockTrackGlobalClasses ).toHaveBeenCalledWith( {
			event: 'classManagerFilterCleared',
			trigger: 'menu',
		} );
	} );

	it( 'should track classManagerFilterCleared event with header trigger when clicking clear button', () => {
		renderWithTheme( <ClearIconButton tooltipText="Clear filters" trigger="header" /> );

		const clearButton = screen.getByRole( 'button', { name: 'Clear filters' } );
		fireEvent.click( clearButton );

		expect( mockOnClearFilter ).toHaveBeenCalledWith( 'header' );
		expect( mockTrackGlobalClasses ).toHaveBeenCalledWith( {
			event: 'classManagerFilterCleared',
			trigger: 'header',
		} );
	} );
} );
