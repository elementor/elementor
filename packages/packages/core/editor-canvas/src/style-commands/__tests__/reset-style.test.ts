import {
	createMockElement,
	createMockStyleDefinitionWithVariants,
	dispatchCommandBefore,
	mockHistoryManager,
} from 'test-utils';
import { createElementStyle, deleteElementStyle, getElementStyles } from '@elementor/editor-elements';
import { ELEMENTS_STYLES_RESERVED_LABEL } from '@elementor/editor-styles-repository';

import { initResetStyleCommand } from '../reset-style';
import { getClassesProp, hasAtomicWidgets, isAtomicWidget } from '../utils';

jest.mock( '@elementor/editor-elements' );

jest.mock( '../utils', () => ( {
	...jest.requireActual( '../utils' ),
	getClassesProp: jest.fn(),
	hasAtomicWidgets: jest.fn(),
	isAtomicWidget: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	blockCommand: jest.fn(),
} ) );

describe( 'resetStyles', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		initResetStyleCommand();
		historyMock.beforeEach();
	} );

	afterEach( () => {
		historyMock.afterEach();
		jest.resetAllMocks();
	} );

	it( 'should clear the existing local style', () => {
		// Arrange.
		const originalStyles = {
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
		};
		const container = createMockElement( {
			model: {
				id: 'test-container',
				styles: originalStyles,
				widgetType: 'test-widget',
			},
		} );

		jest.mocked( getElementStyles ).mockReturnValue( originalStyles );
		jest.mocked( getClassesProp ).mockReturnValue( 'classes' );
		jest.mocked( hasAtomicWidgets ).mockReturnValue( true );
		jest.mocked( isAtomicWidget ).mockReturnValue( true );

		// Act.
		dispatchCommandBefore( 'document/elements/reset-style', { container } );

		// Assert.
		expect( deleteElementStyle ).toHaveBeenCalledWith( 'test-container', 's-1' );
		expect( historyMock.instance.get() ).not.toBeNull();

		// Act.
		historyMock.instance.undo();

		// Assert.
		expect( createElementStyle ).toHaveBeenCalledWith( {
			elementId: 'test-container',
			label: ELEMENTS_STYLES_RESERVED_LABEL,
			classesProp: 'classes',
			custom_css: null,
			meta: {
				breakpoint: null,
				state: null,
			},
			props: {
				a: 0,
				b: 1,
			},
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
			styleId: 's-1',
		} );
	} );

	it( 'should not do anything if the widget is not atomic', () => {
		// Arrange.
		const container = createMockElement( {
			model: {
				id: 'test-container',
				widgetType: 'test-widget',
			},
		} );

		jest.mocked( hasAtomicWidgets ).mockReturnValue( false );
		jest.mocked( isAtomicWidget ).mockReturnValue( false );

		// Act.
		dispatchCommandBefore( 'document/elements/reset-style', { container } );

		// Assert.
		expect( deleteElementStyle ).not.toHaveBeenCalled();
		expect( historyMock.instance.get() ).toBeNull();
	} );

	it( 'should not do anything if the widget is atomic but has no style', () => {
		// Arrange.
		const container = createMockElement( {
			model: {
				id: 'test-container',
				widgetType: 'test-widget',
			},
		} );

		jest.mocked( hasAtomicWidgets ).mockReturnValue( true );
		jest.mocked( isAtomicWidget ).mockReturnValue( true );

		// Act.
		dispatchCommandBefore( 'document/elements/reset-style', { container } );

		// Assert.
		expect( deleteElementStyle ).not.toHaveBeenCalled();

		// Act.
		historyMock.instance.undo();

		// Assert.
		expect( createElementStyle ).not.toHaveBeenCalled();
	} );
} );
