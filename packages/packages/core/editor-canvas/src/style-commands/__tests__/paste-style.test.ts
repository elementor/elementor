import {
	createMockElement,
	createMockStyleDefinitionWithVariants,
	dispatchCommandBefore,
	mockHistoryManager,
} from 'test-utils';
import {
	createElementStyle,
	deleteElementStyle,
	getElementStyles,
	updateElementStyle,
} from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';

import { initPasteStyleCommand } from '../paste-style';
import { getClassesProp, getClipboardElements, isAtomicWidget } from '../utils';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../utils', () => ( {
	...jest.requireActual( '../utils' ),
	getClipboardElements: jest.fn(),
	getClassesProp: jest.fn(),
	isAtomicWidget: jest.fn(),
} ) );
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	blockCommand: jest.fn(),
} ) );

describe( 'pasteStyles', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		initPasteStyleCommand();

		jest.mocked( getClassesProp ).mockReturnValue( 'classes' );
		jest.mocked( createElementStyle ).mockReturnValue( 's-new' );
		jest.mocked( isAtomicWidget ).mockImplementation(
			( container ) => container?.model.get( 'widgetType' ) === 'atomic-widget'
		);

		historyMock.beforeEach();
	} );

	afterEach( () => {
		historyMock.afterEach();
		jest.resetAllMocks();
	} );

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
