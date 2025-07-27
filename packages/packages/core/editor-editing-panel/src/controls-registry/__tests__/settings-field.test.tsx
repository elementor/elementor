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
	getElementSettings,
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
import { fireEvent, screen } from '@testing-library/react';
import { __ } from '@wordpress/i18n';

import { mockElement } from '../../__tests__/utils';
import { ElementProvider } from '../../contexts/element-context';
import { SettingsField } from '../settings-field';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	useElementSettings: jest.fn(),
	updateElementSettings: jest.fn(),
	getElementLabel: jest.fn(),
	getElementSettings: jest.fn(),
} ) );
jest.mock( '@elementor/editor-documents', () => ( {
	setDocumentModifiedStatus: jest.fn(),
} ) );

const bind = 'text';
const otherBind = 'other';
const arrBind = 'arr';
const objBind = 'obj';

const dependencyTestCases: {
	desc: string;
	dependencies: Dependency;
	values: Record< string, PropValue >;
	enabled: boolean;
}[] = [
	{
		desc: 'should disable if ne dependency is met (string)',
		dependencies: {
			relation: 'or',
			terms: [ { path: [ bind ], operator: 'ne', value: 'disable-me' } ],
		},
		values: {
			[ bind ]: { $$type: 'string', value: 'disable-me' },
			[ otherBind ]: { $$type: 'number', value: 123 },
			[ arrBind ]: { $$type: 'array', value: [] },
			[ objBind ]: { $$type: 'object', value: { a: { $$type: 'string', value: 'bar' } } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if ne dependency is met (number)',
		dependencies: { relation: 'or', terms: [ { path: [ otherBind ], operator: 'ne', value: 123 } ] },
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 123 },
			[ arrBind ]: { $$type: 'array', value: [] },
			[ objBind ]: { $$type: 'object', value: { a: { $$type: 'string', value: 'bar' } } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if ne dependency is met (object inner)',
		dependencies: {
			relation: 'or',
			terms: [ { path: [ objBind, 'a' ], operator: 'ne', value: 'bar' } ],
		},
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 0 },
			[ arrBind ]: { $$type: 'array', value: [] },
			[ objBind ]: { $$type: 'object', value: { a: { $$type: 'string', value: 'bar' } } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if array does not contains value',
		dependencies: {
			relation: 'or',
			terms: [ { path: [ arrBind ], operator: 'ncontains', value: 'foo' } ],
		},
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
		dependencies: { relation: 'or', terms: [ { path: [ bind ], operator: 'ne', value: 'nope' } ] },
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
		desc: 'should disable if OR of eq and ne is met',
		dependencies: {
			relation: 'or',
			terms: [
				{ path: [ bind ], operator: 'ne', value: 'foo' },
				{ path: [ otherBind ], operator: 'eq', value: 0 },
			],
		},
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 123 },
			[ arrBind ]: { $$type: 'array', value: [] },
			[ objBind ]: { $$type: 'object', value: { a: { $$type: 'string', value: 'bar' } } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if And of nin and not_exist is met',
		dependencies: {
			relation: 'and',
			terms: [
				{ path: [ bind ], operator: 'nin', value: [ 'foo', 'bar' ] },
				{ path: [ otherBind ], operator: 'not_exist', value: true },
			],
		},
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
		dependencies: {
			relation: 'and',
			terms: [
				{
					relation: 'or',

					terms: [
						{ path: [ bind ], operator: 'ne', value: 'foo' },
						{ path: [ otherBind ], operator: 'lt', value: 100 },
					],
				},
				{ path: [ arrBind ], operator: 'ncontains', value: 'baz' },
			],
		},
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 150 },
			[ arrBind ]: { $$type: 'array', value: [ 'baz', 'bar' ] },
			[ objBind ]: { $$type: 'object', value: { a: 'bar' } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if contains on array is met',
		dependencies: {
			relation: 'or',
			terms: [ { path: [ arrBind ], operator: 'contains', value: 'nope' } ],
		},
		values: {
			[ bind ]: { $$type: 'string', value: 'foo' },
			[ otherBind ]: { $$type: 'number', value: 0 },
			[ arrBind ]: { $$type: 'array', value: [ 'foo', 'bar' ] },
			[ objBind ]: { $$type: 'object', value: { a: 'baz' } },
		},
		enabled: false,
	},
	{
		desc: 'should disable if exists is met',
		dependencies: {
			relation: 'or',
			terms: [ { path: [ otherBind ], operator: 'exists', value: true } ],
		},
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
			withHistory: false,
		} );
	} );

	describe( 'Settings history', () => {
		it( 'should support undo/redo for setting update', () => {
			// Arrange.
			const element = mockElement( { id: '1' } );
			const elementType = createMockElementType( {
				propsSchema: {
					[ bind ]: createMockPropType( { kind: 'plain' } ),
				},
			} );

			const initialValue = { $$type: 'string', value: 'Initial Value' };
			jest.mocked( useElementSettings ).mockReturnValue( { [ bind ]: initialValue } );
			jest.mocked( getElementSettings ).mockReturnValue( { [ bind ]: initialValue } );

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

describe( 'SettingsField dependency logic', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		historyMock.beforeEach();
	} );

	afterEach( () => {
		historyMock.afterEach();
		jest.clearAllMocks();
	} );

	describe( 'Dependency extraction', () => {
		it( 'should extract direct dependencies correctly', () => {
			// Arrange.
			const dependenciesPerTargetMapping = {
				'control-a': [ 'control-b', 'control-c' ],
				'control-b': [ 'control-d' ],
				'control-c': [],
				'control-d': [],
			};

			const propsSchema = {
				'control-a': createMockPropType( { kind: 'plain' } ),
				'control-b': createMockPropType( { kind: 'plain' } ),
				'control-c': createMockPropType( { kind: 'plain' } ),
				'control-d': createMockPropType( { kind: 'plain' } ),
			};

			const elementType = createMockElementType( { propsSchema, dependenciesPerTargetMapping } );
			const element = mockElement();

			const elementSettings = {
				'control-a': { $$type: 'string', value: 'value-a' },
				'control-b': { $$type: 'string', value: 'value-b' },
				'control-c': { $$type: 'string', value: 'value-c' },
				'control-d': { $$type: 'string', value: 'value-d' },
			};

			jest.mocked( useElementSettings ).mockReturnValue( elementSettings );
			jest.mocked( getElementSettings ).mockReturnValue( elementSettings );

			// Act.
			renderWithTheme(
				<ElementProvider element={ element } elementType={ elementType }>
					<SettingsField bind="control-a" propDisplayName={ __( 'Control A', 'elementor' ) }>
						<MockControl bind="control-a" />
					</SettingsField>
				</ElementProvider>
			);

			const input = screen.getByRole( 'textbox', { name: 'control-a' } );

			fireEvent.change( input, { target: { value: 'new-value' } } );

			// Assert.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: element.id,
				props: {
					'control-a': { $$type: 'string', value: 'new-value' },
				},
				withHistory: false,
			} );
		} );

		it( 'should extract nested object dependencies correctly', () => {
			// Arrange.
			const propsSchema = {
				'parent-control': createMockPropType( {
					kind: 'object',
					shape: {
						child1: createMockPropType( { kind: 'plain' } ),
						child2: createMockPropType( { kind: 'plain' } ),
					},
				} ),
				'dependent-control': createMockPropType( { kind: 'plain' } ),
			};

			const dependenciesPerTargetMapping = {
				'parent-control': [ 'dependent-control' ],
				'parent-control.child1': [ 'dependent-control' ],
				'parent-control.child2': [],
			};

			const elementType = createMockElementType( { propsSchema, dependenciesPerTargetMapping } );
			const element = mockElement();
			const elementSettings = {
				'parent-control': {
					$$type: 'object',
					value: {
						child1: { $$type: 'string', value: 'child1-value' },
						child2: { $$type: 'string', value: 'child2-value' },
					},
				},
				'dependent-control': { $$type: 'string', value: 'dependent-value' },
			};

			jest.mocked( useElementSettings ).mockReturnValue( elementSettings );
			jest.mocked( getElementSettings ).mockReturnValue( elementSettings );

			// Act.
			renderWithTheme(
				<ElementProvider element={ element } elementType={ elementType }>
					<SettingsField bind="parent-control" propDisplayName={ __( 'Parent Control', 'elementor' ) }>
						<MockControl bind="parent-control" />
					</SettingsField>
				</ElementProvider>
			);

			const input = screen.getByRole( 'textbox', { name: 'parent-control' } );

			fireEvent.change( input, { target: { value: 'new-parent-value' } } );

			// Assert.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: element.id,
				props: {
					'parent-control': { $$type: 'string', value: 'new-parent-value' },
				},
				withHistory: false,
			} );
		} );
	} );

	describe( 'Dependent value updates', () => {
		it( 'should update dependent control values when dependency condition is met', () => {
			// Arrange.
			const propsSchema = {
				'source-control': createMockPropType( {
					kind: 'union',
					prop_types: {
						string: createMockPropType( { kind: 'plain' } ),
					},
				} ),
				'dependent-control': createMockPropType( {
					kind: 'union',
					dependencies: {
						relation: 'or',
						terms: [ { path: [ 'source-control' ], operator: 'ne', value: 'disable-trigger' } ],
					},
				} ),
			};

			const dependenciesPerTargetMapping = {
				'source-control': [ 'dependent-control' ],
			};

			const elementType = createMockElementType( { propsSchema, dependenciesPerTargetMapping } );
			const element = mockElement();
			const elementSettings = {
				'source-control': { $$type: 'string', value: 'initial-value' },
				'dependent-control': { $$type: 'string', value: 'dependent-value' },
			};

			jest.mocked( useElementSettings ).mockReturnValue( elementSettings );
			jest.mocked( getElementSettings ).mockReturnValue( elementSettings );

			// Act.
			renderWithTheme(
				<ElementProvider element={ element } elementType={ elementType }>
					<SettingsField bind="source-control" propDisplayName={ __( 'Source Control', 'elementor' ) }>
						<MockControl bind="source-control" />
					</SettingsField>
				</ElementProvider>
			);

			const input = screen.getByRole( 'textbox', { name: 'source-control' } );

			fireEvent.change( input, { target: { value: 'disable-trigger' } } );

			// Assert.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: element.id,
				props: {
					'dependent-control': null,
					'source-control': { $$type: 'string', value: 'disable-trigger' },
				},
				withHistory: false,
			} );
		} );

		it( 'should not update dependent control values when dependency condition is not met', () => {
			// Arrange.
			const propsSchema = {
				'source-control': createMockPropType( { kind: 'plain' } ),
				'dependent-control': createMockPropType( {
					kind: 'plain',
					dependencies: {
						relation: 'or',
						terms: [ { path: [ 'source-control' ], operator: 'ne', value: 'disable-trigger' } ],
					},
				} ),
			};

			const dependenciesPerTargetMapping = {
				'source-control': [ 'dependent-control' ],
			};

			const elementType = createMockElementType( { propsSchema, dependenciesPerTargetMapping } );
			const element = mockElement();
			const elementSettings = {
				'source-control': { $$type: 'string', value: 'initial-value' },
				'dependent-control': { $$type: 'string', value: 'dependent-value' },
			};

			jest.mocked( useElementSettings ).mockReturnValue( elementSettings );
			jest.mocked( getElementSettings ).mockReturnValue( elementSettings );

			// Act.
			renderWithTheme(
				<ElementProvider element={ element } elementType={ elementType }>
					<SettingsField bind="source-control" propDisplayName={ __( 'Source Control', 'elementor' ) }>
						<MockControl bind="source-control" />
					</SettingsField>
				</ElementProvider>
			);

			const input = screen.getByRole( 'textbox', { name: 'source-control' } );

			fireEvent.change( input, { target: { value: 'other-value' } } );

			// Assert.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: element.id,
				props: {
					'source-control': { $$type: 'string', value: 'other-value' },
				},
				withHistory: false,
			} );
		} );

		it( 'should handle nested object dependent value updates', () => {
			// Arrange.
			const propsSchema = {
				'source-control': createMockPropType( { kind: 'plain' } ),
				'nested-object': createMockPropType( {
					kind: 'object',
					shape: {
						child: createMockPropType( {
							kind: 'plain',
							dependencies: {
								relation: 'or',
								terms: [ { path: [ 'source-control' ], operator: 'ne', value: 'disable-trigger' } ],
							},
						} ),
						sibling: createMockPropType( {
							kind: 'plain',
						} ),
					},
				} ),
			};

			const dependenciesPerTargetMapping = {
				'source-control': [ 'nested-object.child' ],
			};

			const elementType = createMockElementType( { propsSchema, dependenciesPerTargetMapping } );
			const element = mockElement();

			jest.mocked( useElementSettings ).mockReturnValue( {
				'source-control': { $$type: 'string', value: 'initial-value' },
				'nested-object': {
					$$type: 'object',
					value: {
						child: { $$type: 'string', value: 'child-value' },
						sibling: { $$type: 'string', value: 'sibling-value' },
					},
				},
			} );

			// Act.
			renderWithTheme(
				<ElementProvider element={ element } elementType={ elementType }>
					<SettingsField bind="source-control" propDisplayName={ __( 'Source Control', 'elementor' ) }>
						<MockControl bind="source-control" />
					</SettingsField>
				</ElementProvider>
			);

			const input = screen.getByRole( 'textbox', { name: 'source-control' } );

			fireEvent.change( input, { target: { value: 'disable-trigger' } } );

			// Assert.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: element.id,
				props: {
					'nested-object': {
						$$type: 'object',
						value: {
							child: null,
							sibling: {
								$$type: 'string',
								value: 'sibling-value',
							},
						},
					},
					'source-control': {
						$$type: 'string',
						value: 'disable-trigger',
					},
				},
				withHistory: false,
			} );
		} );

		it( 'should handle nested union dependent value updates', () => {
			// Arrange.
			const propsSchema = {
				'source-control': createMockPropType( {
					kind: 'plain',
				} ),
				'mid-control': createMockPropType( {
					kind: 'plain',
					dependencies: {
						relation: 'or',
						terms: [
							{
								path: [ 'source-control' ],
								operator: 'eq',
								value: 'initial-value-1',
							},
						],
					},
				} ),
				'nested-union': createMockPropType( {
					kind: 'union',
					prop_types: {
						string: createMockPropType( {
							kind: 'plain',
						} ),
						object: createMockPropType( {
							kind: 'object',
							shape: {
								number: createMockPropType( {
									kind: 'plain',
									dependencies: {
										relation: 'or',
										terms: [
											{
												path: [ 'mid-control' ],
												operator: 'exists',
												value: null,
											},
										],
									},
								} ),
							},
						} ),
					},
				} ),
			};

			const dependenciesPerTargetMapping = {
				'source-control': [ 'mid-control' ],
				'mid-control': [ 'nested-union.number' ],
			};

			const elementType = createMockElementType( { propsSchema, dependenciesPerTargetMapping } );
			const element = mockElement();

			jest.mocked( useElementSettings ).mockReturnValue( {
				'source-control': {
					$$type: 'string',
					value: 'initial-value-1',
				},
				'mid-control': {
					$$type: 'string',
					value: 'initial-value-2',
				},
				'nested-union': {
					$$type: 'object',
					value: {
						number: { $$type: 'number', value: 1 },
					},
				},
			} );

			// Act.
			renderWithTheme(
				<ElementProvider element={ element } elementType={ elementType }>
					<SettingsField bind="source-control" propDisplayName={ __( 'Source Control', 'elementor' ) }>
						<MockControl bind="source-control" />
					</SettingsField>
				</ElementProvider>
			);

			const input = screen.getByRole( 'textbox', { name: 'source-control' } );

			fireEvent.change( input, { target: { value: 'value-1' } } );

			// Assert.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: element.id,
				props: {
					'source-control': {
						$$type: 'string',
						value: 'value-1',
					},
					'mid-control': null,
					'nested-union': {
						$$type: 'object',
						value: {
							number: null,
						},
					},
				},
				withHistory: false,
			} );
		} );

		it( 'should handle multiple dependent controls correctly', () => {
			// Arrange.
			const propsSchema = {
				'source-control': createMockPropType( { kind: 'plain' } ),
				'dependent-1': createMockPropType( {
					kind: 'plain',
					dependencies: {
						relation: 'or',
						terms: [ { path: [ 'source-control' ], operator: 'ne', value: 'disable-trigger' } ],
					},
				} ),
				'dependent-2': createMockPropType( {
					kind: 'plain',
					dependencies: {
						relation: 'or',
						terms: [ { path: [ 'source-control' ], operator: 'ne', value: 'disable-trigger' } ],
					},
				} ),
			};

			const dependenciesPerTargetMapping = {
				'source-control': [ 'dependent-1', 'dependent-2' ],
			};

			const elementType = createMockElementType( { propsSchema, dependenciesPerTargetMapping } );
			const element = mockElement();

			jest.mocked( useElementSettings ).mockReturnValue( {
				'source-control': { $$type: 'string', value: 'initial-value' },
				'dependent-1': { $$type: 'string', value: 'value-1' },
				'dependent-2': { $$type: 'string', value: 'value-2' },
			} );

			// Act.
			renderWithTheme(
				<ElementProvider element={ element } elementType={ elementType }>
					<SettingsField bind="source-control" propDisplayName={ __( 'Source Control', 'elementor' ) }>
						<MockControl bind="source-control" />
					</SettingsField>
				</ElementProvider>
			);

			const input = screen.getByRole( 'textbox', { name: 'source-control' } );
			fireEvent.change( input, { target: { value: 'disable-trigger' } } );

			// Assert.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: element.id,
				props: {
					'source-control': {
						$$type: 'string',
						value: 'disable-trigger',
					},
					'dependent-1': null,
					'dependent-2': null,
				},
				withHistory: false,
			} );
		} );
	} );

	describe( 'Integration tests', () => {
		it( 'should handle complex dependency chains correctly', () => {
			// Arrange.
			const propsSchema = {
				'control-a': createMockPropType( { kind: 'plain' } ),
				'control-b': createMockPropType( {
					kind: 'plain',
					dependencies: {
						relation: 'or',
						terms: [ { path: [ 'control-a' ], operator: 'ne', value: 'trigger-b' } ],
					},
				} ),
				'control-c': createMockPropType( {
					kind: 'plain',
					dependencies: {
						relation: 'or',
						terms: [ { path: [ 'control-b' ], operator: 'ne', value: 'trigger-c' } ],
					},
				} ),
			};

			const dependenciesPerTargetMapping = {
				'control-a': [ 'control-b' ],
				'control-b': [ 'control-c' ],
			};

			const elementType = createMockElementType( { propsSchema, dependenciesPerTargetMapping } );
			const element = mockElement();

			jest.mocked( useElementSettings ).mockReturnValue( {
				'control-a': { $$type: 'string', value: 'initial-a' },
				'control-b': { $$type: 'string', value: 'initial-b' },
				'control-c': { $$type: 'string', value: 'initial-c' },
			} );

			// Act.
			renderWithTheme(
				<ElementProvider element={ element } elementType={ elementType }>
					<SettingsField bind="control-a" propDisplayName={ __( 'Control A', 'elementor' ) }>
						<MockControl bind="control-a" />
					</SettingsField>
				</ElementProvider>
			);

			const input = screen.getByRole( 'textbox', { name: 'control-a' } );
			fireEvent.change( input, { target: { value: 'trigger-b' } } );

			// Assert.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: element.id,
				props: {
					'control-a': { $$type: 'string', value: 'trigger-b' },
					'control-b': null,
				},
				withHistory: false,
			} );
		} );

		it( 'should preserve existing values when dependencies are not triggered', () => {
			// Arrange.
			const propsSchema = {
				'source-control': createMockPropType( { kind: 'plain' } ),
				'dependent-control': createMockPropType( {
					kind: 'plain',
					dependencies: {
						relation: 'or',
						terms: [ { path: [ 'source-control' ], operator: 'ne', value: 'disable-trigger' } ],
					},
				} ),
			};

			const dependenciesPerTargetMapping = {
				'source-control': [ 'dependent-control' ],
			};

			const elementType = createMockElementType( { propsSchema, dependenciesPerTargetMapping } );
			const element = mockElement();

			const initialDependentValue = { $$type: 'string', value: 'preserved-value' };
			const elementSettings = {
				'source-control': { $$type: 'string', value: 'initial-value' },
				'dependent-control': initialDependentValue,
			};
			jest.mocked( useElementSettings ).mockReturnValue( elementSettings );
			jest.mocked( getElementSettings ).mockReturnValue( elementSettings );

			// Act.
			renderWithTheme(
				<ElementProvider element={ element } elementType={ elementType }>
					<SettingsField bind="source-control" propDisplayName={ __( 'Source Control', 'elementor' ) }>
						<MockControl bind="source-control" />
					</SettingsField>
				</ElementProvider>
			);

			const input = screen.getByRole( 'textbox', { name: 'source-control' } );
			fireEvent.change( input, { target: { value: 'other-value' } } );

			// Assert.
			expect( jest.mocked( updateElementSettings ) ).toHaveBeenCalledWith( {
				id: element.id,
				props: {
					'source-control': { $$type: 'string', value: 'other-value' },
				},
				withHistory: false,
			} );
		} );
	} );
} );

const MockControl = ( { bind: controlBind = bind }: { bind?: string } = {} ) => {
	const { value, setValue, disabled } = useBoundProp( stringPropTypeUtil );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setValue( event.target.value );
	};

	return (
		<input
			type="text"
			aria-label={ controlBind }
			value={ value ?? '' }
			onChange={ handleChange }
			disabled={ disabled }
		/>
	);
};

function setup( {
	dependencies,
	values,
	schemaOverrides = {},
}: {
	dependencies: Dependency;
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
