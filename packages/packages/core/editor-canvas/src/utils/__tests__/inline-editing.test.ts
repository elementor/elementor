import { type ExtendedWindow, type V1Element } from '@elementor/editor-elements';
import { getElementType } from '@elementor/editor-elements';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { getHtmlPropertyName, getHtmlPropType, shouldRenderInlineEditingView } from '../inline-editing-utils';

type MockContainer = Pick< V1Element, 'id' | 'model' >;

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	isExperimentActive: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementType: jest.fn(),
} ) );

const TEST_ELEMENT_ID = '1-heading';

describe( 'inline-editing-utils', () => {
	describe( 'shouldRenderInlineEditingView', () => {
		it( 'should return true if the element type is in the widget property map and the experiment is active', () => {
			// Arrange.
			jest.mocked( isExperimentActive ).mockReturnValue( true );

			// Act & Assert.
			expect( shouldRenderInlineEditingView( 'e-heading' ) ).toBe( true );
		} );

		it( 'should return false if the element type is not in the widget property map', () => {
			// Arrange.
			jest.mocked( isExperimentActive ).mockReturnValue( true );

			// Act & Assert.
			expect( shouldRenderInlineEditingView( 'e-not-supported' ) ).toBe( false );
		} );

		it( 'should return false if the experiment is not active', () => {
			// Arrange.
			jest.mocked( isExperimentActive ).mockReturnValue( false );

			// Act & Assert.
			expect( shouldRenderInlineEditingView( 'e-heading' ) ).toBe( false );
		} );
	} );

	describe( 'getHtmlPropertyName', () => {
		let elementContainer: MockContainer | null = null;
		const mockGetContainer = jest.fn().mockImplementation( () => {
			return elementContainer;
		} );

		beforeEach( () => {
			const extendedWindow = window as unknown as ExtendedWindow;

			extendedWindow.elementor = {
				getContainer: mockGetContainer,
			};
		} );

		it( 'should return the html property name if the element type is in the widget property map', () => {
			// Arrange.
			elementContainer = createMockContainer( 'widget', {
				widgetType: 'e-heading',
			} );

			// Act.
			const htmlPropertyName = getHtmlPropertyName( elementContainer as V1Element );

			// Assert.
			expect( htmlPropertyName ).toBe( 'title' );
		} );

		it( 'should return the html property name if the element type is not in the widget property map: plain propType', () => {
			// Arrange.
			elementContainer = createMockContainer( 'widget', {
				widgetType: 'e-not-supported',
			} );
			jest.mocked( getElementType ).mockReturnValue( {
				key: 'e-not-supported',
				controls: [],
				propsSchema: {
					editMe: {
						kind: 'plain',
						key: 'html',
						settings: {},
						meta: {},
					},
				},
				title: 'Not Supported',
			} );

			// Act.
			const htmlPropertyName = getHtmlPropertyName( elementContainer as V1Element );

			// Assert.
			expect( htmlPropertyName ).toBe( 'editMe' );
		} );

		it( 'should return the html property name if the element type is not in the widget property map: object propType', () => {
			// Arrange.
			elementContainer = createMockContainer( 'widget', {
				widgetType: 'e-not-supported',
			} );
			jest.mocked( getElementType ).mockReturnValue( {
				key: 'e-not-supported',
				controls: [],
				propsSchema: {
					editMe: {
						kind: 'object',
						key: 'Prop Key',
						settings: {},
						meta: {},
						shape: {
							nonHtml: {
								kind: 'plain',
								key: 'nonHtml',
								settings: {},
								meta: {},
							},
							html: {
								kind: 'plain',
								key: 'html',
								settings: {},
								meta: {},
							},
						},
					},
				},
				title: 'Not Supported',
			} );

			// Act.
			const htmlPropertyName = getHtmlPropertyName( elementContainer as V1Element );

			// Assert.
			expect( htmlPropertyName ).toBe( 'editMe' );
		} );

		it( 'should return the html property name if the element type is not in the widget property map: array propType', () => {
			// Arrange.
			elementContainer = createMockContainer( 'widget', {
				widgetType: 'e-not-supported',
			} );
			jest.mocked( getElementType ).mockReturnValue( {
				key: 'e-not-supported',
				controls: [],
				propsSchema: {
					editMe: {
						kind: 'array',
						key: 'Prop Key',
						settings: {},
						meta: {},
						item_prop_type: {
							kind: 'plain',
							key: 'html',
							settings: {},
							meta: {},
						},
					},
				},
				title: 'Not Supported',
			} );

			// Act.
			const htmlPropertyName = getHtmlPropertyName( elementContainer as V1Element );

			// Assert.
			expect( htmlPropertyName ).toBe( 'editMe' );
		} );

		it( 'should return the html property name if the element type is not in the widget property map: union propType', () => {
			// Arrange.
			elementContainer = createMockContainer( 'widget', {
				widgetType: 'e-not-supported',
			} );
			jest.mocked( getElementType ).mockReturnValue( {
				key: 'e-not-supported',
				controls: [],
				propsSchema: {
					editMe: {
						kind: 'union',
						key: 'Prop Key',
						settings: {},
						meta: {},
						prop_types: {
							nonHtml: {
								kind: 'plain',
								key: 'nonHtml',
								settings: {},
								meta: {},
							},
							html: {
								kind: 'plain',
								key: 'html',
								settings: {},
								meta: {},
							},
						},
					},
				},
				title: 'Not Supported',
			} );

			// Act.
			const htmlPropertyName = getHtmlPropertyName( elementContainer as V1Element );

			// Assert.
			expect( htmlPropertyName ).toBe( 'editMe' );
		} );
	} );

	describe( 'getHtmlPropType', () => {
		let elementContainer: MockContainer | null = null;
		const mockGetContainer = jest.fn().mockImplementation( () => {
			return elementContainer;
		} );

		beforeEach( () => {
			const extendedWindow = window as unknown as ExtendedWindow;

			extendedWindow.elementor = {
				getContainer: mockGetContainer,
			};
		} );

		it( 'should return the html propType if the element type is in the widget property map', () => {
			// Arrange.
			elementContainer = createMockContainer( 'widget', {
				widgetType: 'e-paragraph',
			} );
			jest.mocked( getElementType ).mockReturnValue( {
				key: 'e-paragraph',
				controls: [],
				propsSchema: {
					paragraph: {
						kind: 'plain',
						key: 'html',
						settings: {},
						meta: {},
					},
				},
				title: 'Not Supported',
			} );

			// Act.
			const htmlPropType = getHtmlPropType( elementContainer as V1Element );

			// Assert.
			expect( htmlPropType ).toBeTruthy();
		} );

		it( 'should return the html propType if the element type is not in the widget property map', () => {
			// Arrange.
			elementContainer = createMockContainer( 'widget', {
				widgetType: 'e-not-supported',
			} );
			jest.mocked( getElementType ).mockReturnValue( {
				key: 'e-not-supported',
				controls: [],
				propsSchema: {
					editMe: {
						kind: 'plain',
						key: 'html',
						settings: {},
						meta: {},
					},
				},
				title: 'Not Supported',
			} );

			// Act.
			const htmlPropType = getHtmlPropType( elementContainer as V1Element );

			// Assert.
			expect( htmlPropType ).toBeTruthy();
		} );

		it( 'should return null if the element type is not in the widget property map', () => {
			// Arrange.
			elementContainer = createMockContainer( 'widget', {
				widgetType: 'e-not-supported',
			} );
			jest.mocked( getElementType ).mockReturnValue( {
				key: 'e-not-supported',
				controls: [],
				propsSchema: {
					editMe: {
						kind: 'plain',
						key: 'notHtml',
						settings: {},
						meta: {},
					},
				},
				title: 'Not Supported',
			} );

			// Act.
			const htmlPropType = getHtmlPropType( elementContainer as V1Element );

			// Assert.
			expect( htmlPropType ).toBeNull();
		} );
	} );
} );

function createMockContainer( elType: string, elementOverrides: Record< string, unknown > = {} ): MockContainer {
	const elementData = {
		id: TEST_ELEMENT_ID,
		elType,
		settings: {},
		...elementOverrides,
	};

	return {
		id: TEST_ELEMENT_ID,
		model: {
			get: ( key: string ) => {
				if ( key === 'elType' ) {
					return elType;
				}

				return elementData[ key as keyof typeof elementData ];
			},
			set: jest.fn(),
			toJSON: () => elementData,
		},
	} as MockContainer;
}
