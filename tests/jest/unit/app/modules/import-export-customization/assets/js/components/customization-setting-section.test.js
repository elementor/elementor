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

	describe( 'Disabled State Functionality', () => {
		it( 'should render switch as enabled when disabled prop is false', () => {
			render( <SettingSection { ...defaultProps } disabled={ false } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.disabled ).toBe( false );
		} );

		it( 'should render switch as disabled when disabled prop is true', () => {
			render( <SettingSection { ...defaultProps } disabled={ true } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.disabled ).toBe( true );
		} );

		it( 'should default to enabled when disabled prop is not provided', () => {
			render( <SettingSection { ...defaultProps } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.disabled ).toBe( false );
		} );

		it( 'should maintain checked state when disabled', () => {
			render( <SettingSection { ...defaultProps } checked={ true } disabled={ true } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.checked ).toBe( true );
			expect( inputElement.disabled ).toBe( true );
		} );

		it( 'should maintain unchecked state when disabled', () => {
			render( <SettingSection { ...defaultProps } checked={ false } disabled={ true } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.checked ).toBe( false );
			expect( inputElement.disabled ).toBe( true );
		} );

		it( 'should not render switch when hasToggle is false and disabled is true', () => {
			render( <SettingSection { ...defaultProps } hasToggle={ false } disabled={ true } /> );

			waitFor( () => {
				expect( () => screen.getByTestId( `${ defaultProps.settingKey }-switch` ) ).toThrow();
			} );
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

		it( 'should not call onSettingChange when disabled switch is clicked', () => {
			// Arrange
			render( <SettingSection { ...defaultProps } disabled={ true } /> );

			// Act
			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			fireEvent.click( inputElement );

			// Assert
			expect( mockOnSettingChange ).not.toHaveBeenCalled();
		} );

		it( 'should not call onSettingChange when disabled checked switch is clicked', () => {
			// Arrange
			render( <SettingSection { ...defaultProps } checked={ true } disabled={ true } /> );

			// Act
			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			fireEvent.click( inputElement );

			// Assert
			expect( mockOnSettingChange ).not.toHaveBeenCalled();
		} );

		it( 'should handle multiple interactions correctly when enabled', () => {
			// Arrange
			render( <SettingSection { ...defaultProps } /> );

			// Act
			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			
			// First click - turn on
			fireEvent.click( inputElement );
			// Second click - turn off
			fireEvent.click( inputElement );

			// Assert
			expect( mockOnSettingChange ).toHaveBeenCalledTimes( 2 );
			expect( mockOnSettingChange ).toHaveBeenNthCalledWith( 1, 'test-key', true );
			expect( mockOnSettingChange ).toHaveBeenNthCalledWith( 2, 'test-key', false );
		} );

		it( 'should handle interactions when hasToggle is false', () => {
			// Arrange
			render( <SettingSection { ...defaultProps } hasToggle={ false } /> );

			// Act - try to find switch (should not exist)
			expect( () => screen.getByTestId( `${ defaultProps.settingKey }-switch` ) ).toThrow();
		} );
	} );

	describe( 'Props Validation', () => {
		it( 'should handle missing onSettingChange gracefully', () => {
			const { onSettingChange, ...propsWithoutHandler } = defaultProps;
			
			render( <SettingSection { ...propsWithoutHandler } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			
			// Should not throw error when clicked without handler
			expect( () => fireEvent.click( inputElement ) ).not.toThrow();
		} );

		it( 'should handle missing title gracefully', () => {
			const { title, ...propsWithoutTitle } = defaultProps;
			
			expect( () => {
				render( <SettingSection { ...propsWithoutTitle } /> );
			} ).toThrow();
		} );

		it( 'should handle missing settingKey gracefully', () => {
			const { settingKey, ...propsWithoutKey } = defaultProps;
			
			expect( () => {
				render( <SettingSection { ...propsWithoutKey } /> );
			} ).toThrow();
		} );
	} );

	describe( 'Edge Cases', () => {
		it( 'should handle very long titles', () => {
			const longTitle = 'This is a very long title that might cause layout issues in the UI and should be handled gracefully by the component';
			
			render( <SettingSection { ...defaultProps } title={ longTitle } /> );

			expect( screen.getByText( longTitle ) ).toBeTruthy();
		} );

		it( 'should handle very long descriptions', () => {
			const longDescription = 'This is a very long description that might cause layout issues in the UI and should be handled gracefully by the component. It contains multiple sentences and should still render properly.';
			
			render( <SettingSection { ...defaultProps } description={ longDescription } /> );

			const descriptionEl = screen.getByTestId( `${ defaultProps.settingKey }-description` );
			expect( descriptionEl.textContent ).toBe( longDescription );
		} );

		it( 'should handle special characters in settingKey', () => {
			const specialKey = 'test-setting-key-with-special-chars-123!@#';
			
			render( <SettingSection { ...defaultProps } settingKey={ specialKey } /> );

			const switchElement = screen.getByTestId( `${ specialKey }-switch` );
			expect( switchElement ).toBeTruthy();
		} );

		it( 'should handle empty title', () => {
			render( <SettingSection { ...defaultProps } title="" /> );

			expect( screen.getByText( "" ) ).toBeTruthy();
		} );

		it( 'should handle empty description', () => {
			render( <SettingSection { ...defaultProps } description="" /> );

			const descriptionEl = screen.getByTestId( `${ defaultProps.settingKey }-description` );
			expect( descriptionEl.textContent ).toBe( "" );
		} );

		it( 'should handle complex children content', () => {
			const complexChild = (
				<div>
					<span>Nested content</span>
					<button>Child button</button>
				</div>
			);
			
			render( <SettingSection { ...defaultProps }>{ complexChild }</SettingSection> );

			expect( screen.getByText( 'Nested content' ) ).toBeTruthy();
			expect( screen.getByText( 'Child button' ) ).toBeTruthy();
		} );
	} );
} );
