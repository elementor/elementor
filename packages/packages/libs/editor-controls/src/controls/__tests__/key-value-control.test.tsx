import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { KeyValueControl } from '../key-value-control';

const propType = createMockPropType( {
	kind: 'object',
	shape: {
		key: createMockPropType( { kind: 'object' } ),
		value: createMockPropType( { kind: 'object' } ),
	},
} );

const baseProps = {
	bind: 'key-value',
	setValue: jest.fn(),
	propType,
	value: null,
};

describe( 'KeyValueControl', () => {
	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should successfully change key with no regex config sent', () => {
		// Arrange
		const props = {
			...baseProps,
			value: {
				$$type: 'key-value',
				value: {
					key: { $$type: 'string', value: 'oldKey' },
					value: { $$type: 'string', value: 'oldValue' },
				},
			},
		};
		renderControl( <KeyValueControl />, props );
		const keyInput = screen.getAllByRole( 'textbox' )[ 0 ];

		// Act
		fireEvent.change( keyInput, { target: { value: 'newKey' } } );

		// Assert
		expect( props.setValue ).toHaveBeenCalledWith( {
			$$type: 'key-value',
			value: {
				key: { $$type: 'string', value: 'newKey' },
				value: { $$type: 'string', value: 'oldValue' },
			},
		} );
	} );

	it( 'should successfully change value with no regex config sent', () => {
		// Arrange
		const props = {
			...baseProps,
			value: {
				$$type: 'key-value',
				value: {
					key: { $$type: 'string', value: 'myKey' },
					value: { $$type: 'string', value: 'oldValue' },
				},
			},
		};
		renderControl( <KeyValueControl />, props );
		const valueInput = screen.getAllByRole( 'textbox' )[ 1 ];

		// Act
		fireEvent.change( valueInput, { target: { value: 'newValue' } } );

		// Assert
		expect( props.setValue ).toHaveBeenCalledWith( {
			$$type: 'key-value',
			value: {
				key: { $$type: 'string', value: 'myKey' },
				value: { $$type: 'string', value: 'newValue' },
			},
		} );
	} );

	it( 'should update key and show no error message when regex validation passes', async () => {
		// Arrange
		const regexKey = '^valid.*$'; // must start with 'valid'
		const errorMessage = 'Key is invalid';
		const props = {
			...baseProps,
			value: {
				$$type: 'key-value',
				value: {
					key: { $$type: 'string', value: 'oldKey' },
					value: { $$type: 'string', value: 'someValue' },
				},
			},
		};
		renderControl( <KeyValueControl regexKey={ regexKey } validationErrorMessage={ errorMessage } />, props );
		const keyInput = screen.getAllByRole( 'textbox' )[ 0 ];

		// Act
		fireEvent.change( keyInput, { target: { value: 'validKey123' } } );

		// Assert
		expect( props.setValue ).toHaveBeenCalledWith( {
			$$type: 'key-value',
			value: {
				key: { $$type: 'string', value: 'validKey123' },
				value: { $$type: 'string', value: 'someValue' },
			},
		} );

		expect( screen.queryByText( errorMessage ) ).not.toBeInTheDocument();
	} );

	it( 'should show error message when validation fails for key', async () => {
		// Arrange
		const regexKey = '^((?!invalid).)*$'; // regex to reject 'invalid'
		const errorMessage = 'Key is invalid';
		const props = {
			...baseProps,
			value: {
				$$type: 'key-value',
				value: {
					key: { $$type: 'string', value: 'oldKey' },
					value: { $$type: 'string', value: 'oldValue' },
				},
			},
		};
		renderControl( <KeyValueControl regexKey={ regexKey } validationErrorMessage={ errorMessage } />, props );
		const keyInput = screen.getAllByRole( 'textbox' )[ 0 ];

		// Act
		fireEvent.change( keyInput, { target: { value: 'invalid' } } );

		// Assert
		const error = await screen.findByText( errorMessage );
		expect( error ).toBeInTheDocument();
	} );

	it( 'should show error message when validation fails for value', async () => {
		// Arrange
		const regexValue = '^\\d+$'; // only digits allowed
		const errorMessage = 'Value is invalid';
		const props = {
			...baseProps,
			value: {
				$$type: 'key-value',
				value: {
					key: { $$type: 'string', value: 'myKey' },
					value: { $$type: 'string', value: 'oldValue' },
				},
			},
		};
		renderControl( <KeyValueControl regexValue={ regexValue } validationErrorMessage={ errorMessage } />, props );
		const valueInput = screen.getAllByRole( 'textbox' )[ 1 ];

		// Act
		fireEvent.change( valueInput, { target: { value: 'invalid' } } );

		// Assert
		const error = await screen.findByText( errorMessage );
		expect( error ).toBeInTheDocument();
	} );

	it( 'should call setValue with empty string when key validation fails', () => {
		// Arrange
		const regexKey = '^valid.*$';
		const props = {
			...baseProps,
			value: {
				$$type: 'key-value',
				value: {
					key: { $$type: 'string', value: 'validKey' },
					value: { $$type: 'string', value: 'someValue' },
				},
			},
		};

		renderControl( <KeyValueControl regexKey={ regexKey } />, props );

		const keyInput = screen.getAllByRole( 'textbox' )[ 0 ];

		// Act
		fireEvent.change( keyInput, { target: { value: 'invalidKey' } } );

		// Assert
		expect( props.setValue ).toHaveBeenCalledWith( {
			$$type: 'key-value',
			value: {
				key: { $$type: 'string', value: '' },
				value: { $$type: 'string', value: 'someValue' },
			},
		} );
	} );

	it( 'should disable value input when key is invalid', () => {
		// Arrange
		const regexKey = '^valid.*$';
		const props = {
			...baseProps,
			value: {
				$$type: 'key-value',
				value: {
					key: { $$type: 'string', value: 'validKey' },
					value: { $$type: 'string', value: 'someValue' },
				},
			},
		};

		renderControl( <KeyValueControl regexKey={ regexKey } />, props );

		const keyInput = screen.getAllByRole( 'textbox' )[ 0 ];
		const valueInput = screen.getAllByRole( 'textbox' )[ 1 ];

		// Act
		fireEvent.change( keyInput, { target: { value: 'invalidKey' } } );

		// Assert
		expect( valueInput ).toBeDisabled();
	} );

	it( 'should escape HTML characters when escapeHtml is true', () => {
		// Arrange
		const props = {
			...baseProps,
			value: {
				$$type: 'key-value',
				value: {
					key: { $$type: 'string', value: '<script>alert("test")</script>' },
					value: { $$type: 'string', value: 'Value & "quotes" \'test\' > end' },
				},
			},
		};

		// Act
		renderControl( <KeyValueControl escapeHtml={ true } />, props );

		// Assert
		const keyInput = screen.getAllByRole( 'textbox' )[ 0 ];
		const valueInput = screen.getAllByRole( 'textbox' )[ 1 ];

		expect( keyInput ).toHaveValue( '&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;' );
		expect( valueInput ).toHaveValue( 'Value &amp; &quot;quotes&quot; &#39;test&#39; &gt; end' );
	} );

	it( 'should handle dynamic tag values correctly', () => {
		// Arrange
		const props = {
			...baseProps,
			value: {
				$$type: 'key-value',
				value: {
					key: { $$type: 'dynamic', name: 'post-meta', settings: { key: 'custom_field' } },
					value: { $$type: 'string', value: 'staticValue' },
				},
			},
		};

		// Act
		renderControl( <KeyValueControl />, props );

		// Assert
		const keyInput = screen.getAllByRole( 'textbox' )[ 0 ];
		const valueInput = screen.getAllByRole( 'textbox' )[ 1 ];

		expect( keyInput ).toHaveValue( '' );
		expect( valueInput ).toHaveValue( 'staticValue' );
	} );

	it( 'should handle both key and value as dynamic tags', () => {
		// Arrange
		const props = {
			...baseProps,
			value: {
				$$type: 'key-value',
				value: {
					key: { $$type: 'dynamic', name: 'post-meta', settings: { key: 'custom_field' } },
					value: { $$type: 'dynamic', name: 'post-title', settings: {} },
				},
			},
		};

		// Act
		renderControl( <KeyValueControl />, props );

		// Assert
		const keyInput = screen.getAllByRole( 'textbox' )[ 0 ];
		const valueInput = screen.getAllByRole( 'textbox' )[ 1 ];

		expect( keyInput ).toHaveValue( '' );
		expect( valueInput ).toHaveValue( '' );
	} );
} );
