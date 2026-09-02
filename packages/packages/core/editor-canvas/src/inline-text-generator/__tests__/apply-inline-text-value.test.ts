import { getContainer, getElementLabel, getElementType } from '@elementor/editor-elements';
import {
	escapedHtmlPropTypeUtil,
	htmlV3PropTypeUtil,
	stringPropTypeUtil,
} from '@elementor/editor-props';
import { __privateRunCommandSync as runCommandSync, undoable } from '@elementor/editor-v1-adapters';

import { applyInlineTextValue } from '../apply-inline-text-value';

jest.mock( '@elementor/editor-elements', () => ( {
	getContainer: jest.fn(),
	getElementLabel: jest.fn(),
	getElementType: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommandSync: jest.fn(),
	undoable: jest.fn( ( action ) => () => action.do() ),
} ) );

const ELEMENT_ID = 'element-1';
const ALLOWED_HTML_WRAPPER_TAGS = [ 'p', 'strong', 'a' ];

const createContainerMock = ( widgetType: string, bind: string, prevValue: unknown ) =>
	( {
		model: {
			get: jest.fn().mockReturnValue( widgetType ),
		},
		settings: {
			get: jest.fn().mockImplementation( ( key: string ) => ( key === bind ? prevValue : null ) ),
		},
	} ) as never;

describe( 'applyInlineTextValue', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.elementorCommon = {
			config: {
				allowedHTMLWrapperTags: ALLOWED_HTML_WRAPPER_TAGS,
			},
		};
		jest.mocked( getElementLabel ).mockReturnValue( 'Element' );
	} );

	afterEach( () => {
		delete window.elementorCommon;
	} );

	it( 'should apply escaped-html through set-settings and mark document modified', () => {
		// Arrange.
		const bind = 'title';
		const generatedHtml = '<p>Generated <strong>text</strong></p>';
		jest.mocked( getContainer ).mockReturnValue(
			createContainerMock( 'e-heading', bind, escapedHtmlPropTypeUtil.create( '<p>Old</p>' ) )
		);
		jest.mocked( getElementType ).mockReturnValue( {
			propsSchema: {
				title: { key: escapedHtmlPropTypeUtil.key },
			},
		} as never );

		// Act.
		applyInlineTextValue( ELEMENT_ID, bind, generatedHtml );

		// Assert.
		expect( undoable ).toHaveBeenCalled();
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			expect.objectContaining( {
				settings: {
					title: escapedHtmlPropTypeUtil.create( generatedHtml ),
				},
			} ),
			{ internal: true }
		);
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);
	} );

	it( 'should sanitize disallowed tags for escaped-html properties', () => {
		// Arrange.
		const bind = 'title';
		const unsafeHtml = '<p>Safe</p><script>alert(1)</script>';
		jest.mocked( getContainer ).mockReturnValue(
			createContainerMock( 'e-heading', bind, escapedHtmlPropTypeUtil.create( '<p>Old</p>' ) )
		);
		jest.mocked( getElementType ).mockReturnValue( {
			propsSchema: {
				title: { key: escapedHtmlPropTypeUtil.key },
			},
		} as never );

		// Act.
		applyInlineTextValue( ELEMENT_ID, bind, unsafeHtml );

		// Assert.
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			expect.objectContaining( {
				settings: {
					title: escapedHtmlPropTypeUtil.create( '<p>Safe</p>' ),
				},
			} ),
			{ internal: true }
		);
	} );

	it( 'should wrap sanitized html in html-v3 content', () => {
		// Arrange.
		const bind = 'paragraph';
		const generatedHtml = '<p>Rich <strong>text</strong></p>';
		jest.mocked( getContainer ).mockReturnValue(
			createContainerMock( 'e-paragraph', bind, htmlV3PropTypeUtil.create( {
				content: stringPropTypeUtil.create( '<p>Old</p>' ),
				children: [],
			} ) )
		);
		jest.mocked( getElementType ).mockReturnValue( {
			propsSchema: {
				paragraph: { key: htmlV3PropTypeUtil.key },
			},
		} as never );

		// Act.
		applyInlineTextValue( ELEMENT_ID, bind, generatedHtml );

		// Assert.
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			expect.objectContaining( {
				settings: {
					paragraph: htmlV3PropTypeUtil.create( {
						content: stringPropTypeUtil.create( generatedHtml ),
						children: [],
					} ),
				},
			} ),
			{ internal: true }
		);
	} );

	it( 'should sanitize html-v3 content and strip disallowed tags', () => {
		// Arrange.
		const bind = 'paragraph';
		const unsafeHtml = '<p>Safe</p><script>alert(1)</script>';
		jest.mocked( getContainer ).mockReturnValue(
			createContainerMock( 'e-paragraph', bind, htmlV3PropTypeUtil.create( {
				content: stringPropTypeUtil.create( '<p>Old</p>' ),
				children: [],
			} ) )
		);
		jest.mocked( getElementType ).mockReturnValue( {
			propsSchema: {
				paragraph: { key: htmlV3PropTypeUtil.key },
			},
		} as never );

		// Act.
		applyInlineTextValue( ELEMENT_ID, bind, unsafeHtml );

		// Assert.
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			expect.objectContaining( {
				settings: {
					paragraph: htmlV3PropTypeUtil.create( {
						content: stringPropTypeUtil.create( '<p>Safe</p>' ),
						children: [],
					} ),
				},
			} ),
			{ internal: true }
		);
	} );

	it( 'should convert generated html to plain text for string properties', () => {
		// Arrange.
		const bind = 'text';
		const generatedHtml = '<p>Hello <strong>world</strong></p><script>alert(1)</script>';
		jest.mocked( getContainer ).mockReturnValue(
			createContainerMock( 'e-button', bind, stringPropTypeUtil.create( 'Old' ) )
		);
		jest.mocked( getElementType ).mockReturnValue( {
			propsSchema: {
				text: { key: stringPropTypeUtil.key },
			},
		} as never );

		// Act.
		applyInlineTextValue( ELEMENT_ID, bind, generatedHtml );

		// Assert.
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/elements/set-settings',
			expect.objectContaining( {
				settings: {
					text: stringPropTypeUtil.create( 'Hello world' ),
				},
			} ),
			{ internal: true }
		);
	} );
} );
