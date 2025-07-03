import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { screen } from '@testing-library/react';

import { ElementProvider } from '../../contexts/element-context';
import { Control } from '../control';
import { getControl } from '../controls-registry';

jest.mock( '@elementor/editor-controls' );
jest.mock( '../controls-registry' );

jest.mocked( useBoundProp ).mockReturnValue( {
	value: 'value',
	setValue: jest.fn(),
	bind: 'bind',
	propType: createMockPropType( { kind: 'plain' } ),
	path: [],
	restoreValue: jest.fn(),
} );

jest.mocked( getControl ).mockImplementation( ( type ) => {
	const controlTypes = {
		text: ( { placeholder }: { placeholder: string } ) => <input type="text" placeholder={ placeholder } />,
	};

	// @ts-expect-error Mocked control types.
	return controlTypes[ type ];
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
	it( 'should render control component', () => {
		// Act.
		renderWithTheme(
			<ElementProvider { ...elementProviderProps }>
				<Control type="text" />
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
					type="text"
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
		// Act & Assert.
		expect( () => {
			// @ts-expect-error Testing unknown control type.
			renderWithTheme( <Control type="unknown" /> );
		} ).toThrow();

		expect( console ).toHaveErrored();
	} );
} );
