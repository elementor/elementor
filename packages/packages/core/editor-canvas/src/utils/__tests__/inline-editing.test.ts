import { type ExtendedWindow, type V1Element } from '@elementor/editor-elements';
import { getElementType } from '@elementor/editor-elements';

import {
	getBlockedValue,
	getHtmlPropertyName
} from '../inline-editing-utils';

type MockContainer = Pick< V1Element, 'id' | 'model' >;

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementType: jest.fn(),
} ) );

const TEST_ELEMENT_ID = '1-heading';

describe( 'inline-editing-utils', () => {

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

	describe( 'getBlockedValue', () => {
		it( 'should return empty string when value is null', () => {
			// Arrange.
			const value = null;
			const expectedTag = 'div';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '' );
		} );

		it( 'should return empty string when value is empty string', () => {
			// Arrange.
			const value = '';
			const expectedTag = 'div';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '' );
		} );

		it( 'should return value as-is when expectedTag is null', () => {
			// Arrange.
			const value = '<p>Some content</p>';
			const expectedTag = null;

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<p>Some content</p>' );
		} );

		it( 'should return value as-is when expectedTag is empty string', () => {
			// Arrange.
			const value = '<p>Some content</p>';
			const expectedTag = '';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<p>Some content</p>' );
		} );

		it( 'should wrap plain text with expectedTag when no HTML elements exist', () => {
			// Arrange.
			const value = 'Plain text content';
			const expectedTag = 'h2';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<h2>Plain text content</h2>' );
		} );

		it( 'should return value as-is when single child matches expectedTag', () => {
			// Arrange.
			const value = '<h2>Heading text</h2>';
			const expectedTag = 'h2';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<h2>Heading text</h2>' );
		} );

		it( 'should replace when single child has different tag', () => {
			// Arrange.
			const value = '<p>Some content</p>';
			const expectedTag = 'h2';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<h2>Some content</h2>' );
		} );

		it( 'should wrap entire content when multiple children exist', () => {
			// Arrange.
			const value = '<p>First paragraph</p><p>Second paragraph</p>';
			const expectedTag = 'div';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<div><p>First paragraph</p><p>Second paragraph</p></div>' );
		} );

		it( 'should wrap content when it does not start with expectedTag', () => {
			// Arrange.
			const value = '<span>Content</span><h2>More content</h2>';
			const expectedTag = 'h2';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<h2><span>Content</span><h2>More content</h2></h2>' );
		} );

		it( 'should wrap content when it does not end with expectedTag', () => {
			// Arrange.
			const value = '<h2>Content</h2><span>More content</span>';
			const expectedTag = 'h2';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<h2><h2>Content</h2><span>More content</span></h2>' );
		} );

		it( 'should handle case-insensitive tag comparison', () => {
			// Arrange.
			const value = '<H2>Heading text</H2>';
			const expectedTag = 'h2';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<H2>Heading text</H2>' );
		} );

		it( 'should preserve inner HTML when unwrapping and rewrapping, with expected tag', () => {
			// Arrange.
			const value = '<p><strong>Bold</strong> and <em>italic</em></p>';
			const expectedTag = 'h2';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<h2><strong>Bold</strong> and <em>italic</em></h2>' );
		} );

		it( 'should handle nested elements correctly when single child matches expectedTag', () => {
			// Arrange.
			const value = '<h2><span>Nested content</span></h2>';
			const expectedTag = 'h2';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<h2><span>Nested content</span></h2>' );
		} );

		it( 'should handle self-closing tags in content', () => {
			// Arrange.
			const value = 'Text with <br> break';
			const expectedTag = 'p';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<p>Text with <br> break</p>' );
		} );

		it( 'should wrap content when first child matches but last child does not', () => {
			// Arrange.
			const value = '<h2>First</h2><p>Second</p>';
			const expectedTag = 'h2';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<h2><h2>First</h2><p>Second</p></h2>' );
		} );

		it( 'should handle whitespace-only content', () => {
			// Arrange.
			const value = '   ';
			const expectedTag = 'p';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<p>   </p>' );
		} );

		it( 'should handle special characters in content', () => {
			// Arrange.
			const value = 'Content with & < > " \' characters';
			const expectedTag = 'p';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<p>Content with & < > " \' characters</p>' );
		} );

		it( 'should wrap content when edges are wrapped correctly but the rest is not', () => {
			// Arrange.
			const value = '<h2>this</h2> is <h2>cool</h2>';
			const expectedTag = 'h2';

			// Act.
			const result = getBlockedValue( value, expectedTag );

			// Assert.
			expect( result ).toBe( '<h2><h2>this</h2> is <h2>cool</h2></h2>' );
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
