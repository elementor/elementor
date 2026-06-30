import * as React from 'react';
import { createMockPropType, createMockPropUtil, createMockSchema, renderControl } from 'test-utils';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { screen } from '@testing-library/react';

import { RepeatableControl } from '../repeatable-control';

jest.mock( '../../bound-prop-context', () => ( {
	...jest.requireActual( '../../bound-prop-context' ),
	useBoundProp: jest.fn(),
} ) );

jest.mock( '../../components/control-repeater/context/repeater-context', () => ( {
	...jest.requireActual( '../../components/control-repeater/context/repeater-context' ),
	useRepeaterContext: jest.fn(),
} ) );

import { useBoundProp } from '../../bound-prop-context';
import { useRepeaterContext } from '../../components/control-repeater/context/repeater-context';
import { type RepeatablePropValue } from '../../components/control-repeater/types';
const mockUseRepeaterContext = useRepeaterContext as jest.MockedFunction< typeof useRepeaterContext >;
const mockUseBoundProp = useBoundProp as jest.MockedFunction< typeof useBoundProp >;
const TEXT_PRIMARY_COLOR = 'rgb(12, 13, 14)';
const TEXT_TERTIARY_COLOR = 'rgb(105, 114, 125)';
const TEXT_DISABLED_COLOR = 'rgb(157, 165, 174)';

const stringPropType = createMockPropType( { kind: 'object' } );

const getMockRepeaterContext = ( value: RepeatablePropValue, setValue?: ReturnType< typeof jest.fn > ) => ( {
	index: 0,
	value,
	setItems: setValue ?? jest.fn(),
	items: [ { key: 0, item: value } ],
	isOpen: false,
	openItemIndex: 0,
	setOpenItemIndex: jest.fn(),
	initial: { $$type: 'string-array', value: [ { $$type: 'string', value: null } ] },
	addItem: jest.fn(),
	updateItem: jest.fn(),
	removeItem: jest.fn(),
	rowRef: document.body as HTMLElement,
	setRowRef: jest.fn(),
	isItemDisabled: () => false,
	popoverState: {
		isOpen: false,
		setOpen: jest.fn(),
		open: jest.fn(),
		close: jest.fn(),
		toggle: jest.fn(),
		onBlur: jest.fn(),
		onMouseLeave: jest.fn(),
		anchorEl: undefined,
		anchorPosition: undefined,
		setAnchorEl: jest.fn(),
		setAnchorElUsed: false,
		disableAutoFocus: false,
		popupId: undefined,
		variant: 'popover' as const,
		_openEventType: undefined,
		_childPopupState: undefined,
		_setChildPopupState: jest.fn(),
	},
} );

const baseProps = {
	bind: 'items',
	setValue: jest.fn(),
	propType: stringPropType,
	value: [],
};

const mockTextControl = jest.fn( ( { placeholder } ) => (
	<input title="text-control" defaultValue={ placeholder } data-testid="text-control" />
) );

describe( '<RepeatableControl /> - ItemLabel with shouldShowPlaceholder logic', () => {
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

		const value = { $$type: 'string', value: null };

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [ value ],
			setValue: jest.fn(),
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
		} );

		mockUseRepeaterContext.mockReturnValue( getMockRepeaterContext( value ) );

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
		const placeholderElement = screen.getByText( 'Empty item' );
		expect( placeholderElement ).toBeInTheDocument();
		expect( placeholderElement ).toHaveStyle( { color: TEXT_TERTIARY_COLOR } );
	} );

	it( 'should show placeholder when pattern has placeholders but data has empty string', () => {
		// Arrange.
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: stringPropTypeUtil,
		};

		const value = { $$type: 'string', value: '' };

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [ value ],
			setValue: jest.fn(),
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
		} );

		mockUseRepeaterContext.mockReturnValue( getMockRepeaterContext( value ) );

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
		const placeholderElement = screen.getByText( 'Empty item' );
		expect( placeholderElement ).toBeInTheDocument();
		expect( placeholderElement ).toHaveStyle( { color: TEXT_TERTIARY_COLOR } );
	} );

	it( 'should show placeholder when pattern has placeholders but data has whitespace-only string', () => {
		// Arrange.
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: stringPropTypeUtil,
		};

		const value = { $$type: 'string', value: '   ' };

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [ value ],
			setValue: jest.fn(),
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
		} );

		mockUseRepeaterContext.mockReturnValue( getMockRepeaterContext( value ) );

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
		const placeholderElement = screen.getByText( 'Empty item' );
		expect( placeholderElement ).toBeInTheDocument();
		expect( placeholderElement ).toHaveStyle( { color: TEXT_TERTIARY_COLOR } );
	} );

	it( 'should show interpolated pattern when data has valid values', () => {
		// Arrange.
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: stringPropTypeUtil,
		};

		const value = { $$type: 'string', value: 'Hello World' };

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [ value ],
			setValue: jest.fn(),
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
		} );

		mockUseRepeaterContext.mockReturnValue( getMockRepeaterContext( value ) );

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
		const labelElement = screen.getByText( 'Item: Hello World' );
		expect( labelElement ).toBeInTheDocument();
		expect( labelElement ).toHaveStyle( { color: TEXT_PRIMARY_COLOR } );
	} );

	it( 'should show interpolated pattern when no placeholders are present', () => {
		// Arrange.
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: stringPropTypeUtil,
		};

		const value = { $$type: 'string', value: null };

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [ value ],
			setValue: jest.fn(),
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
		} );

		mockUseRepeaterContext.mockReturnValue( getMockRepeaterContext( value ) );

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
		const labelElement = screen.getByText( 'Static Label' );
		expect( labelElement ).toBeInTheDocument();
		expect( labelElement ).toHaveStyle( { color: TEXT_PRIMARY_COLOR } );
	} );

	it( 'should show interpolated pattern when nested object properties exist', () => {
		// Arrange.
		const objectPropTypeUtil = createMockPropUtil( 'object', createMockSchema( 'object' ) );
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: objectPropTypeUtil,
		};

		const value = { $$type: 'object', value: { user: { name: 'John Doe', email: 'john@example.com' } } };

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [ value ],
			setValue: jest.fn(),
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
		} );

		mockUseRepeaterContext.mockReturnValue( getMockRepeaterContext( value ) );

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
		const labelElement = screen.getByText( 'User: John Doe - john@example.com' );
		expect( labelElement ).toBeInTheDocument();
		expect( labelElement ).toHaveStyle( { color: TEXT_PRIMARY_COLOR } );
	} );

	it( 'should show placeholder when nested object properties are missing', () => {
		// Arrange.
		const objectPropTypeUtil = createMockPropUtil( 'object', createMockSchema( 'object' ) );
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: objectPropTypeUtil,
		};

		const value = { $$type: 'object', value: { user: { name: 'John Doe' } } };

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [ value ],
			setValue: jest.fn(),
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
		} );

		mockUseRepeaterContext.mockReturnValue( getMockRepeaterContext( value ) );

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
		const placeholderElement = screen.getByText( 'No user data' );
		expect( placeholderElement ).toBeInTheDocument();
		expect( placeholderElement ).toHaveStyle( { color: TEXT_TERTIARY_COLOR } );
	} );

	it( 'should show interpolated pattern when some values are considered empty but others are not', () => {
		// Arrange.
		const objectPropTypeUtil = createMockPropUtil( 'object', createMockSchema( 'object' ) );
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: objectPropTypeUtil,
		};

		const value = { $$type: 'object', value: { title: 'My Title', description: '' } };

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [ value ],
			setValue: jest.fn(),
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
		} );

		mockUseRepeaterContext.mockReturnValue( getMockRepeaterContext( value ) );

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
		const labelElement = screen.getByText( 'Title: My Title - Description:' );
		expect( labelElement ).toBeInTheDocument();
		expect( labelElement ).toHaveStyle( { color: TEXT_PRIMARY_COLOR } );
	} );

	it( 'should show placeholder when all pattern values are empty', () => {
		// Arrange.
		const objectPropTypeUtil = createMockPropUtil( 'object', createMockSchema( 'object' ) );
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text' },
			propTypeUtil: objectPropTypeUtil,
		};

		const value = { $$type: 'object', value: { title: '', description: '   ' } };

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [ value ],
			setValue: jest.fn(),
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
		} );

		mockUseRepeaterContext.mockReturnValue( getMockRepeaterContext( value ) );

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
		const placeholderElement = screen.getByText( 'All empty' );
		expect( placeholderElement ).toBeInTheDocument();
		expect( placeholderElement ).toHaveStyle( { color: TEXT_TERTIARY_COLOR } );
	} );

	it( 'should use disabled color when readOnly is true', () => {
		// Arrange.
		const childControlConfig = {
			component: mockTextControl,
			props: { placeholder: 'Enter text', readOnly: true },
			propTypeUtil: stringPropTypeUtil,
		};

		const value = { $$type: 'string', value: 'Hello' };

		mockUseBoundProp.mockReturnValue( {
			propType: createMockPropType( { kind: 'array' } ),
			value: [ value ],
			setValue: jest.fn(),
			bind: 'items',
			path: [],
			restoreValue: jest.fn(),
			resetValue: jest.fn(),
		} );

		mockUseRepeaterContext.mockReturnValue( getMockRepeaterContext( value ) );

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

		// Assert
		const labelElement = screen.getByText( 'Item: Hello' );
		expect( labelElement ).toBeInTheDocument();
		expect( labelElement ).toHaveStyle( { color: TEXT_DISABLED_COLOR } );
	} );
} );
