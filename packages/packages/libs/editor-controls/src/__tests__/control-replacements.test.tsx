import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { useBoundProp } from '../bound-prop-context';
import { ControlReplacementsProvider, createControlReplacementsRegistry } from '../control-replacements';
import { createControl } from '../create-control';

jest.mock( '../bound-prop-context' );

describe( 'control-replacements', () => {
	const Control = createControl( ( { text }: { text: string } ) => <p>{ text }</p> );

	beforeEach( () => {
		jest.mocked( useBoundProp ).mockReturnValue( { value: 'value' } as never );
	} );

	it( 'should render the first matching replacement control component when its condition is met', () => {
		// Arrange.
		const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

		jest.mocked( useBoundProp )
			.mockReturnValueOnce( {
				value: 'should-not-be-replaced',
			} as never )
			.mockReturnValueOnce( {
				value: 'should-be-replaced-by-2-or-3',
			} as never );

		registerControlReplacement( {
			component: () => <div>replacement-1</div>,
			condition: ( { value } ) => value === 'should-be-replaced-by-1',
		} );

		registerControlReplacement( {
			component: () => <div>replacement-2</div>,
			condition: ( { value } ) => value === 'should-be-replaced-by-2-or-3',
		} );

		registerControlReplacement( {
			component: () => <div>replacement-3</div>,
			condition: ( { value } ) => value === 'should-be-replaced-by-2-or-3',
		} );

		// Act.
		renderWithTheme(
			<ControlReplacementsProvider replacements={ getControlReplacements() }>
				<Control text="should-not-be-replaced" />
				<Control text="should-be-replaced" />
			</ControlReplacementsProvider>
		);

		// Assert.
		expect( screen.getByText( 'should-not-be-replaced' ) ).toBeInTheDocument();

		expect( screen.queryByText( 'should-be-replaced' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'replacement-2' ) ).toBeInTheDocument();

		expect( screen.queryByText( 'replacement-1' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'replacement-3' ) ).not.toBeInTheDocument();
	} );

	it( 'should not replace if the condition throws', () => {
		// Arrange.
		const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

		registerControlReplacement( {
			component: () => <div>replacement</div>,
			condition: () => {
				throw new Error( 'Error' );
			},
		} );

		// Act.
		renderWithTheme(
			<ControlReplacementsProvider replacements={ getControlReplacements() }>
				<Control text="control-text" />
			</ControlReplacementsProvider>
		);

		// Assert.
		expect( screen.getByText( 'control-text' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'replacement' ) ).not.toBeInTheDocument();
	} );
} );
