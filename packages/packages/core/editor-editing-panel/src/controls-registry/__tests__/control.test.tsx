import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { type ControlComponent, useBoundProp } from '@elementor/editor-controls';
import { screen } from '@testing-library/react';

import { ElementProvider } from '../../contexts/element-context';
import { Control } from '../control';
import { controlsRegistry, type ControlType } from '../controls-registry';

jest.mock( '@elementor/editor-controls' );

jest.mocked( useBoundProp ).mockReturnValue( {
	value: 'value',
	setValue: jest.fn(),
	bind: 'bind',
	propType: createMockPropType( { kind: 'plain' } ),
	path: [],
	restoreValue: jest.fn(),
	resetValue: jest.fn(),
} );

const elementProviderProps = {
	element: { type: 'element', id: '1' },
	elementType: {
		controls: [],
		title: '',
		key: '',
		propsSchema: {},
	},
};

describe( '<Control />', () => {
	beforeAll( () => {
		controlsRegistry.register(
			'test-text',
			( ( { placeholder }: { placeholder: string } ) => (
				<input type="text" placeholder={ placeholder } />
			) ) as ControlComponent,
			'full'
		);
	} );

	afterAll( () => {
		controlsRegistry.unregister( 'test-text' );
	} );

	it( 'should render control component', () => {
		// Act.
		renderWithTheme(
			<ElementProvider { ...elementProviderProps }>
				<Control type={ 'test-text' as ControlType } props={ {} } />
			</ElementProvider>
		);

		// Assert.
		expect( screen.getByRole( 'textbox' ) ).toBeInTheDocument();
	} );

	it( 'should pass props to control component', () => {
		// Act.
		renderWithTheme(
			<ElementProvider { ...elementProviderProps }>
				<Control
					type={ 'test-text' as ControlType }
					props={ {
						placeholder: 'type here',
					} }
				/>
			</ElementProvider>
		);

		// Assert.
		expect( screen.getByRole( 'textbox' ) ).toHaveAttribute( 'placeholder', 'type here' );
	} );

	it( 'should throw error if control type is not found', () => {
		// Arrange
		const mockConsoleError = jest.fn();
		window.console.error = mockConsoleError;

		// Act & Assert.
		expect( () => {
			// @ts-expect-error Testing unknown control type.
			renderWithTheme( <Control type="unknown" /> );
		} ).toThrow();

		expect( mockConsoleError ).toHaveBeenCalled();
	} );
} );
