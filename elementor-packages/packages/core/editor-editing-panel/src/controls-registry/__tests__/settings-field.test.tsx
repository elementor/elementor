import * as React from 'react';
import { createMockElementType, createMockPropType, renderWithTheme } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { updateElementSettings, useElementSetting } from '@elementor/editor-elements';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { mockElement } from '../../__tests__/utils';
import { ElementProvider } from '../../contexts/element-context';
import { SettingsField } from '../settings-field';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	useElementSetting: jest.fn(),
	updateElementSettings: jest.fn(),
} ) );

describe( '<SettingsField />', () => {
	beforeEach( () => {
		jest.mocked( useElementSetting ).mockReturnValue( {
			$$type: 'string',
			value: 'Hello, World!',
		} );
	} );

	it( 'should set the initial value', () => {
		// Arrange.
		const bind = 'text';
		const element = mockElement();
		const elementType = createMockElementType( {
			propsSchema: {
				[ bind ]: createMockPropType( { kind: 'plain' } ),
			},
		} );

		// Act.
		renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType }>
				<SettingsField bind={ bind }>
					<MockControl />
				</SettingsField>
			</ElementProvider>
		);

		// Assert.
		expect( screen.getByRole( 'textbox', { name: bind } ) ).toHaveValue( 'Hello, World!' );
	} );

	it( 'should set the default from schema as the initial value', () => {
		// Arrange.
		jest.mocked( useElementSetting ).mockReturnValue( null );

		const bind = 'text';
		const element = mockElement( { id: '1', type: 'mockText' } );
		const elementType = createMockElementType( {
			propsSchema: {
				[ bind ]: createMockPropType( {
					kind: 'plain',
					default: { $$type: 'string', value: 'Default Value' },
				} ),
			},
		} );

		// Act.
		renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType }>
				<SettingsField bind={ bind }>
					<MockControl />
				</SettingsField>
			</ElementProvider>
		);

		// Assert.
		expect( screen.getByRole( 'textbox', { name: bind } ) ).toHaveValue( 'Default Value' );
	} );

	it( 'should pass the updated payload when input value changes', () => {
		// Arrange.
		const bind = 'text';
		const element = mockElement();
		const elementType = createMockElementType( {
			propsSchema: {
				[ bind ]: createMockPropType( { kind: 'plain' } ),
			},
		} );

		// Act.
		renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType }>
				<SettingsField bind={ bind }>
					<MockControl />
				</SettingsField>
			</ElementProvider>
		);

		const input = screen.getByRole( 'textbox', { name: bind } );
		const newValue = { $$type: 'string', value: 'Goodbye, World!' };

		fireEvent.change( input, { target: { value: newValue.value } } );

		// Assert.
		expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
			id: element.id,
			props: { [ bind ]: newValue },
		} );
	} );
} );

const MockControl = () => {
	const { value, setValue, bind } = useBoundProp( stringPropTypeUtil );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setValue( event.target.value );
	};

	return <input type="text" aria-label={ bind } value={ value ?? '' } onChange={ handleChange } />;
};
