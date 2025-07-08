import * as React from 'react';
import { act } from 'react';
import {
	createMockElementType,
	createMockPropType,
	mockHistoryManager,
	renderControl,
	renderWithTheme,
} from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import {
	getElementLabel,
	getElementSetting,
	updateElementSettings,
	useElementSettings,
} from '@elementor/editor-elements';
import {
	type Dependency,
	type PropsSchema,
	type PropType,
	type PropValue,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { fireEvent, screen } from '@testing-library/react';
import { __ } from '@wordpress/i18n';

import { mockElement } from '../../__tests__/utils';
import { ElementProvider } from '../../contexts/element-context';
import { EXPERIMENTAL_FEATURES } from '../../sync/experiments-flags';
import { SettingsField } from '../settings-field';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	useElementSettings: jest.fn(),
	updateElementSettings: jest.fn(),
	getElementLabel: jest.fn(),
	getElementSetting: jest.fn(),
} ) );
jest.mock( '@elementor/editor-documents', () => ( {
	setDocumentModifiedStatus: jest.fn(),
} ) );
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	isExperimentActive: jest.fn(),
} ) );

const bind = 'text';
const otherBind = 'other';
const arrBind = 'arr';
const objBind = 'obj';

const dependencyTestCases: {
	desc: string;
	dependencies: Dependency[];
	values: Record< string, PropValue >;
	enabled: boolean;
}[] = [
	{
		desc: 'should disable if eq dependency is met (string)',
		dependencies: [
			{
				effect: 'disable',
				relation: 'or',
				terms: [ { path: [ bind ], operator: 'eq', value: 'disable-me' } ],
			},
		],
		values: {
			[ bind ]: { $$type: 'string', value: 'disable-me' },
			[ otherBind ]: { $$type: 'number', value: 123 },
			[ arrBind ]: { $$type: 'array', value: [] },
			[ objBind ]: { $$type: 'object', value: { a: { $$type: 'string', value: 'bar' } } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if eq dependency is met (number)',
		dependencies: [
			{ effect: 'disable', relation: 'or', terms: [ { path: [ otherBind ], operator: 'eq', value: 123 } ] },
		],
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 123 },
			[ arrBind ]: { $$type: 'array', value: [] },
			[ objBind ]: { $$type: 'object', value: { a: { $$type: 'string', value: 'bar' } } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if eq dependency is met (object inner)',
		dependencies: [
			{
				effect: 'disable',
				relation: 'or',
				terms: [ { path: [ objBind, 'a' ], operator: 'eq', value: 'bar' } ],
			},
		],
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 0 },
			[ arrBind ]: { $$type: 'array', value: [] },
			[ objBind ]: { $$type: 'object', value: { a: { $$type: 'string', value: 'bar' } } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if array contains value',
		dependencies: [
			{
				effect: 'disable',
				relation: 'or',
				terms: [ { path: [ arrBind ], operator: 'contains', value: 'foo' } ],
			},
		],
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 0 },
			[ arrBind ]: { $$type: 'array', value: [ 'foo', 'bar' ] },
			[ objBind ]: { $$type: 'object', value: { a: 'baz' } },
		},
		enabled: false,
	},
	{
		desc: 'should not disable if dependency is not met',
		dependencies: [
			{ effect: 'disable', relation: 'or', terms: [ { path: [ bind ], operator: 'eq', value: 'nope' } ] },
		],
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 0 },
			[ arrBind ]: {
				$$type: 'array',
				value: [ 'foo', 'bar' ],
			},
			[ objBind ]: { $$type: 'object', value: { a: 'baz' } },
		},
		enabled: true,
	},
	{
		desc: 'should disable if AND of eq and ne is met',
		dependencies: [
			{
				effect: 'disable',
				relation: 'and',
				terms: [
					{ path: [ bind ], operator: 'eq', value: 'foo' },
					{ path: [ otherBind ], operator: 'ne', value: 0 },
				],
			},
		],
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 123 },
			[ arrBind ]: { $$type: 'array', value: [] },
			[ objBind ]: { $$type: 'object', value: { a: { $$type: 'string', value: 'bar' } } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if OR of in and exists is met',
		dependencies: [
			{
				effect: 'disable',
				relation: 'or',
				terms: [
					{ path: [ bind ], operator: 'in', value: [ 'foo', 'bar' ] },
					{ path: [ otherBind ], operator: 'exists', value: true },
				],
			},
		],
		values: {
			[ bind ]: { $$type: 'string', value: 'baz' },
			[ otherBind ]: { $$type: 'number', value: 1 },
			[ arrBind ]: { $$type: 'array', value: [] },
			[ objBind ]: { $$type: 'object', value: { a: 'baz' } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if nested AND/OR is met',
		dependencies: [
			{
				effect: 'disable',
				relation: 'or',
				terms: [
					{
						relation: 'and',
						effect: 'disable',
						terms: [
							{ path: [ bind ], operator: 'eq', value: 'foo' },
							{ path: [ otherBind ], operator: 'gte', value: 100 },
						],
					},
					{ path: [ arrBind ], operator: 'contains', value: 'baz' },
				],
			},
		],
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 150 },
			[ arrBind ]: { $$type: 'array', value: [ 'baz', 'bar' ] },
			[ objBind ]: { $$type: 'object', value: { a: 'bar' } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if ncontains on array is met',
		dependencies: [
			{
				effect: 'disable',
				relation: 'or',
				terms: [ { path: [ arrBind ], operator: 'ncontains', value: 'nope' } ],
			},
		],
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 0 },
			[ arrBind ]: { $$type: 'array', value: [ 'foo', 'bar' ] },
			[ objBind ]: { $$type: 'object', value: { a: 'baz' } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if not_exist is met',
		dependencies: [
			{
				effect: 'disable',
				relation: 'or',
				terms: [ { path: [ otherBind ], operator: 'not_exist', value: true } ],
			},
		],
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: undefined,
			[ arrBind ]: { $$type: 'array', value: [] },
			[ objBind ]: { $$type: 'object', value: { a: 'baz' } },
		},
		enabled: false,
	},
];

describe( '<SettingsField />', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		historyMock.beforeEach();

		jest.useFakeTimers();

		jest.mocked( useElementSettings ).mockReturnValue( {
			text: {
				$$type: 'string',
				value: 'Hello, World!',
			},
		} );

		jest.mocked( getElementLabel ).mockImplementation( ( id ) => {
			return id === '1' ? 'Test Element' : 'Unknown Element';
		} );
	} );

	afterEach( () => {
		historyMock.afterEach();
		jest.clearAllMocks();
	} );

	it( 'should set the initial value', () => {
		// Arrange.
		const element = mockElement();
		const elementType = createMockElementType( {
			propsSchema: {
				[ bind ]: createMockPropType( { kind: 'plain' } ),
			},
		} );

		// Act.
		renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType }>
				<SettingsField bind={ bind } propDisplayName={ __( 'Test Prop', 'elementor' ) }>
					<MockControl />
				</SettingsField>
			</ElementProvider>
		);

		// Assert.
		expect( screen.getByRole( 'textbox', { name: bind } ) ).toHaveValue( 'Hello, World!' );
	} );

	it( 'should set the default from schema as the initial value', () => {
		// Arrange.
		jest.mocked( useElementSettings ).mockReturnValue( {} );

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
				<SettingsField bind={ bind } propDisplayName={ __( 'Text', 'elementor' ) }>
					<MockControl />
				</SettingsField>
			</ElementProvider>
		);

		// Assert.
		expect( screen.getByRole( 'textbox', { name: bind } ) ).toHaveValue( 'Default Value' );
	} );

	it( 'should pass the updated payload when input value changes', () => {
		// Arrange.
		const element = mockElement();
		const elementType = createMockElementType( {
			propsSchema: {
				[ bind ]: createMockPropType( { kind: 'plain' } ),
			},
		} );

		// Act.
		renderWithTheme(
			<ElementProvider element={ element } elementType={ elementType }>
				<SettingsField bind={ bind } propDisplayName={ __( 'Text', 'elementor' ) }>
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

	describe( 'Settings history', () => {
		beforeEach( () => {
			jest.mocked( isExperimentActive ).mockImplementation( ( feature ) => {
				return feature === EXPERIMENTAL_FEATURES.V_3_31;
			} );
		} );

		it( 'should support undo/redo for setting update', () => {
			// Arrange.
			const element = mockElement( { id: '1' } );
			const elementType = createMockElementType( {
				propsSchema: {
					[ bind ]: createMockPropType( { kind: 'plain' } ),
				},
			} );

			const initialValue = { $$type: 'string', value: 'Initial Value' };
			jest.mocked( getElementSetting ).mockReturnValue( initialValue );

			renderWithTheme(
				<ElementProvider element={ element } elementType={ elementType }>
					<SettingsField bind={ bind } propDisplayName={ __( 'Text', 'elementor' ) }>
						<MockControl />
					</SettingsField>
				</ElementProvider>
			);

			// Act - Update setting.
			const input = screen.getByRole( 'textbox', { name: bind } );
			const newValue = { $$type: 'string', value: 'New Value' };

			fireEvent.change( input, { target: { value: newValue.value } } );

			jest.runAllTimers();

			// Assert - Setting updated and history created.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: '1',
				props: { text: { $$type: 'string', value: 'New Value' } },
				withHistory: false,
			} );

			const historyItem = historyMock.instance.get();
			expect( historyItem?.title ).toBe( 'Test Element' );
			expect( historyItem?.subTitle ).toBe( 'Text edited' );

			// Act - Undo.
			act( () => {
				historyMock.instance.undo();
			} );

			// Assert - Previous value restored.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: '1',
				props: { text: { $$type: 'string', value: 'Initial Value' } },
				withHistory: false,
			} );

			// Act - Redo.
			act( () => {
				historyMock.instance.redo();
			} );

			// Assert - New value re-applied.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: '1',
				props: { text: { $$type: 'string', value: 'New Value' } },
				withHistory: false,
			} );
		} );
	} );
} );

describe( 'Test <SettingsField /> isDisabled logic propagating correctly', () => {
	it.each( dependencyTestCases )( '$desc', ( { dependencies, values, enabled } ) => {
		// Arrange.
		jest.mocked( useElementSettings ).mockImplementation( ( id, keys ) =>
			Object.fromEntries( keys.map( ( key ) => [ key, values[ key ] ] ) )
		);
		jest.mocked( useElementSettings ).mockReturnValue( values );

		// Act.
		setup( { dependencies, values } );

		const input = screen.getByRole( 'textbox', { name: bind } );

		// Assert.
		if ( enabled ) {
			expect( input ).toBeEnabled();
		} else {
			expect( input ).toBeDisabled();
		}
	} );
} );

const MockControl = () => {
	const { value, setValue, disabled } = useBoundProp( stringPropTypeUtil );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setValue( event.target.value );
	};

	return (
		<input type="text" aria-label={ bind } value={ value ?? '' } onChange={ handleChange } disabled={ disabled } />
	);
};

function setup( {
	dependencies,
	values,
	schemaOverrides = {},
}: {
	dependencies: Dependency[];
	values: Record< string, PropValue >;
	schemaOverrides?: Record< string, Partial< PropType > >;
} ) {
	const propsSchema = {
		[ bind ]: {
			kind: 'plain',
			key: bind,
			settings: {},
			meta: {},
			dependencies,
			...schemaOverrides[ bind ],
		},
		[ otherBind ]: {
			kind: 'plain',
			key: otherBind,
			settings: {},
			meta: {},
			...schemaOverrides[ otherBind ],
		},
		[ arrBind ]: {
			kind: 'array',
			key: arrBind,
			settings: {},
			meta: {},
			item_prop_type: {
				kind: 'plain',
				key: 'item',
				settings: {},
				meta: {},
			},
			...schemaOverrides[ arrBind ],
		},
		[ objBind ]: {
			kind: 'object',
			key: objBind,
			settings: {},
			meta: {},
			shape: {
				a: {
					kind: 'plain',
					key: 'a',
					settings: {},
					meta: {},
				},
			},
			...schemaOverrides[ objBind ],
		},
	} as PropsSchema;

	const elementType = createMockElementType( { propsSchema } );
	const element = mockElement();

	const props = {
		value: Object.fromEntries( Object.entries( values ).map( ( [ k, v ] ) => [ k, v ] ) ),
		setValue: jest.fn(),
		bind,
		propType: propsSchema[ bind ],
		isDisabled: undefined,
	};

	return renderControl(
		<ElementProvider element={ element } elementType={ elementType }>
			<SettingsField bind={ bind } propDisplayName={ __( 'Text', 'elementor' ) }>
				<MockControl />
			</SettingsField>
		</ElementProvider>,
		props
	);
}
