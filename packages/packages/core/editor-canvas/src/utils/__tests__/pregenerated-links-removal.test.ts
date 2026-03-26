import { getCanvasIframeDocument } from '@elementor/editor-v1-adapters';

import { removeProviderPregeneratedLinks, resetRemovedProviders } from '../pregenerated-links-removal';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	getCanvasIframeDocument: jest.fn(),
} ) );

function createLink( id: string, href: string ): HTMLLinkElement {
	const link = document.createElement( 'link' );
	link.setAttribute( 'rel', 'stylesheet' );
	link.setAttribute( 'id', id );
	link.setAttribute( 'href', href );
	return link;
}

describe( 'pregenerated-links-removal', () => {
	const createHead = () => {
		const head = document.createElement( 'head' );
		head.appendChild( createLink( 'base-desktop-css', 'base-desktop.css' ) );
		head.appendChild( createLink( 'base-tablet-css', 'base-tablet.css' ) );
		head.appendChild( createLink( 'global-preview-desktop-css', 'global-preview-desktop.css' ) );
		head.appendChild( createLink( 'global-preview-mobile_extra-css', 'global-preview-mobile_extra.css' ) );
		head.appendChild( createLink( 'local-123-preview-desktop-css', 'local-123-preview-desktop.css' ) );
		head.appendChild( createLink( 'local-456-preview-desktop-css', 'local-456-preview-desktop.css' ) );
		head.appendChild( createLink( 'elementor-post-123-css', 'elementor-post-123.css' ) );
		head.appendChild( createLink( 'other-plugin-css', 'other-plugin.css' ) );
		return head;
	};

	beforeEach( () => {
		resetRemovedProviders();
	} );

	describe( 'removeProviderPregeneratedLinks', () => {
		it( 'should remove links matching global pattern', () => {
			// Arrange.
			const head = createHead();
			const mockDocument = { head } as Document;
			jest.mocked( getCanvasIframeDocument ).mockReturnValue( mockDocument );

			// Act.
			removeProviderPregeneratedLinks( 'global-classes', /^global-(preview|frontend)-[a-zA-Z_-]+-css$/ );

			// Assert.
			const remainingLinkIds = Array.from( head.querySelectorAll( 'link' ) ).map( ( link ) =>
				link.getAttribute( 'id' )
			);

			expect( remainingLinkIds ).not.toContain( 'global-preview-desktop-css' );
			expect( remainingLinkIds ).not.toContain( 'global-preview-mobile_extra-css' );
			expect( remainingLinkIds ).toContain( 'base-desktop-css' );
			expect( remainingLinkIds ).toContain( 'local-123-preview-desktop-css' );
			expect( remainingLinkIds ).toContain( 'other-plugin-css' );
		} );

		it( 'should remove links matching local pattern', () => {
			// Arrange.
			const head = createHead();
			const mockDocument = { head } as Document;
			jest.mocked( getCanvasIframeDocument ).mockReturnValue( mockDocument );

			// Act.
			removeProviderPregeneratedLinks( 'document-elements-123', /^local-\d+-(preview|frontend)-[a-zA-Z_-]+-css$/ );

			// Assert.
			const remainingLinkIds = Array.from( head.querySelectorAll( 'link' ) ).map( ( link ) =>
				link.getAttribute( 'id' )
			);

			expect( remainingLinkIds ).not.toContain( 'local-123-preview-desktop-css' );
			expect( remainingLinkIds ).not.toContain( 'local-456-preview-desktop-css' );
			expect( remainingLinkIds ).toContain( 'global-preview-desktop-css' );
			expect( remainingLinkIds ).toContain( 'base-desktop-css' );
		} );

		it( 'should not remove links when provider was already processed', () => {
			// Arrange.
			const head = createHead();
			const mockDocument = { head } as Document;
			jest.mocked( getCanvasIframeDocument ).mockReturnValue( mockDocument );

			const initialLinkCount = head.querySelectorAll( 'link' ).length;

			// Act.
			removeProviderPregeneratedLinks( 'global-classes', /^global-(preview|frontend)-[a-zA-Z_-]+-css$/ );
			const afterFirstRemoval = head.querySelectorAll( 'link' ).length;

			removeProviderPregeneratedLinks( 'global-classes', /^global-(preview|frontend)-[a-zA-Z_-]+-css$/ );
			const afterSecondCall = head.querySelectorAll( 'link' ).length;

			// Assert.
			expect( afterFirstRemoval ).toBeLessThan( initialLinkCount );
			expect( afterSecondCall ).toBe( afterFirstRemoval );
		} );

		it( 'should handle different providers independently', () => {
			// Arrange.
			const head = createHead();
			const mockDocument = { head } as Document;
			jest.mocked( getCanvasIframeDocument ).mockReturnValue( mockDocument );

			// Act.
			removeProviderPregeneratedLinks( 'global-classes', /^global-(preview|frontend)-[a-zA-Z_-]+-css$/ );
			removeProviderPregeneratedLinks( 'document-elements-123', /^local-\d+-(preview|frontend)-[a-zA-Z_-]+-css$/ );

			// Assert.
			const remainingLinkIds = Array.from( head.querySelectorAll( 'link' ) ).map( ( link ) =>
				link.getAttribute( 'id' )
			);

			expect( remainingLinkIds ).not.toContain( 'global-preview-desktop-css' );
			expect( remainingLinkIds ).not.toContain( 'local-123-preview-desktop-css' );
			expect( remainingLinkIds ).toContain( 'base-desktop-css' );
			expect( remainingLinkIds ).toContain( 'elementor-post-123-css' );
			expect( remainingLinkIds ).toContain( 'other-plugin-css' );
		} );

		it( 'should do nothing when iframe document is not available', () => {
			// Arrange.
			jest.mocked( getCanvasIframeDocument ).mockReturnValue( null );

			// Act & Assert - should not throw.
			expect( () => {
				removeProviderPregeneratedLinks( 'global-classes', /^global-(preview|frontend)-[a-zA-Z_-]+-css$/ );
			} ).not.toThrow();
		} );
	} );

	describe( 'resetRemovedProviders', () => {
		it( 'should allow re-removal after reset', () => {
			// Arrange.
			const head = createHead();
			const mockDocument = { head } as Document;
			jest.mocked( getCanvasIframeDocument ).mockReturnValue( mockDocument );

			removeProviderPregeneratedLinks( 'global-classes', /^global-(preview|frontend)-[a-zA-Z_-]+-css$/ );
			const countAfterFirstRemoval = head.querySelectorAll( 'link' ).length;

			head.appendChild( createLink( 'global-preview-widescreen-css', 'global-preview-widescreen.css' ) );

			const countAfterAddingNewLink = head.querySelectorAll( 'link' ).length;

			// Act.
			resetRemovedProviders();
			removeProviderPregeneratedLinks( 'global-classes', /^global-(preview|frontend)-[a-zA-Z_-]+-css$/ );

			// Assert.
			const countAfterSecondRemoval = head.querySelectorAll( 'link' ).length;
			expect( countAfterAddingNewLink ).toBe( countAfterFirstRemoval + 1 );
			expect( countAfterSecondRemoval ).toBe( countAfterFirstRemoval );
		} );
	} );
} );
