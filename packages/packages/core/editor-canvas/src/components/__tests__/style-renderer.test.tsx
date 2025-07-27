import * as React from 'react';
import { __privateUseListenTo as useListenTo } from '@elementor/editor-v1-adapters';
import { render, screen } from '@testing-library/react';

import { useDocumentsCssLinks } from '../../hooks/use-documents-css-links';
import { useStyleItems } from '../../hooks/use-style-items';
import { StyleRenderer } from '../style-renderer';

// Mock dependencies
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateUseListenTo: jest.fn(),
	commandEndEvent: jest.fn(),
} ) );

jest.mock( '@elementor/ui', () => ( {
	Portal: jest.fn( ( { children } ) => <div data-testid="portal">{ children }</div> ),
} ) );

jest.mock( '../../hooks/use-style-items', () => ( {
	useStyleItems: jest.fn(),
} ) );

jest.mock( '../../sync/get-canvas-iframe-document', () => ( {
	getCanvasIframeDocument: jest.fn(),
} ) );

jest.mock( '../../hooks/use-documents-css-links', () => ( {
	useDocumentsCssLinks: jest.fn(),
} ) );

describe( '<StyleRenderer />', () => {
	it( 'should not render anything when container is not available', () => {
		// Arrange.
		jest.mocked( useListenTo ).mockReturnValue( null );

		// Act.
		render( <StyleRenderer /> );

		// Assert.
		// eslint-disable-next-line testing-library/no-test-id-queries
		expect( screen.queryByTestId( 'portal' ) ).not.toBeInTheDocument();
	} );

	it( 'should render styles and links in portal when container is available', () => {
		// Arrange.
		const mockContainer = document.createElement( 'div' );

		const mockCssItems = [
			{ id: 'style1', value: '.test { color: red; }', breakpoint: 'desktop' },
			{ id: 'style2', value: '.test2 { color: blue; }', breakpoint: 'desktop' },
		];

		const mockLinkAttrs = [
			{ id: 'link1', href: 'style1.css', rel: 'stylesheet', 'data-e-removed': true },
			{ id: 'link2', href: 'style2.css', rel: 'stylesheet', 'data-e-removed': true },
		];

		jest.mocked( useListenTo ).mockReturnValue( mockContainer );
		jest.mocked( useStyleItems ).mockReturnValue( mockCssItems );
		jest.mocked( useDocumentsCssLinks ).mockReturnValue( mockLinkAttrs );

		// Act.
		render( <StyleRenderer /> );

		// Assert.
		// eslint-disable-next-line testing-library/no-test-id-queries
		expect( screen.getByTestId( 'portal' ) ).toMatchSnapshot();
	} );
} );
