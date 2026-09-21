import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import SeverityFilterChips from '../severity-filter-chips';

describe( 'SeverityFilterChips', () => {
	it( 'renders the All, Errors, Warnings and Suggestions chips', () => {
		// Arrange & Act.
		renderWithTheme( <SeverityFilterChips selected="all" onChange={ jest.fn() } /> );

		// Assert.
		expect( screen.getByText( 'All' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Errors' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Warnings' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Suggestions' ) ).toBeInTheDocument();
	} );

	it( 'calls onChange with the clicked severity', () => {
		// Arrange.
		const onChange = jest.fn();
		renderWithTheme( <SeverityFilterChips selected="all" onChange={ onChange } /> );

		// Act.
		fireEvent.click( screen.getByText( 'Errors' ) );

		// Assert.
		expect( onChange ).toHaveBeenCalledWith( 'error' );
	} );

	it( 'calls onChange with "all" when the All chip is clicked', () => {
		// Arrange.
		const onChange = jest.fn();
		renderWithTheme( <SeverityFilterChips selected="error" onChange={ onChange } /> );

		// Act.
		fireEvent.click( screen.getByText( 'All' ) );

		// Assert.
		expect( onChange ).toHaveBeenCalledWith( 'all' );
	} );
} );
