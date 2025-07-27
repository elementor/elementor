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

	it.skip( 'should show all options when no search is performed', () => {
		// TODO: Fix me!
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

	it.skip( 'should show relevant options on search', () => {
		// TODO: Fix me!
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

	it.skip( 'should show placeholder when there is no search results', () => {
		// TODO: Fix me!
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

	it.skip( 'should select an option when a user clicks on it', () => {
		// TODO: Fix me!
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

	it( 'should display the font family value when value is set', () => {
		// Arrange.
		const propsWithValue = {
			...defaultProps,
			value: { $$type: 'string', value: 'Helvetica' },
		};

		// Act.
		renderControl( <FontFamilyControl fontFamilies={ mockFontFamilies } sectionWidth={ 320 } />, propsWithValue );

		// Assert.
		const selectedOption = screen.getByText( 'Helvetica' );
		expect( selectedOption ).toBeInTheDocument();
	} );

	it( 'should display placeholder when no value is set and placeholder is provided', () => {
		// Arrange.
		const propsWithPlaceholder = {
			...defaultProps,
			value: { $$type: 'string', value: null },
			placeholder: { $$type: 'string', value: 'Arial' },
		};

		// Act.
		renderControl(
			<FontFamilyControl fontFamilies={ mockFontFamilies } sectionWidth={ 320 } />,
			propsWithPlaceholder
		);

		// Assert.
		const selectedOption = screen.getByText( 'Arial' );
		expect( selectedOption ).toBeInTheDocument();
	} );

	it( 'should display empty state when no value and no placeholder', () => {
		// Arrange.
		const propsWithoutValueOrPlaceholder = {
			...defaultProps,
			value: { $$type: 'string', value: null },
			placeholder: undefined,
		};

		// Act.
		renderControl(
			<FontFamilyControl fontFamilies={ mockFontFamilies } sectionWidth={ 320 } />,
			propsWithoutValueOrPlaceholder
		);

		// Assert.
		const fontFamilyButton = screen.getByRole( 'button' );

		expect( fontFamilyButton ).toBeInTheDocument();

		const allGenericElements = screen.getAllByRole( 'generic' );
		const hasEmptyElement = allGenericElements.some( ( el ) => el.textContent === '' );

		expect( hasEmptyElement ).toBe( true );
	} );

	it.skip( 'should update from placeholder to value when font is selected', () => {
		// TODO: Fix me!
		// Arrange.
		const setValue = jest.fn();
		const propsWithPlaceholder = {
			...defaultProps,
			setValue,
			value: { $$type: 'string', value: null },
			placeholder: { $$type: 'string', value: 'Choose a font' },
		};

		renderControl(
			<FontFamilyControl fontFamilies={ mockFontFamilies } sectionWidth={ 320 } />,
			propsWithPlaceholder
		);
		const fontFamilyButton = screen.getByRole( 'button' );

		expect( screen.getByText( 'Choose a font' ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( fontFamilyButton );
		const selectedOption = screen.getByText( 'Lato' );
		fireEvent.click( selectedOption );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'Lato',
		} );
	} );

	it( 'should not apply placeholder when value is set', () => {
		// Arrange.
		const propsWithValue = {
			...defaultProps,
			value: { $$type: 'string', value: 'Roboto' },
			placeholder: { $$type: 'string', value: 'Select font family' },
		};

		// Act.
		renderControl( <FontFamilyControl fontFamilies={ mockFontFamilies } sectionWidth={ 320 } />, propsWithValue );

		// Assert.
		expect( screen.getByText( 'Roboto' ) ).toBeInTheDocument();
	} );

	it( 'should apply placeholder styling when showing placeholder', () => {
		// Arrange.
		const propsWithPlaceholder = {
			...defaultProps,
			value: { $$type: 'string', value: null },
			placeholder: { $$type: 'string', value: 'Select font family' },
		};

		// Act.
		renderControl(
			<FontFamilyControl fontFamilies={ mockFontFamilies } sectionWidth={ 320 } />,
			propsWithPlaceholder
		);

		// Assert.
		const placeholderText = screen.getByText( 'Select font family' );
		expect( placeholderText ).toBeInTheDocument();
		expect( placeholderText ).toHaveClass( 'MuiTypography-caption' );
	} );
} );
