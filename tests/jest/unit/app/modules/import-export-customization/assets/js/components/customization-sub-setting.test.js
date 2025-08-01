import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubSetting } from 'elementor/app/modules/import-export-customization/assets/js/shared/components/customization-sub-setting';

describe( 'SubSetting Component', () => {
	const mockOnSettingChange = jest.fn();
	const defaultProps = {
		label: 'Test Sub Setting',
		settingKey: 'test-sub-key',
		onSettingChange: mockOnSettingChange,
		checked: false,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Component Rendering', () => {
		it( 'should render label correctly', () => {
			render( <SubSetting { ...defaultProps } /> );

			const labelElement = screen.getByTestId( `${ defaultProps.settingKey }-label` );
			expect( labelElement ).toBeTruthy();
			expect( labelElement.textContent ).toBe( defaultProps.label );
		} );
	} );

	describe( 'Switch State Management', () => {
		it( 'should show switch as checked when checked prop is true', () => {
			render( <SubSetting { ...defaultProps } checked={ true } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.checked ).toBe( true );
		} );

		it( 'should show switch as unchecked when checked prop is false', () => {
			render( <SubSetting { ...defaultProps } checked={ false } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.checked ).toBe( false );
		} );

		it( 'should default to unchecked when checked prop is not provided', () => {
			const { checked, ...propsWithoutChecked } = defaultProps;
			render( <SubSetting { ...propsWithoutChecked } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.checked ).toBe( false );
		} );
	} );

	describe( 'Disabled State Functionality', () => {
		it( 'should render switch as enabled when disabled prop is false', () => {
			render( <SubSetting { ...defaultProps } disabled={ false } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.disabled ).toBe( false );
		} );

		it( 'should render switch as disabled when disabled prop is true', () => {
			render( <SubSetting { ...defaultProps } disabled={ true } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.disabled ).toBe( true );
		} );

		it( 'should default to enabled when disabled prop is not provided', () => {
			render( <SubSetting { ...defaultProps } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.disabled ).toBe( false );
		} );

		it( 'should maintain checked state when disabled', () => {
			render( <SubSetting { ...defaultProps } checked={ true } disabled={ true } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.checked ).toBe( true );
			expect( inputElement.disabled ).toBe( true );
		} );

		it( 'should maintain unchecked state when disabled', () => {
			render( <SubSetting { ...defaultProps } checked={ false } disabled={ true } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			expect( inputElement.checked ).toBe( false );
			expect( inputElement.disabled ).toBe( true );
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should call onSettingChange with settingKey and true when switch is turned on', () => {
			// Arrange
			render( <SubSetting { ...defaultProps } /> );

			// Act
			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			fireEvent.click( inputElement );

			// Assert
			expect( mockOnSettingChange ).toHaveBeenCalledWith( 'test-sub-key', true );
		} );

		it( 'should call onSettingChange with settingKey and false when switch is turned off', () => {
			// Arrange
			render( <SubSetting { ...defaultProps } checked={ true } /> );

			// Act
			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			fireEvent.click( inputElement );

			// Assert
			expect( mockOnSettingChange ).toHaveBeenCalledWith( 'test-sub-key', false );
		} );

		it( 'should not call onSettingChange when disabled switch is clicked', () => {
			// Arrange
			render( <SubSetting { ...defaultProps } disabled={ true } /> );

			// Act
			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			fireEvent.click( inputElement );

			// Assert
			expect( mockOnSettingChange ).not.toHaveBeenCalled();
		} );

		it( 'should not call onSettingChange when disabled checked switch is clicked', () => {
			// Arrange
			render( <SubSetting { ...defaultProps } checked={ true } disabled={ true } /> );

			// Act
			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			fireEvent.click( inputElement );

			// Assert
			expect( mockOnSettingChange ).not.toHaveBeenCalled();
		} );

		it( 'should handle multiple interactions correctly when enabled', () => {
			// Arrange
			render( <SubSetting { ...defaultProps } /> );

			// Act
			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			
			// First click - turn on
			fireEvent.click( inputElement );
			// Second click - turn off
			fireEvent.click( inputElement );

			// Assert
			expect( mockOnSettingChange ).toHaveBeenCalledTimes( 2 );
			expect( mockOnSettingChange ).toHaveBeenNthCalledWith( 1, 'test-sub-key', true );
			expect( mockOnSettingChange ).toHaveBeenNthCalledWith( 2, 'test-sub-key', false );
		} );
	} );

	describe( 'Props Validation', () => {
		it( 'should handle missing onSettingChange gracefully', () => {
			const { onSettingChange, ...propsWithoutHandler } = defaultProps;
			
			render( <SubSetting { ...propsWithoutHandler } /> );

			const switchElement = screen.getByTestId( `${ defaultProps.settingKey }-switch` );
			const inputElement = switchElement.querySelector( 'input' );
			
			// Should not throw error when clicked without handler
			expect( () => fireEvent.click( inputElement ) ).not.toThrow();
		} );

		it( 'should handle missing label gracefully', () => {
			const { label, ...propsWithoutLabel } = defaultProps;
			
			expect( () => {
				render( <SubSetting { ...propsWithoutLabel } /> );
			} ).toThrow();
		} );

		it( 'should handle missing settingKey gracefully', () => {
			const { settingKey, ...propsWithoutKey } = defaultProps;
			
			expect( () => {
				render( <SubSetting { ...propsWithoutKey } /> );
			} ).toThrow();
		} );
	} );

	describe( 'Edge Cases', () => {
		it( 'should handle very long labels', () => {
			const longLabel = 'This is a very long label that might cause layout issues in the UI and should be handled gracefully by the component';
			
			render( <SubSetting { ...defaultProps } label={ longLabel } /> );

			const labelElement = screen.getByTestId( `${ defaultProps.settingKey }-label` );
			expect( labelElement.textContent ).toBe( longLabel );
		} );

		it( 'should handle special characters in settingKey', () => {
			const specialKey = 'test-setting-key-with-special-chars-123!@#';
			
			render( <SubSetting { ...defaultProps } settingKey={ specialKey } /> );

			const labelElement = screen.getByTestId( `${ specialKey }-label` );
			const switchElement = screen.getByTestId( `${ specialKey }-switch` );
			
			expect( labelElement ).toBeTruthy();
			expect( switchElement ).toBeTruthy();
		} );

		it( 'should handle empty label', () => {
			render( <SubSetting { ...defaultProps } label="" /> );

			const labelElement = screen.getByTestId( `${ defaultProps.settingKey }-label` );
			expect( labelElement.textContent ).toBe( "" );
		} );
	} );
} );
