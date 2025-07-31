import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListSettingSection } from 'elementor/app/modules/import-export-customization/assets/js/shared/components/customization-list-setting-section';

global.__ = jest.fn( ( text ) => text );

describe( 'ListSettingSection Component', () => {
	const mockOnSettingChange = jest.fn();
	const mockItems = [
		{ label: 'Item 1', value: 'item1' },
		{ label: 'Item 2', value: 'item2' },
		{ label: 'Item 3', value: 'item3' },
		{ label: 'Item 4', value: 'item4' },
		{ label: 'Item 5', value: 'item5' },
		{ label: 'Item 6', value: 'item6' },
		{ label: 'Item 7', value: 'item7' },
		{ label: 'Item 8', value: 'item8' },
		{ label: 'Item 9', value: 'item9' },
		{ label: 'Item 10', value: 'item10' },
		{ label: 'Item 11', value: 'item11' },
		{ label: 'Item 12', value: 'item12' },
		{ label: 'Item 13', value: 'item13' },
		{ label: 'Item 14', value: 'item14' },
		{ label: 'Item 15', value: 'item15' },
		{ label: 'Item 16', value: 'item16' },
		{ label: 'Item 17', value: 'item17' },
		{ label: 'Item 18', value: 'item18' },
		{ label: 'Item 19', value: 'item19' },
		{ label: 'Item 20', value: 'item20' },
	];

	const defaultProps = {
		title: 'Test Settings',
		items: mockItems,
		settings: [],
		onSettingChange: mockOnSettingChange,
		settingKey: 'test-key',
		loading: false,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Component Rendering', () => {
		it( 'should render the component with title', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			expect( screen.getByText( 'Test Settings' ) ).toBeTruthy();
		} );

		it( 'should render "All" checkbox with correct label', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			expect( screen.getByText( 'All test settings' ) ).toBeTruthy();
		} );

		it( 'should render items in a grid layout', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			expect( screen.getByText( 'Item 1' ) ).toBeTruthy();
			expect( screen.getByText( 'Item 2' ) ).toBeTruthy();
			expect( screen.getByText( 'Item 3' ) ).toBeTruthy();
		} );

		it( 'should render loading spinner when loading is true', () => {
			render( <ListSettingSection { ...defaultProps } loading={ true } /> );

			const loadingElement = document.querySelector( '[role="progressbar"]' );
			expect( loadingElement ).toBeTruthy();
		} );

		it( 'should not render items when loading is true', () => {
			render( <ListSettingSection { ...defaultProps } loading={ true } /> );

			expect( screen.queryByText( 'Item 1' ) ).toBeFalsy();
			expect( screen.queryByText( 'Item 2' ) ).toBeFalsy();
		} );
	} );

	describe( 'Checkbox State Management', () => {
		it( 'should show "All" checkbox as checked when all items are selected', () => {
			const allSettings = mockItems.map( ( item ) => item.value );
			render( <ListSettingSection { ...defaultProps } settings={ allSettings } /> );

			const allCheckbox = screen.getByRole( 'checkbox', { name: /all test settings/i } );
			expect( allCheckbox.checked ).toBe( true );
		} );

		it( 'should show "All" checkbox as unchecked when not all items are selected', () => {
			const partialSettings = [ 'item1', 'item2' ];
			render( <ListSettingSection { ...defaultProps } settings={ partialSettings } /> );

			const allCheckbox = screen.getByRole( 'checkbox', { name: /all test settings/i } );
			expect( allCheckbox.checked ).toBe( false );
		} );

		it( 'should show "All" checkbox as unchecked when no items are selected', () => {
			render( <ListSettingSection { ...defaultProps } settings={ [] } /> );

			const allCheckbox = screen.getByRole( 'checkbox', { name: /all test settings/i } );
			expect( allCheckbox.checked ).toBe( false );
		} );

		it( 'should show individual checkboxes as checked for selected items', () => {
			const selectedSettings = [ 'item1', 'item3' ];
			render( <ListSettingSection { ...defaultProps } settings={ selectedSettings } /> );

			const item1Checkbox = screen.getByRole( 'checkbox', { name: 'Item 1' } );
			const item2Checkbox = screen.getByRole( 'checkbox', { name: 'Item 2' } );
			const item3Checkbox = screen.getByRole( 'checkbox', { name: 'Item 3' } );

			expect( item1Checkbox.checked ).toBe( true );
			expect( item2Checkbox.checked ).toBe( false );
			expect( item3Checkbox.checked ).toBe( true );
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should call onSettingChange with all items when "All" checkbox is checked', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			const allCheckbox = screen.getByRole( 'checkbox', { name: /all test settings/i } );
			fireEvent.click( allCheckbox );

			expect( mockOnSettingChange ).toHaveBeenCalledWith( mockItems.map( ( item ) => item.value ) );
		} );

		it( 'should call onSettingChange with empty array when "All" checkbox is unchecked', () => {
			const allSettings = mockItems.map( ( item ) => item.value );
			render( <ListSettingSection { ...defaultProps } settings={ allSettings } /> );

			const allCheckbox = screen.getByRole( 'checkbox', { name: /all test settings/i } );
			fireEvent.click( allCheckbox );

			expect( mockOnSettingChange ).toHaveBeenCalledWith( [] );
		} );

		it( 'should call onSettingChange with added item when individual checkbox is checked', () => {
			const currentSettings = [ 'item1' ];
			render( <ListSettingSection { ...defaultProps } settings={ currentSettings } /> );

			const item2Checkbox = screen.getByRole( 'checkbox', { name: 'Item 2' } );
			fireEvent.click( item2Checkbox );

			expect( mockOnSettingChange ).toHaveBeenCalledWith( [ 'item1', 'item2' ] );
		} );

		it( 'should call onSettingChange with removed item when individual checkbox is unchecked', () => {
			const currentSettings = [ 'item1', 'item2', 'item3' ];
			render( <ListSettingSection { ...defaultProps } settings={ currentSettings } /> );

			const item2Checkbox = screen.getByRole( 'checkbox', { name: 'Item 2' } );
			fireEvent.click( item2Checkbox );

			expect( mockOnSettingChange ).toHaveBeenCalledWith( [ 'item1', 'item3' ] );
		} );

		it( 'should handle multiple checkbox interactions correctly', () => {
			const currentSettings = [ 'item1' ];
			render( <ListSettingSection { ...defaultProps } settings={ currentSettings } /> );

			const item2Checkbox = screen.getByRole( 'checkbox', { name: 'Item 2' } );
			fireEvent.click( item2Checkbox );

			const item3Checkbox = screen.getByRole( 'checkbox', { name: 'Item 3' } );
			fireEvent.click( item3Checkbox );

			const item1Checkbox = screen.getByRole( 'checkbox', { name: 'Item 1' } );
			fireEvent.click( item1Checkbox );

			expect( mockOnSettingChange ).toHaveBeenCalledTimes( 3 );
			expect( mockOnSettingChange ).toHaveBeenNthCalledWith( 1, [ 'item1', 'item2' ] );
			expect( mockOnSettingChange ).toHaveBeenNthCalledWith( 2, [ 'item1', 'item3' ] );
			expect( mockOnSettingChange ).toHaveBeenNthCalledWith( 3, [] );
		} );
	} );

	describe( 'Show More Functionality', () => {
		it( 'should show "Show more" button when items exceed default visible count', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			expect( screen.getByText( 'Show more' ) ).toBeTruthy();
		} );

		it( 'should show "Show more" text when collapsed', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			const button = screen.getByRole( 'button', { name: 'Show more' } );
			expect( button.textContent ).toBe( 'Show more' );
		} );

		it( 'should not show "Show more" button when items are within default visible count', () => {
			const fewItems = mockItems.slice( 0, 10 );
			render( <ListSettingSection { ...defaultProps } items={ fewItems } /> );

			expect( screen.queryByText( 'Show more' ) ).toBeFalsy();
		} );

		it( 'should show only first 16 items initially', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			expect( screen.getByText( 'Item 1' ) ).toBeTruthy();
			expect( screen.getByText( 'Item 16' ) ).toBeTruthy();

			expect( screen.queryByText( 'Item 17' ) ).toBeFalsy();
		} );

		it( 'should show all items when "Show more" is clicked', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			const showMoreButton = screen.getByText( 'Show more' );
			fireEvent.click( showMoreButton );

			expect( screen.getByText( 'Item 1' ) ).toBeTruthy();
			expect( screen.getByText( 'Item 17' ) ).toBeTruthy();
			expect( screen.getByText( 'Item 20' ) ).toBeTruthy();
		} );

		it( 'should change button text to "Show less" when expanded', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			const showMoreButton = screen.getByText( 'Show more' );
			fireEvent.click( showMoreButton );

			expect( screen.getByText( 'Show less' ) ).toBeTruthy();
		} );

		it( 'should collapse items when "Show less" is clicked', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			const showMoreButton = screen.getByText( 'Show more' );
			fireEvent.click( showMoreButton );

			expect( screen.getByText( 'Item 17' ) ).toBeTruthy();
			expect( screen.getByText( 'Show less' ) ).toBeTruthy();

			const showLessButton = screen.getByText( 'Show less' );
			fireEvent.click( showLessButton );

			expect( screen.queryByText( 'Item 17' ) ).toBeFalsy();
			expect( screen.getByText( 'Show more' ) ).toBeTruthy();
		} );
	} );

	describe( 'Props Validation', () => {
		it( 'should handle numeric values in items', () => {
			const numericItems = [
				{ label: 'Number 1', value: 1 },
				{ label: 'Number 2', value: 2 },
			];
			const numericSettings = [ 1 ];

			render( <ListSettingSection { ...defaultProps } items={ numericItems } settings={ numericSettings } /> );

			const number1Checkbox = screen.getByRole( 'checkbox', { name: 'Number 1' } );
			const number2Checkbox = screen.getByRole( 'checkbox', { name: 'Number 2' } );

			expect( number1Checkbox.checked ).toBe( true );
			expect( number2Checkbox.checked ).toBe( false );
		} );

		it( 'should handle mixed string and numeric values', () => {
			const mixedItems = [
				{ label: 'String Item', value: 'string1' },
				{ label: 'Number Item', value: 123 },
			];
			const mixedSettings = [ 'string1', 123 ];

			render( <ListSettingSection { ...defaultProps } items={ mixedItems } settings={ mixedSettings } /> );

			const stringCheckbox = screen.getByRole( 'checkbox', { name: 'String Item' } );
			const numberCheckbox = screen.getByRole( 'checkbox', { name: 'Number Item' } );

			expect( stringCheckbox.checked ).toBe( true );
			expect( numberCheckbox.checked ).toBe( true );
		} );

		it( 'should handle empty items array', () => {
			render( <ListSettingSection { ...defaultProps } items={ [] } /> );

			expect( screen.getByText( 'Test Settings' ) ).toBeTruthy();
			expect( screen.getByText( 'All test settings' ) ).toBeTruthy();
			expect( screen.queryByText( 'Item 1' ) ).toBeFalsy();
		} );

		it( 'should handle empty settings array', () => {
			render( <ListSettingSection { ...defaultProps } settings={ [] } /> );

			const allCheckbox = screen.getByRole( 'checkbox', { name: /all test settings/i } );
			expect( allCheckbox.checked ).toBe( false );

			const item1Checkbox = screen.getByRole( 'checkbox', { name: 'Item 1' } );
			expect( item1Checkbox.checked ).toBe( false );
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'should have proper ARIA labels for checkboxes', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			const allCheckbox = screen.getByRole( 'checkbox', { name: /all test settings/i } );
			const item1Checkbox = screen.getByRole( 'checkbox', { name: 'Item 1' } );

			expect( allCheckbox ).toBeTruthy();
			expect( item1Checkbox ).toBeTruthy();
		} );

		it( 'should have proper button role for show more/less button', () => {
			render( <ListSettingSection { ...defaultProps } /> );

			const showMoreButton = screen.getByRole( 'button', { name: 'Show more' } );
			expect( showMoreButton ).toBeTruthy();
		} );
	} );

	describe( 'Edge Cases', () => {
		it( 'should handle duplicate values in settings array', () => {
			const duplicateSettings = [ 'item1', 'item1', 'item2' ];
			render( <ListSettingSection { ...defaultProps } settings={ duplicateSettings } /> );

			const item1Checkbox = screen.getByRole( 'checkbox', { name: 'Item 1' } );
			const item2Checkbox = screen.getByRole( 'checkbox', { name: 'Item 2' } );

			expect( item1Checkbox.checked ).toBe( true );
			expect( item2Checkbox.checked ).toBe( true );
		} );

		it( 'should handle settings with values not in items', () => {
			const invalidSettings = [ 'item1', 'non-existent-item' ];
			render( <ListSettingSection { ...defaultProps } settings={ invalidSettings } /> );

			const item1Checkbox = screen.getByRole( 'checkbox', { name: 'Item 1' } );
			expect( item1Checkbox.checked ).toBe( true );

			const allCheckbox = screen.getByRole( 'checkbox', { name: /all test settings/i } );
			expect( allCheckbox.checked ).toBe( false );
		} );

		it( 'should handle very long item labels', () => {
			const longLabelItems = [
				{ label: 'This is a very long label that might cause layout issues in the UI', value: 'long1' },
				{ label: 'Another extremely long label that could potentially break the grid layout', value: 'long2' },
			];

			render( <ListSettingSection { ...defaultProps } items={ longLabelItems } /> );

			expect( screen.getByText( 'This is a very long label that might cause layout issues in the UI' ) ).toBeTruthy();
			expect( screen.getByText( 'Another extremely long label that could potentially break the grid layout' ) ).toBeTruthy();
		} );
	} );
} );
