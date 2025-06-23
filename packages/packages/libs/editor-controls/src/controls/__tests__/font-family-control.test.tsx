import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { FontFamilyControl } from '../font-family-control/font-family-control';

const propType = createMockPropType( { kind: 'plain' } );

describe( 'FontFamilyControl', () => {
	const mockFontFamilies = [
		{
			label: 'Google',
			fonts: [ 'Roboto', 'Open Sans', 'Lato', 'Montserrat' ],
		},
		{
			label: 'System',
			fonts: [ 'Arial', 'Helvetica', 'Tahoma', 'Verdana' ],
		},
	];

	const defaultProps = {
		setValue: jest.fn(),
		value: { $$type: 'string', value: 'Arial' },
		bind: 'fontFamily',
		propType,
	};

	beforeEach( () => {
		globalThis.Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue( { height: 1000, width: 1000 } );
	} );

	it( 'should show all options when no search is performed', () => {
		// Arrange.
		renderControl( <FontFamilyControl fontFamilies={ mockFontFamilies } sectionWidth={ 320 } />, defaultProps );

		// Act.
		const fontFamilyButton = screen.getByRole( 'button' );
		fireEvent.click( fontFamilyButton );

		// Assert.
		mockFontFamilies.forEach( ( { label, fonts } ) => {
			expect( screen.getByText( label ) ).toBeInTheDocument();

			fonts.forEach( ( font ) => {
				if ( font === defaultProps.value.value ) {
					expect( screen.getAllByText( font ).length ).toBe( 2 );
					return;
				}

				expect( screen.getByText( font ) ).toBeInTheDocument();
			} );
		} );
	} );

	it( 'should show relevant options on search', () => {
		// Arrange.
		renderControl( <FontFamilyControl fontFamilies={ mockFontFamilies } sectionWidth={ 320 } />, defaultProps );

		// Act.
		const fontFamilyButton = screen.getByRole( 'button' );
		fireEvent.click( fontFamilyButton );

		const searchInput = screen.getByPlaceholderText( 'Search' );
		fireEvent.change( searchInput, { target: { value: 'Ro' } } );

		// Assert.
		expect( screen.getByText( 'Google' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Roboto' ) ).toBeInTheDocument();

		expect( screen.queryByText( 'System' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Helvetica' ) ).not.toBeInTheDocument();

		expect( screen.queryByText( 'Open Sans' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Lato' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Montserrat' ) ).not.toBeInTheDocument();
	} );

	it( 'should show placeholder when there is no search results', () => {
		// Arrange.
		renderControl( <FontFamilyControl fontFamilies={ mockFontFamilies } sectionWidth={ 320 } />, defaultProps );

		// Act.
		const fontFamilyButton = screen.getByRole( 'button' );
		fireEvent.click( fontFamilyButton );

		const searchInput = screen.getByPlaceholderText( 'Search' );
		fireEvent.change( searchInput, { target: { value: 'NonExistentFont' } } );

		// Assert
		expect( screen.queryByText( 'System' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Tahoma' ) ).not.toBeInTheDocument();

		// Test clearing the filters
		fireEvent.click( screen.getByText( 'Clear & try again' ) );

		// After clearing, fonts should be visible again
		expect( screen.getByText( 'System' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Tahoma' ) ).toBeInTheDocument();
	} );

	it( 'should select an option when a user clicks on it', () => {
		// Arrange.
		renderControl( <FontFamilyControl fontFamilies={ mockFontFamilies } sectionWidth={ 320 } />, defaultProps );

		// Act.
		const fontFamilyButton = screen.getByRole( 'button' );
		fireEvent.click( fontFamilyButton );

		const selectedOption = screen.getByText( 'Roboto' );
		fireEvent.click( selectedOption );

		// Assert
		expect( defaultProps.setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'Roboto',
		} );
	} );
} );
