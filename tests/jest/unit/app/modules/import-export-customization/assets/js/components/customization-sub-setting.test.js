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
	} );
} );
