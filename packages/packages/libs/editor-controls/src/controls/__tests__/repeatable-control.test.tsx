import * as React from 'react';
import { createMockPropType, createMockPropUtil, createMockSchema, renderControl } from 'test-utils';
import { numberPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { RepeatableControl } from '../repeatable-control';

// Mock the useBoundProp hook
jest.mock( '../../bound-prop-context', () => ( {
	...jest.requireActual( '../../bound-prop-context' ),
	useBoundProp: jest.fn(),
} ) );

import { useBoundProp } from '../../bound-prop-context';
const mockUseBoundProp = useBoundProp as jest.MockedFunction< typeof useBoundProp >;

const stringPropType = createMockPropType( { kind: 'object' } );

const baseProps = {
	bind: 'items',
	setValue: jest.fn(),
	propType: stringPropType,
	value: [],
};

const mockTextControl = jest.fn( ( { placeholder } ) => (
	<input defaultValue={ placeholder } data-testid="text-control" />
) );

describe( '<RepeatableControl />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should create string-array prop type from child prop type', () => {
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: stringPropTypeUtil,
		};

		const setValue = jest.fn();

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [],
			setValue,
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
		} );

		const props = {
			...baseProps,
			value: [],
			setValue,
		};

		// Act
		renderControl(
			<RepeatableControl
				label="Text Items"
				repeaterLabel="Text Items"
				childControlConfig={ childControlConfig }
				patternLabel={ '' }
			/>,
			props
		);

		const addButton = screen.getByRole( 'button', { name: 'Add item' } );
		fireEvent.click( addButton );
		// Assert.
		expect( setValue ).toHaveBeenCalledWith( [ { $$type: 'string', value: null } ] );
	} );

	it( 'should create number-array prop type from number prop type', () => {
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter number' },
			propTypeUtil: numberPropTypeUtil,
		};

		const setValue = jest.fn();

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [],
			setValue,
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
		} );

		const props = {
			...baseProps,
			value: [],
			setValue,
		};

		// Act
		renderControl(
			<RepeatableControl
				label="Number Items"
				repeaterLabel="Number Items"
				childControlConfig={ childControlConfig }
			/>,
			props
		);

		const addButton = screen.getByRole( 'button', { name: 'Add item' } );
		fireEvent.click( addButton );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( [ { $$type: 'number', value: null } ] );
	} );

	it( 'should pass label prop to Repeater', () => {
		// Arrange.
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: stringPropTypeUtil,
		};

		const props = {
			...baseProps,
			value: [],
		};

		// Act.
		renderControl(
			<RepeatableControl
				label="Custom Label"
				repeaterLabel="Custom Label"
				childControlConfig={ childControlConfig }
			/>,
			props
		);

		// Assert.
		expect( screen.getByText( 'Custom Label' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add item' } ) ).toBeInTheDocument();
	} );

	it( 'should render child control when add item button is pressed and valid config is provided', () => {
		// Arrange.
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: stringPropTypeUtil,
		};

		const props = {
			...baseProps,
			value: [],
		};

		// Act.
		renderControl(
			<RepeatableControl
				label="Text Items"
				repeaterLabel="Text Items"
				childControlConfig={ childControlConfig }
			/>,
			props
		);

		const addButton = screen.getByRole( 'button', { name: 'Add item' } );
		fireEvent.click( addButton );

		// Assert.
		expect( screen.getByDisplayValue( 'Enter text' ) ).toBeInTheDocument();
	} );

	describe( 'ItemLabel with shouldShowPlaceholder logic', () => {
		beforeEach( () => {
			jest.clearAllMocks();
		} );

		it( 'should show placeholder when pattern has placeholders but data is null', () => {
			// Arrange.
			const childControlConfig = {
				component: mockTextControl,
				props: { placeholder: 'Enter text' },
				propTypeUtil: stringPropTypeUtil,
			};

			mockUseBoundProp.mockReturnValue( {
				propType: createMockPropType( { kind: 'array' } ),
				value: [ { $$type: 'string', value: null } ],
				setValue: jest.fn(),
				bind: 'items',
				path: [],
				restoreValue: jest.fn(),
			} );

			// Act.
			renderControl(
				<RepeatableControl
					label="Text Items"
					repeaterLabel="Text Items"
					childControlConfig={ childControlConfig }
					patternLabel="Item: ${value}"
					placeholder="Empty item"
				/>,
				baseProps
			);

			// Assert.
			expect( screen.getByText( 'Empty item' ) ).toBeInTheDocument();
		} );

		it( 'should show placeholder when pattern has placeholders but data has empty string', () => {
			// Arrange.
			const childControlConfig = {
				component: mockTextControl,
				props: { placeholder: 'Enter text' },
				propTypeUtil: stringPropTypeUtil,
			};

			mockUseBoundProp.mockReturnValue( {
				propType: createMockPropType( { kind: 'array' } ),
				value: [ { $$type: 'string', value: '' } ],
				setValue: jest.fn(),
				bind: 'items',
				path: [],
				restoreValue: jest.fn(),
			} );

			// Act.
			renderControl(
				<RepeatableControl
					label="Text Items"
					repeaterLabel="Text Items"
					childControlConfig={ childControlConfig }
					patternLabel="Item: ${value}"
					placeholder="Empty item"
				/>,
				baseProps
			);

			// Assert.
			expect( screen.getByText( 'Empty item' ) ).toBeInTheDocument();
		} );

		it( 'should show placeholder when pattern has placeholders but data has whitespace-only string', () => {
			// Arrange.
			const childControlConfig = {
				component: mockTextControl,
				props: { placeholder: 'Enter text' },
				propTypeUtil: stringPropTypeUtil,
			};

			mockUseBoundProp.mockReturnValue( {
				propType: createMockPropType( { kind: 'array' } ),
				value: [ { $$type: 'string', value: '   ' } ],
				setValue: jest.fn(),
				bind: 'items',
				path: [],
				restoreValue: jest.fn(),
			} );

			// Act.
			renderControl(
				<RepeatableControl
					label="Text Items"
					repeaterLabel="Text Items"
					childControlConfig={ childControlConfig }
					patternLabel="Item: ${value}"
					placeholder="Empty item"
				/>,
				baseProps
			);

			// Assert.
			expect( screen.getByText( 'Empty item' ) ).toBeInTheDocument();
		} );

		it( 'should show interpolated pattern when data has valid values', () => {
			// Arrange.
			const childControlConfig = {
				component: mockTextControl,
				props: { placeholder: 'Enter text' },
				propTypeUtil: stringPropTypeUtil,
			};

			mockUseBoundProp.mockReturnValue( {
				propType: createMockPropType( { kind: 'array' } ),
				value: [ { $$type: 'string', value: 'Hello World' } ],
				setValue: jest.fn(),
				bind: 'items',
				path: [],
				restoreValue: jest.fn(),
			} );

			// Act.
			renderControl(
				<RepeatableControl
					label="Text Items"
					repeaterLabel="Text Items"
					childControlConfig={ childControlConfig }
					patternLabel="Item: ${value}"
					placeholder="Empty item"
				/>,
				baseProps
			);

			// Assert.
			expect( screen.getByText( 'Item: Hello World' ) ).toBeInTheDocument();
		} );

		it( 'should show interpolated pattern when no placeholders are present', () => {
			// Arrange.
			const childControlConfig = {
				component: mockTextControl,
				props: { placeholder: 'Enter text' },
				propTypeUtil: stringPropTypeUtil,
			};

			mockUseBoundProp.mockReturnValue( {
				propType: createMockPropType( { kind: 'array' } ),
				value: [ { $$type: 'string', value: null } ],
				setValue: jest.fn(),
				bind: 'items',
				path: [],
				restoreValue: jest.fn(),
			} );

			// Act.
			renderControl(
				<RepeatableControl
					label="Text Items"
					repeaterLabel="Text Items"
					childControlConfig={ childControlConfig }
					patternLabel="Static Label"
					placeholder="Empty item"
				/>,
				baseProps
			);

			// Assert.
			expect( screen.getByText( 'Static Label' ) ).toBeInTheDocument();
		} );

		it( 'should show interpolated pattern when nested object properties exist', () => {
			// Arrange.
			const objectPropTypeUtil = createMockPropUtil( 'object', createMockSchema( 'object' ) );
			const childControlConfig = {
				component: mockTextControl,
				props: { placeholder: 'Enter text' },
				propTypeUtil: objectPropTypeUtil,
			};

			mockUseBoundProp.mockReturnValue( {
				propType: createMockPropType( { kind: 'array' } ),
				value: [ { $$type: 'object', value: { user: { name: 'John Doe', email: 'john@example.com' } } } ],
				setValue: jest.fn(),
				bind: 'items',
				path: [],
				restoreValue: jest.fn(),
			} );

			// Act.
			renderControl(
				<RepeatableControl
					label="Text Items"
					repeaterLabel="Text Items"
					childControlConfig={ childControlConfig }
					patternLabel="User: ${value.user.name} - ${value.user.email}"
					placeholder="No user data"
				/>,
				baseProps
			);

			// Assert.
			expect( screen.getByText( 'User: John Doe - john@example.com' ) ).toBeInTheDocument();
		} );

		it( 'should show placeholder when nested object properties are missing', () => {
			// Arrange.
			const objectPropTypeUtil = createMockPropUtil( 'object', createMockSchema( 'object' ) );
			const childControlConfig = {
				component: mockTextControl,
				props: { placeholder: 'Enter text' },
				propTypeUtil: objectPropTypeUtil,
			};

			mockUseBoundProp.mockReturnValue( {
				propType: createMockPropType( { kind: 'array' } ),
				value: [ { $$type: 'object', value: { user: { name: 'John Doe' } } } ],
				setValue: jest.fn(),
				bind: 'items',
				path: [],
				restoreValue: jest.fn(),
			} );

			// Act.
			renderControl(
				<RepeatableControl
					label="Text Items"
					repeaterLabel="Text Items"
					childControlConfig={ childControlConfig }
					patternLabel="User: ${user.name} - ${user.email}"
					placeholder="No user data"
				/>,
				baseProps
			);

			// Assert.
			expect( screen.getByText( 'No user data' ) ).toBeInTheDocument();
		} );

		it( 'should show interpolated pattern when some values are considered empty but others are not', () => {
			// Arrange.
			const objectPropTypeUtil = createMockPropUtil( 'object', createMockSchema( 'object' ) );
			const childControlConfig = {
				component: mockTextControl,
				props: { placeholder: 'Enter text' },
				propTypeUtil: objectPropTypeUtil,
			};

			mockUseBoundProp.mockReturnValue( {
				propType: createMockPropType( { kind: 'array' } ),
				value: [ { $$type: 'object', value: { title: 'My Title', description: '' } } ],
				setValue: jest.fn(),
				bind: 'items',
				path: [],
				restoreValue: jest.fn(),
			} );

			// Act.
			renderControl(
				<RepeatableControl
					label="Text Items"
					repeaterLabel="Text Items"
					childControlConfig={ childControlConfig }
					patternLabel="Title: ${value.title} - Description: ${value.description}"
					placeholder="Incomplete data"
				/>,
				baseProps
			);

			// Assert.
			expect( screen.getByText( 'Title: My Title - Description:' ) ).toBeInTheDocument();
		} );

		it( 'should show placeholder when all pattern values are empty', () => {
			// Arrange.
			const objectPropTypeUtil = createMockPropUtil( 'object', createMockSchema( 'object' ) );
			const childControlConfig = {
				component: mockTextControl,
				props: { placeholder: 'Enter text' },
				propTypeUtil: objectPropTypeUtil,
			};

			mockUseBoundProp.mockReturnValue( {
				propType: createMockPropType( { kind: 'array' } ),
				value: [ { $$type: 'object', value: { title: '', description: '   ' } } ],
				setValue: jest.fn(),
				bind: 'items',
				path: [],
				restoreValue: jest.fn(),
			} );

			// Act.
			renderControl(
				<RepeatableControl
					label="Text Items"
					repeaterLabel="Text Items"
					childControlConfig={ childControlConfig }
					patternLabel="Title: ${value.title} - Description: ${value.description}"
					placeholder="All empty"
				/>,
				baseProps
			);

			// Assert.
			expect( screen.getByText( 'All empty' ) ).toBeInTheDocument();
		} );
	} );
} );
