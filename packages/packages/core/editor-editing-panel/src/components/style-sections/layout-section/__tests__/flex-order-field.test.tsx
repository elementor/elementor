import * as React from 'react';
import { createMockPropType, renderField } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { useStylesField } from '../../../../hooks/use-styles-field';
import { FIRST_DEFAULT_VALUE, FlexOrderField, LAST_DEFAULT_VALUE } from '../flex-order-field';

jest.mock( '@elementor/editor-styles' );
jest.mock( '../../../../hooks/use-styles-field' );
jest.mock( '../../../../styles-inheritance/components/styles-inheritance-indicator' );
jest.mock( '../../../../contexts/style-context', () => ( {
	useStyle: () => ( { meta: null } ),
} ) );
jest.mock( '../../../../contexts/styles-inheritance-context', () => ( {
	useStylesInheritanceChain: () => [],
} ) );

jest.mock( '@elementor/editor-controls', () => {
	const actual = jest.requireActual( '@elementor/editor-controls' );
	return {
		...actual,
		useControlActions: () => ( {
			items: [],
		} ),
	};
} );

const renderFlexOrderField = () => {
	renderField( <FlexOrderField />, {
		propTypes: { order: createMockPropType( { kind: 'plain' } ) },
	} );
};

describe( '<FlexOrderField />', () => {
	const buttonValues = [
		{ $$type: 'number', value: FIRST_DEFAULT_VALUE },
		{ $$type: 'number', value: LAST_DEFAULT_VALUE },
		null,
	];

	it( 'should affect css order property on button change', () => {
		// Arrange.
		const value = null;
		const setValue = jest.fn();

		jest.mocked( useStylesField ).mockReturnValue( { value, setValue, canEdit: true } );

		// Act.
		renderFlexOrderField();

		const buttons = screen.getAllByRole( 'button' );

		buttons.forEach( ( button, index ) => {
			// Act.
			fireEvent.click( button );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( buttonValues[ index ] );
		} );
	} );

	it( 'should render the custom input when clicking on custom button', () => {
		// Arrange.
		const value = null;
		const setValue = jest.fn();

		jest.mocked( useStylesField ).mockReturnValue( { value, setValue, canEdit: true } );

		// Act.
		renderFlexOrderField();

		const customButton = screen.getByLabelText( 'Custom' );

		// Act.
		fireEvent.click( customButton );

		const customControlLabel = screen.getByText( 'Custom order' );

		// Assert.
		expect( customControlLabel ).toBeVisible();
	} );

	it( 'should mark "first" button as selected for corresponding value', () => {
		// Arrange.
		const value = { $$type: 'number', value: FIRST_DEFAULT_VALUE };
		const setValue = jest.fn();

		jest.mocked( useStylesField ).mockReturnValue( { value, setValue, canEdit: true } );

		renderFlexOrderField();

		const firstButton = screen.getByLabelText( 'First' );

		// Assert.
		expect( firstButton ).toHaveClass( 'Mui-selected' );

		// Act.
		fireEvent.click( firstButton );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( null );
		expect( firstButton ).not.toHaveClass( 'Mui-selected' );
	} );

	it( 'should mark "last" button as selected for corresponding value', () => {
		// Arrange.
		const value = { $$type: 'number', value: LAST_DEFAULT_VALUE };
		const setValue = jest.fn();

		jest.mocked( useStylesField ).mockReturnValue( { value, setValue, canEdit: true } );

		renderFlexOrderField();

		const firstButton = screen.getByLabelText( 'Last' );

		// Assert.
		expect( firstButton ).toHaveClass( 'Mui-selected' );

		// Act.
		fireEvent.click( firstButton );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( null );
		expect( firstButton ).not.toHaveClass( 'Mui-selected' );
	} );

	it( 'should mark "custom" button as selected for corresponding value', () => {
		// Arrange.
		const value = { $$type: 'number', value: 3 };
		const setValue = jest.fn();

		jest.mocked( useStylesField ).mockReturnValue( { value, setValue, canEdit: true } );

		renderFlexOrderField();

		const firstButton = screen.getByLabelText( 'Custom' );

		// Assert.
		expect( firstButton ).toHaveClass( 'Mui-selected' );

		// Act.
		fireEvent.click( firstButton );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( null );
		expect( firstButton ).not.toHaveClass( 'Mui-selected' );
	} );
} );
