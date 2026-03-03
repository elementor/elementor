import {
	createMockElement,
	createMockPropType,
	createMockStyleDefinitionWithVariants,
	dispatchCommandBefore,
	mockHistoryManager,
} from 'test-utils';
import {
	createElementStyle,
	deleteElementStyle,
	getContainer,
	getElementSetting,
	getElementStyles,
	getWidgetsCache,
	updateElementSettings,
	updateElementStyle,
} from '@elementor/editor-elements';
import { classesPropTypeUtil } from '@elementor/editor-props';
import { type StyleDefinition } from '@elementor/editor-styles';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';

import { initPasteStyleCommand } from '../paste-style';
import { getClipboardElements } from '../utils';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../utils', () => ( {
	...jest.requireActual( '../utils' ),
	getClipboardElements: jest.fn(),
} ) );
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	blockCommand: jest.fn(),
} ) );

const ATOMIC_WIDGET_TYPE = 'atomic-widget';
const CLASSES_PROP_KEY = 'classes';

const mockWidgetSchema = {
	[ ATOMIC_WIDGET_TYPE ]: {
		elType: 'widget',
		title: 'Test Atomic Widget',
		controls: {},
		atomic_controls: [],
		atomic_props_schema: {
			[ CLASSES_PROP_KEY ]: createMockPropType( { key: 'classes', kind: 'plain' } ),
		},
		atomic_style_states: [],
	},
};

describe( 'pasteStyles', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		initPasteStyleCommand();

		jest.mocked( getWidgetsCache ).mockReturnValue( mockWidgetSchema );
		jest.mocked( createElementStyle ).mockReturnValue( 's-new' );
		jest.mocked( getContainer ).mockImplementation( ( id ) =>
			createMockElement( { model: { id, widgetType: ATOMIC_WIDGET_TYPE } } )
		);

		historyMock.beforeEach();
	} );

	afterEach( () => {
		historyMock.afterEach();
		jest.resetAllMocks();
	} );

	describe( 'Pasting local styles', () => {
		it( 'should override existing props, add any unset props to the final style, and ignore any original props that have no conflicts', () => {
			// Arrange.
			const container = createMockElement( {
				model: {
					id: 'test-container',
					widgetType: 'atomic-widget',
				},
			} );

			jest.mocked( getElementStyles ).mockReturnValue( {
				's-1': createMockStyleDefinitionWithVariants( {
					id: 's-1',
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: { a: 0, b: 1, c: 2 },
							custom_css: null,
						},
						{
							meta: { breakpoint: null, state: 'hover' },
							props: { a: 1, b: 2 },
							custom_css: null,
						},
					],
				} ),
			} );

			jest.mocked( getClipboardElements ).mockReturnValue( [
				{
					id: 'test-1',
					elType: 'test-widget',
					styles: {
						's-2': createMockStyleDefinitionWithVariants( {
							id: 's-2',
							variants: [
								{
									meta: { breakpoint: null, state: null },
									props: { a: 1, c: 2 },
									custom_css: null,
								},
								{
									meta: { breakpoint: 'tablet', state: 'hover' },
									props: { a: 3, b: 4 },
									custom_css: null,
								},
							],
						} ),
					},
				},
			] );

			// Act.
			dispatchCommandBefore( 'document/elements/paste-style', { container } );

			// Assert.
			expect( updateElementStyle ).toHaveBeenCalledWith( {
				elementId: 'test-container',
				styleId: 's-1',
				meta: {
					breakpoint: null,
					state: null,
				},
				custom_css: null,
				props: {
					a: 1,
					c: 2,
				},
			} );

			expect( updateElementStyle ).toHaveBeenCalledWith( {
				elementId: 'test-container',
				styleId: 's-1',
				meta: {
					breakpoint: 'tablet',
					state: 'hover',
				},
				custom_css: null,
				props: {
					a: 3,
					b: 4,
				},
			} );

			// Act.
			historyMock.instance.undo();

			// Assert.
			expect( createElementStyle ).toHaveBeenCalledWith( {
				elementId: 'test-container',
				styleId: 's-1',
				label: ELEMENTS_STYLES_RESERVED_LABEL,
				classesProp: 'classes',
				meta: {
					breakpoint: null,
					state: null,
				},
				custom_css: null,
				props: {
					a: 0,
					b: 1,
					c: 2,
				},
				additionalVariants: [
					{
						meta: { breakpoint: null, state: 'hover' },
						props: { a: 1, b: 2 },
						custom_css: null,
					},
				],
			} );

			expect( deleteElementStyle ).not.toHaveBeenCalled();
			expect( createElementStyle ).toHaveBeenCalledTimes( 1 );
			expect( updateElementStyle ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should create a new style if the container does not have its own local style', () => {
			// Arrange.
			const container = createMockElement( {
				model: {
					id: 'test-container',
					widgetType: 'atomic-widget',
				},
			} );

			jest.mocked( getElementStyles ).mockReturnValue( {} );

			jest.mocked( getClipboardElements ).mockReturnValue( [
				{
					id: 'test-1',
					elType: 'test-widget',
					styles: {
						's-2': createMockStyleDefinitionWithVariants( {
							id: 's-1',
							variants: [
								{
									meta: { breakpoint: null, state: null },
									props: { a: 0, b: 1 },
									custom_css: null,
								},
								{
									meta: { breakpoint: null, state: 'hover' },
									props: { a: 1, b: 2 },
									custom_css: null,
								},
							],
						} ),
					},
				},
			] );

			// Act.
			dispatchCommandBefore( 'document/elements/paste-style', { container } );

			// Assert.
			expect( createElementStyle ).toHaveBeenCalledWith( {
				elementId: 'test-container',
				label: ELEMENTS_STYLES_RESERVED_LABEL,
				classesProp: 'classes',
				meta: {
					breakpoint: null,
					state: null,
				},
				props: {
					a: 0,
					b: 1,
				},
				custom_css: null,
				additionalVariants: [
					{
						meta: {
							breakpoint: null,
							state: 'hover',
						},
						custom_css: null,
						props: {
							a: 1,
							b: 2,
						},
					},
				],
			} );

			// Act.
			historyMock.instance.undo();

			// Assert.
			expect( deleteElementStyle ).toHaveBeenCalledWith( 'test-container', 's-new' );

			expect( createElementStyle ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not allow paste if the element is not atomic', () => {
			// Arrange.
			const container = createMockElement( {
				model: {
					id: 'test-container',
					styles: {},
					widgetType: 'non-atomic-widget',
				},
			} );
			jest.mocked( getElementStyles ).mockReturnValue( {} );

			jest.mocked( getClipboardElements ).mockReturnValue( [
				{
					id: 'test-1',
					elType: 'test-widget',
					styles: {
						's-2': createMockStyleDefinitionWithVariants( {
							id: 's-2',
							variants: [
								{
									meta: { breakpoint: null, state: null },
									props: { a: 1, c: 2 },
									custom_css: null,
								},
								{
									meta: { breakpoint: 'tablet', state: 'hover' },
									props: { a: 3, b: 4 },
									custom_css: null,
								},
							],
						} ),
					},
				},
			] );

			// Act.
			dispatchCommandBefore( 'document/elements/paste-style', { container } );

			// Assert.
			expect( createElementStyle ).not.toHaveBeenCalled();
			expect( updateElementStyle ).not.toHaveBeenCalled();
			expect( deleteElementStyle ).not.toHaveBeenCalled();
		} );

		it( 'should take only one style def from the clipboard, regardless of how many containers and/or local styles are there', () => {
			// Arrange.
			const container = createMockElement( {
				model: {
					id: 'test-container',
					widgetType: 'atomic-widget',
				},
			} );

			jest.mocked( getElementStyles ).mockReturnValue( {
				's-1': createMockStyleDefinitionWithVariants( {
					id: 's-1',
					variants: [
						{
							meta: { breakpoint: null, state: null },
							props: { a: 0, b: 1 },
							custom_css: null,
						},
						{
							meta: { breakpoint: null, state: 'hover' },
							props: { a: 1, b: 2 },
							custom_css: null,
						},
					],
				} ),
			} );

			jest.mocked( getClipboardElements ).mockReturnValue( [
				{
					id: 'test-1',
					elType: 'test-widget',
					styles: {
						's-2': createMockStyleDefinitionWithVariants( {
							id: 's-2',
							variants: [
								{
									meta: { breakpoint: null, state: null },
									props: { a: 1, c: 2 },
									custom_css: null,
								},
							],
						} ),
						's-3': createMockStyleDefinitionWithVariants( {
							id: 's-3',
							variants: [
								{
									meta: { breakpoint: null, state: null },
									props: { a: 3, c: 4 },
									custom_css: null,
								},
							],
						} ),
					},
				},
				{
					id: 'test-2',
					elType: 'test-widget',
					styles: {
						's-4': createMockStyleDefinitionWithVariants( {
							id: 's-4',
							variants: [
								{
									meta: { breakpoint: null, state: null },
									props: { a: 4, c: 5 },
									custom_css: null,
								},
							],
						} ),
					},
				},
			] );

			// Act.
			dispatchCommandBefore( 'document/elements/paste-style', { container } );

			// Assert.
			expect( updateElementStyle ).toHaveBeenCalledWith( {
				elementId: 'test-container',
				styleId: 's-1',
				meta: {
					breakpoint: null,
					state: null,
				},
				props: {
					a: 1,
					c: 2,
				},
				custom_css: null,
			} );

			expect( updateElementStyle ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should ignore the command if the clipboard element has no styles', () => {
			// Arrange.
			const container = createMockElement( {
				model: {
					id: 'test-container',
					widgetType: 'atomic-widget',
				},
			} );

			jest.mocked( getClipboardElements ).mockReturnValue( [
				{
					id: 'test-1',
					elType: 'test-widget',
					styles: {},
				},
			] );

			// Act.
			dispatchCommandBefore( 'document/elements/paste-style', { container } );

			// Assert.
			expect( createElementStyle ).not.toHaveBeenCalled();
			expect( updateElementStyle ).not.toHaveBeenCalled();
			expect( deleteElementStyle ).not.toHaveBeenCalled();
		} );

		it( 'should support multiple containers responsively - create/update styles, and ignore non atomic widgets', () => {
			// Arrange.
			const container1 = createMockElement( {
				model: {
					id: 'test-container-1',
					widgetType: 'atomic-widget',
				},
			} );

			const container2 = createMockElement( {
				model: {
					id: 'test-container-2',
					widgetType: 'atomic-widget',
				},
			} );

			const container3 = createMockElement( {
				model: {
					id: 'test-container-3',
					widgetType: 'non-atomic-widget',
				},
			} );

			jest.mocked( getElementStyles ).mockImplementation( ( containerId ) => {
				switch ( containerId ) {
					case 'test-container-1':
						return {};
					case 'test-container-2':
						return {
							's-1': createMockStyleDefinitionWithVariants( {
								id: 's-1',
								variants: [
									{
										meta: { breakpoint: null, state: null },
										props: { a: 0, b: 1 },
										custom_css: null,
									},
									{
										meta: { breakpoint: null, state: 'hover' },
										props: { a: 1, b: 2 },
										custom_css: null,
									},
								],
							} ),
						} as Record< string, StyleDefinition >;
					default:
						return null;
				}
			} );

			jest.mocked( getClipboardElements ).mockReturnValue( [
				{
					id: 'test-1',
					elType: 'test-widget',
					styles: {
						's-2': createMockStyleDefinitionWithVariants( {
							id: 's-2',
							variants: [
								{
									meta: { breakpoint: null, state: null },
									props: { a: 0, b: 1 },
									custom_css: null,
								},
								{
									meta: { breakpoint: null, state: 'hover' },
									props: { a: 1, b: 2 },
									custom_css: null,
								},
							],
						} ),
					},
				},
			] );

			// Act.
			dispatchCommandBefore( 'document/elements/paste-style', {
				containers: [ container1, container2, container3 ],
			} );

			// Assert.
			expect( createElementStyle ).toHaveBeenCalledWith( {
				elementId: 'test-container-1',
				label: ELEMENTS_STYLES_RESERVED_LABEL,
				classesProp: 'classes',
				meta: {
					breakpoint: null,
					state: null,
				},
				props: {
					a: 0,
					b: 1,
				},
				custom_css: null,
				additionalVariants: [
					{
						meta: {
							breakpoint: null,
							state: 'hover',
						},
						props: {
							a: 1,
							b: 2,
						},
						custom_css: null,
					},
				],
			} );

			expect( updateElementStyle ).toHaveBeenCalledWith( {
				elementId: 'test-container-2',
				styleId: 's-1',
				meta: {
					breakpoint: null,
					state: null,
				},
				props: {
					a: 0,
					b: 1,
				},
				custom_css: null,
			} );

			expect( updateElementStyle ).toHaveBeenCalledWith( {
				elementId: 'test-container-2',
				styleId: 's-1',
				meta: {
					breakpoint: null,
					state: null,
				},
				props: {
					a: 0,
					b: 1,
				},
				custom_css: null,
			} );

			expect( createElementStyle ).toHaveBeenCalledTimes( 1 );
			expect( updateElementStyle ).toHaveBeenCalledTimes( 2 );

			// Act.
			historyMock.instance.undo();

			// Assert.
			expect( deleteElementStyle ).toHaveBeenCalledWith( 'test-container-1', 's-new' );

			expect( createElementStyle ).toHaveBeenCalledWith( {
				elementId: 'test-container-2',
				label: ELEMENTS_STYLES_RESERVED_LABEL,
				classesProp: 'classes',
				styleId: 's-1',
				meta: {
					breakpoint: null,
					state: null,
				},
				props: {
					a: 0,
					b: 1,
				},
				custom_css: null,
				additionalVariants: [
					{
						meta: {
							breakpoint: null,
							state: 'hover',
						},
						custom_css: null,
						props: {
							a: 1,
							b: 2,
						},
					},
				],
			} );

			expect( deleteElementStyle ).toHaveBeenCalledTimes( 1 );
			expect( createElementStyle ).toHaveBeenCalledTimes( 2 );
			expect( updateElementStyle ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	describe( 'Pasting styles and classes', () => {
		type SelectedElementState = {
			id: string;
			hasLocalStyle: boolean;
			existingClasses: string[];
		};

		type ClipboardState = {
			hasLocalStyle: boolean;
			otherClasses: string[];
		};

		type PasteStylesTestCase = {
			scenario: string;
			clipboard: ClipboardState;
			selectedElements: SelectedElementState[];
			expectedCalls: {
				createElementStyle: number;
				updateElementStyle: number;
				updateElementSettings: number;
			};
			expectedClasses?: Record< string, string[] >;
		};

		const CLIPBOARD_ELEMENT_ID = 'clipboard-element';
		const CLIPBOARD_STYLE_ID = 's-clipboard';

		const createLocalStyle = ( id: string ): StyleDefinition =>
			createMockStyleDefinitionWithVariants( {
				id,
				variants: [ { meta: { breakpoint: null, state: null }, props: { color: 'red' }, custom_css: null } ],
			} );

		const setupTestMocks = ( selectedElements: SelectedElementState[], clipboard: ClipboardState ) => {
			const containerMap = new Map< string, SelectedElementState >();
			selectedElements.forEach( ( el ) => containerMap.set( el.id, el ) );

			jest.mocked( getContainer ).mockImplementation( ( id ) => {
				if ( id === CLIPBOARD_ELEMENT_ID ) {
					return createMockElement( { model: { id, widgetType: ATOMIC_WIDGET_TYPE } } );
				}
				const config = containerMap.get( id );
				if ( ! config ) {
					return null;
				}
				return createMockElement( { model: { id: config.id, widgetType: ATOMIC_WIDGET_TYPE } } );
			} );

			jest.mocked( getElementStyles ).mockImplementation( ( elementId ) => {
				const config = containerMap.get( elementId );
				if ( ! config?.hasLocalStyle ) {
					return {};
				}
				return { [ `s-${ elementId }` ]: createLocalStyle( `s-${ elementId }` ) };
			} );

			jest.mocked( getElementSetting ).mockImplementation( ( elementId, prop ) => {
				if ( prop !== CLASSES_PROP_KEY ) {
					return null;
				}

				if ( elementId === CLIPBOARD_ELEMENT_ID ) {
					const allClasses = clipboard.hasLocalStyle
						? [ CLIPBOARD_STYLE_ID, ...clipboard.otherClasses ]
						: clipboard.otherClasses;
					return allClasses.length ? classesPropTypeUtil.create( allClasses ) : null;
				}

				const config = containerMap.get( elementId );
				if ( ! config?.existingClasses.length ) {
					return null;
				}
				return classesPropTypeUtil.create( config.existingClasses );
			} );

			jest.mocked( getClipboardElements ).mockReturnValue( [
				{
					id: CLIPBOARD_ELEMENT_ID,
					elType: 'widget',
					styles: clipboard.hasLocalStyle
						? { [ CLIPBOARD_STYLE_ID ]: createLocalStyle( CLIPBOARD_STYLE_ID ) }
						: {},
				},
			] );
		};

		const createContainersForDispatch = ( elements: SelectedElementState[] ) =>
			elements.map( ( el ) => createMockElement( { model: { id: el.id, widgetType: ATOMIC_WIDGET_TYPE } } ) );

		const testCases: PasteStylesTestCase[] = [
			{
				scenario: 'do nothing when clipboard has no style and no classes',
				clipboard: { hasLocalStyle: false, otherClasses: [] },
				selectedElements: [ { id: 'el-1', hasLocalStyle: false, existingClasses: [] } ],
				expectedCalls: { createElementStyle: 0, updateElementStyle: 0, updateElementSettings: 0 },
			},
			{
				scenario: 'do nothing when there are no selected elements',
				clipboard: { hasLocalStyle: true, otherClasses: [ 'global-1' ] },
				selectedElements: [],
				expectedCalls: { createElementStyle: 0, updateElementStyle: 0, updateElementSettings: 0 },
			},
			{
				scenario: 'create style when clipboard has style and selected has none',
				clipboard: { hasLocalStyle: true, otherClasses: [] },
				selectedElements: [ { id: 'el-1', hasLocalStyle: false, existingClasses: [] } ],
				expectedCalls: { createElementStyle: 1, updateElementStyle: 0, updateElementSettings: 0 },
			},
			{
				scenario: 'update style when clipboard has style and selected also has style',
				clipboard: { hasLocalStyle: true, otherClasses: [] },
				selectedElements: [ { id: 'el-1', hasLocalStyle: true, existingClasses: [] } ],
				expectedCalls: { createElementStyle: 0, updateElementStyle: 1, updateElementSettings: 0 },
			},
			{
				scenario: 'add classes when clipboard has only global classes',
				clipboard: { hasLocalStyle: false, otherClasses: [ 'global-1', 'global-2' ] },
				selectedElements: [ { id: 'el-1', hasLocalStyle: false, existingClasses: [] } ],
				expectedCalls: { createElementStyle: 0, updateElementStyle: 0, updateElementSettings: 1 },
				expectedClasses: { 'el-1': [ 'global-1', 'global-2' ] },
			},
			{
				scenario: 'merge classes when both clipboard and selected have classes',
				clipboard: { hasLocalStyle: false, otherClasses: [ 'global-1', 'global-2' ] },
				selectedElements: [ { id: 'el-1', hasLocalStyle: false, existingClasses: [ 'existing-1' ] } ],
				expectedCalls: { createElementStyle: 0, updateElementStyle: 0, updateElementSettings: 1 },
				expectedClasses: { 'el-1': [ 'global-1', 'global-2', 'existing-1' ] },
			},
			{
				scenario: 'deduplicate classes when same class exists on both',
				clipboard: { hasLocalStyle: false, otherClasses: [ 'shared-class', 'global-1' ] },
				selectedElements: [
					{ id: 'el-1', hasLocalStyle: false, existingClasses: [ 'shared-class', 'existing-1' ] },
				],
				expectedCalls: { createElementStyle: 0, updateElementStyle: 0, updateElementSettings: 1 },
				expectedClasses: { 'el-1': [ 'shared-class', 'global-1', 'existing-1' ] },
			},
			{
				scenario: 'paste style and classes together',
				clipboard: { hasLocalStyle: true, otherClasses: [ 'global-1' ] },
				selectedElements: [ { id: 'el-1', hasLocalStyle: false, existingClasses: [] } ],
				expectedCalls: { createElementStyle: 1, updateElementStyle: 0, updateElementSettings: 1 },
				expectedClasses: { 'el-1': [ 'global-1' ] },
			},
			{
				scenario: 'handle multiple selected elements with mixed states',
				clipboard: { hasLocalStyle: true, otherClasses: [ 'global-1' ] },
				selectedElements: [
					{ id: 'el-1', hasLocalStyle: false, existingClasses: [] },
					{ id: 'el-2', hasLocalStyle: true, existingClasses: [ 'existing-1' ] },
				],
				expectedCalls: { createElementStyle: 1, updateElementStyle: 1, updateElementSettings: 2 },
				expectedClasses: {
					'el-1': [ 'global-1' ],
					'el-2': [ 'global-1', 'existing-1' ],
				},
			},
			{
				scenario: 'not update settings when clipboard has only local style class (no global classes)',
				clipboard: { hasLocalStyle: true, otherClasses: [] },
				selectedElements: [ { id: 'el-1', hasLocalStyle: false, existingClasses: [ 'existing-1' ] } ],
				expectedCalls: { createElementStyle: 1, updateElementStyle: 0, updateElementSettings: 0 },
			},
		];

		it.each( testCases )(
			'should $scenario',
			( {
				clipboard,
				selectedElements,
				expectedCalls: {
					createElementStyle: expectedCreateElementStyle,
					updateElementStyle: expectedUpdateElementStyle,
					updateElementSettings: expectedUpdateElementSettings,
				},
				expectedClasses,
			} ) => {
				// Arrange.
				setupTestMocks( selectedElements, clipboard );
				const containers = createContainersForDispatch( selectedElements );

				// Act.
				dispatchCommandBefore( 'document/elements/paste-style', {
					containers,
				} );

				// Assert.
				expect( createElementStyle ).toHaveBeenCalledTimes( expectedCreateElementStyle );
				expect( updateElementStyle ).toHaveBeenCalledTimes( expectedUpdateElementStyle );
				expect( updateElementSettings ).toHaveBeenCalledTimes( expectedUpdateElementSettings );

				selectedElements.forEach( ( { id } ) => {
					if ( expectedClasses?.[ id ] ) {
						expect( updateElementSettings ).toHaveBeenCalledWith( {
							id,
							props: {
								[ CLASSES_PROP_KEY ]: classesPropTypeUtil.create( expectedClasses[ id ] ),
							},
						} );
					} else {
						expect( updateElementSettings ).not.toHaveBeenCalledWith(
							expect.objectContaining( {
								id,
							} )
						);
					}
				} );
			}
		);
	} );
} );
