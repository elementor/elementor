import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { fireEvent, screen } from '@testing-library/react';

import { DynamicControl } from '../dynamic-control';
import { usePropDynamicTags } from '../hooks/use-prop-dynamic-tags';

jest.mock( '../hooks/use-prop-dynamic-tags' );

const propType = createMockPropType( { kind: 'object' } );

describe( '<DynamicControl />', () => {
	beforeEach( () => {
		jest.mocked( usePropDynamicTags ).mockReturnValue( [
			{
				name: 'author-info',
				categories: [ 'text' ],
				label: 'Author Info',
				group: 'author',
				atomic_controls: [
					{
						type: 'section',
						value: {
							label: 'Advanced',
							items: [
								{
									type: 'control',
									value: {
										type: 'text',
										bind: 'before',
										props: {},
									},
								},
							],
						},
					},
				],
				props_schema: {
					before: createMockPropType( { kind: 'plain', default: 'Default from dynamic tag schema' } ),
				},
			},
		] );
	} );

	it( 'should throw an error if dynamic tag is not found', () => {
		// Arrange.
		const bind = 'before';
		const value = mockDynamicValue( {
			name: 'not-existing',
			settings: {
				[ bind ]: 'Hello, World!',
			},
		} );

		const props = { value, setValue: jest.fn(), bind: 'title', propType };

		// Act.
		const renderComponent = () =>
			renderControl(
				<DynamicControl bind={ bind }>
					<MockControl />
				</DynamicControl>,
				props
			);

		// Assert.
		expect( renderComponent ).toThrow( 'Dynamic tag not-existing not found' );
		expect( console ).toHaveErrored();
	} );

	it( 'should render children and set initial value', () => {
		// Arrange.
		const bind = 'before';
		const value = mockDynamicValue( {
			name: 'author-info',
			settings: {
				[ bind ]: 'Hello, World!',
			},
		} );

		const props = { value, setValue: jest.fn(), bind: 'title', propType };

		// Act.
		renderControl(
			<DynamicControl bind={ bind }>
				<MockControl />
			</DynamicControl>,
			props
		);

		// Assert.
		expect( screen.getByRole( 'textbox', { name: bind } ) ).toHaveValue( 'Hello, World!' );
	} );

	it( 'should set the default value from the schema if the value is not set', () => {
		// Arrange.
		const bind = 'before';
		const value = mockDynamicValue( {
			name: 'author-info',
			settings: {},
		} );

		const props = { value, setValue: jest.fn(), bind: 'title', propType };

		// Act.
		renderControl(
			<DynamicControl bind={ bind }>
				<MockControl />
			</DynamicControl>,
			props
		);

		// Assert.
		expect( screen.getByRole( 'textbox', { name: bind } ) ).toHaveValue( 'Default from dynamic tag schema' );
	} );

	it( `should call the settings control's "setValue" with the dynamic value and pass the other settings as well`, () => {
		// Arrange.
		const bind = 'text';
		const value = mockDynamicValue( {
			name: 'author-info',
			settings: {
				[ bind ]: 'Hello, World!',
				'other-setting': 'Other setting value',
			},
		} );

		const setValue = jest.fn();

		const props = { value, setValue, bind: 'title', propType };

		// Act.
		renderControl(
			<DynamicControl bind={ bind }>
				<MockControl />
			</DynamicControl>,
			props
		);

		const input = screen.getByRole( 'textbox', { name: bind } );

		// Act.
		fireEvent.change( input, { target: { value: 'Goodbye, World!' } } );

		// Assert.
		const newValue = mockDynamicValue( {
			name: 'author-info',
			settings: {
				[ bind ]: 'Goodbye, World!',
				'other-setting': 'Other setting value',
			},
		} );

		expect( setValue ).toHaveBeenCalledWith( newValue );
	} );
} );

const MockControl = () => {
	const { value, setValue, bind } = useBoundProp< string >();

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setValue( event.target.value );
	};

	return <input type="text" aria-label={ bind } value={ value } onChange={ handleChange } />;
};

const mockDynamicValue = ( { name, settings }: { name: string; settings: Record< string, unknown > } ) => ( {
	$$type: 'dynamic',
	value: { name, settings },
} );
