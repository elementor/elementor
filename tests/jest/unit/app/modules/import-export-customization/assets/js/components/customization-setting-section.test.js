import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingSection } from 'elementor/app/modules/import-export-customization/assets/js/shared/components/customization-setting-section';

describe( 'SettingSection Component', () => {
	const mockOnSettingChange = jest.fn();
	const defaultProps = {
		title: 'Test Setting',
		settingKey: 'test-key',
		onSettingChange: mockOnSettingChange,
		checked: false,
		hasToggle: true,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Component Rendering', () => {
		it( 'should render the component with title', () => {
			render( <SettingSection { ...defaultProps } /> );

			expect( screen.getByText( 'Test Setting' ) ).toBeTruthy();
		} );

		it( 'should render description when provided', () => {
			const description = 'This is a test description';

			render( <SettingSection { ...defaultProps } description={ description } /> );

			const descriptionEl = screen.getByTestId( `${ defaultProps.settingKey }-description` );

			expect( descriptionEl ).toBeTruthy();
			expect( descriptionEl.textContent ).toBe( description );
		} );

		it( 'should not render description when not provided', () => {
			render( <SettingSection { ...defaultProps } /> );

			waitFor( () => {
				expect( () => screen.getByTestId( `${ defaultProps.settingKey }-description` ) ).toThrow();
			} );
		} );

		it( 'should render switch when hasToggle is true', () => {
			render( <SettingSection { ...defaultProps } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			expect( switchElement ).toBeTruthy();
		} );

		it( 'should not render switch when hasToggle is false', () => {
			render( <SettingSection { ...defaultProps } hasToggle={ false } /> );

			waitFor( () => {
				expect( () => screen.getByTestId( `${ defaultProps.settingKey }-switch` ) ).toThrow();
			} );
		} );

		it( 'should render children when provided', () => {
			const childText = 'Child content';
			render( <SettingSection { ...defaultProps }>{ childText }</SettingSection> );

			expect( screen.getByText( childText ) ).toBeTruthy();
		} );
	} );

	describe( 'Switch State Management', () => {
		it( 'should show switch as checked when checked prop is true', () => {
			render( <SettingSection { ...defaultProps } checked={ true } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.checked ).toBe( true );
		} );

		it( 'should show switch as unchecked when checked prop is false', () => {
			render( <SettingSection { ...defaultProps } checked={ false } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.checked ).toBe( false );
		} );

		it( 'should default to unchecked when checked prop is not provided', () => {
			const { checked, ...propsWithoutChecked } = defaultProps;
			render( <SettingSection { ...propsWithoutChecked } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.checked ).toBe( false );
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should call onSettingChange with settingKey and true when switch is turned on', () => {
			// Arrange
			render( <SettingSection { ...defaultProps } /> );

			// Act
			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			fireEvent.click( inputElement );

			// Assert
			expect( mockOnSettingChange ).toHaveBeenCalledWith( 'test-key', true );
		} );

		it( 'should call onSettingChange with settingKey and false when switch is turned off', () => {
			// Arrange
			render( <SettingSection { ...defaultProps } checked={ true } /> );

			// Act
			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			fireEvent.click( inputElement );

			// Assert
			expect( mockOnSettingChange ).toHaveBeenCalledWith( 'test-key', false );
		} );

		it( 'should handle multiple switch interactions', () => {
			// Arrange
			render( <SettingSection { ...defaultProps } /> );

			// Act
			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );

			fireEvent.click( inputElement );
			expect( mockOnSettingChange ).toHaveBeenNthCalledWith( 1, 'test-key', true );

			fireEvent.click( inputElement );
			expect( mockOnSettingChange ).toHaveBeenNthCalledWith( 2, 'test-key', true );

			// Assert
			expect( mockOnSettingChange ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	describe( 'Layout and Styling', () => {
		it( 'should render with proper layout structure', () => {
			const { container } = render( <SettingSection { ...defaultProps } /> );

			const mainBox = container.firstChild;
			expect( mainBox ).toBeTruthy();
		} );

		it( 'should render children when provided', () => {
			const childText = 'Child content';
			render( <SettingSection { ...defaultProps }>{ childText }</SettingSection> );

			expect( screen.getByText( childText ) ).toBeTruthy();
		} );
	} );
} );
