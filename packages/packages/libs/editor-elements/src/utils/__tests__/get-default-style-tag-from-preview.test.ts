import {
	getDefaultStyleTagFromPreviewElement,
	parseDefaultStyleTagFromClassList,
} from '../get-default-style-tag-from-preview';

jest.mock( '../../sync/get-container', () => ( {
	getContainer: jest.fn(),
} ) );

jest.mock( '../../sync/get-preview-element-dom', () => ( {
	getPreviewElementDOM: jest.fn(),
} ) );

import { getContainer } from '../../sync/get-container';
import { getPreviewElementDOM } from '../../sync/get-preview-element-dom';

const mockGetContainer = jest.mocked( getContainer );
const mockGetPreviewElementDOM = jest.mocked( getPreviewElementDOM );

describe( 'parseDefaultStyleTagFromClassList', () => {
	it( 'should extract the tag from an e-default-* class', () => {
		const classList = {
			*[ Symbol.iterator ]() {
				yield 'elementor-element';
				yield 'e-default-button';
			},
		} as DOMTokenList;

		expect( parseDefaultStyleTagFromClassList( classList ) ).toBe(
			'button'
		);
	} );

	it( 'should return null when no default style class exists', () => {
		const classList = {
			*[ Symbol.iterator ]() {
				yield 'elementor-element';
			},
		} as DOMTokenList;

		expect( parseDefaultStyleTagFromClassList( classList ) ).toBeNull();
	} );
} );

describe( 'getDefaultStyleTagFromPreviewElement', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should read the default style tag from the atomic render root', () => {
		const button = document.createElement( 'button' );
		button.className = 'e-button-base e-default-button';

		const wrapper = document.createElement( 'div' );
		wrapper.appendChild( button );

		mockGetContainer.mockReturnValue( {
			view: {
				el: wrapper,
				getDomElement: () => ( {
					get: () => button,
				} ),
			},
		} as never );

		expect( getDefaultStyleTagFromPreviewElement( 'element-1' ) ).toBe(
			'button'
		);
	} );

	it( 'should read the default style tag from a preview element with data-id', () => {
		const div = document.createElement( 'div' );
		div.dataset.id = 'element-2';
		div.className = 'elementor-element e-default-div';

		mockGetContainer.mockReturnValue( null );
		mockGetPreviewElementDOM.mockReturnValue( div );

		expect( getDefaultStyleTagFromPreviewElement( 'element-2' ) ).toBe(
			'div'
		);
	} );
} );
