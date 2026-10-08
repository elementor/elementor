import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import { type ValueFieldProps } from '../../../variables-registry/create-variable-type-registry';
import { ColorField } from '../../fields/color-field';
import { VariableEditableCell } from '../variable-editable-cell';

jest.mock( '../../../context/variable-selection-popover.context', () => ( {
	usePopoverContentRef: jest.fn( () => null ),
} ) );

describe( 'VariableEditableCell color picker', () => {
	const mockOnChange = jest.fn();

	const ColorFieldElement = ( props: ValueFieldProps ) => <ColorField { ...props } />;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'keeps edit mode when interacting with the portaled color format menu', async () => {
		renderWithTheme(
			<VariableEditableCell
				initialValue="#ff0000"
				editableElement={ ColorFieldElement }
				onChange={ mockOnChange }
				fieldType="value"
			>
				<span>#ff0000</span>
			</VariableEditableCell>
		);

		const editStack = screen.getByRole( 'button', { name: 'Double click or press Space to edit' } );
		fireEvent.doubleClick( editStack );

		// eslint-disable-next-line testing-library/no-node-access -- ColorField root id is the stable hook for the picker trigger
		const colorField = document.getElementById( 'color-variable-field' );
		expect( colorField ).toBeTruthy();

		const pickerTrigger = within( colorField as HTMLElement ).getByRole( 'button' );
		fireEvent.click( pickerTrigger );

		const formatSelect = await screen.findByRole( 'combobox', { hidden: true } );
		fireEvent.mouseDown( formatSelect );

		const listbox = await screen.findByRole( 'listbox', { hidden: true } );
		const rgbOption = within( listbox ).getByRole( 'option', { name: 'RGB', hidden: true } );
		fireEvent.click( rgbOption );

		await waitFor( () => {
			expect( formatSelect ).toHaveTextContent( 'RGB' );
		} );

		expect( mockOnChange ).not.toHaveBeenCalled();
		expect( formatSelect ).toBeInTheDocument();
	} );
} );
