import { type PregeneratedLinkItem } from '@elementor/editor-styles-repository';
import { getCanvasIframeDocument } from '@elementor/editor-v1-adapters';

import { removeProviderPregeneratedLinks, resetRemovedProviders } from '../pregenerated-links-removal';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	getCanvasIframeDocument: jest.fn(),
} ) );

function createLink( id: string, href: string, media: string = 'all' ): HTMLLinkElement {
	const link = document.createElement( 'link' );
	link.setAttribute( 'rel', 'stylesheet' );
	link.setAttribute( 'id', id );
	link.setAttribute( 'href', href );
	link.setAttribute( 'media', media );

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
			removeProviderPregeneratedLinks( 'global-classes', ( { id } ) =>
				/^global-(preview|frontend)-[a-zA-Z_-]+-css$/.test( id )
			);

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
			removeProviderPregeneratedLinks( 'document-elements-123', ( { id } ) =>
				/^local-\d+-(preview|frontend)-[a-zA-Z_-]+-css$/.test( id )
			);

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
			removeProviderPregeneratedLinks( 'global-classes', ( { id } ) =>
				/^global-(preview|frontend)-[a-zA-Z_-]+-css$/.test( id )
			);
			const afterFirstRemoval = head.querySelectorAll( 'link' ).length;

			removeProviderPregeneratedLinks( 'global-classes', ( { id } ) =>
				/^global-(preview|frontend)-[a-zA-Z_-]+-css$/.test( id )
			);
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
			removeProviderPregeneratedLinks( 'global-classes', ( { id } ) =>
				/^global-(preview|frontend)-[a-zA-Z_-]+-css$/.test( id )
			);
			removeProviderPregeneratedLinks( 'document-elements-123', ( { id } ) =>
				/^local-\d+-(preview|frontend)-[a-zA-Z_-]+-css$/.test( id )
			);

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
				removeProviderPregeneratedLinks( 'global-classes', ( { id } ) =>
					/^global-(preview|frontend)-[a-zA-Z_-]+-css$/.test( id )
				);
			} ).not.toThrow();
		} );

		it( 'should pass id, path, and media from each link to the predicate', () => {
			const head = document.createElement( 'head' );

			const link1Params = {
				id: 'test-123',
				href: 'test-123.css',
				media: 'all',
			};
			const link2Params = {
				id: 'test-456',
				href: 'alternative-test-456.css',
				media: 'screen and (max-width: 1024px)',
			};
			const link1 = createLink( link1Params.id, link1Params.href, link1Params.media );
			const link2 = createLink( link2Params.id, link2Params.href, link2Params.media );
			head.appendChild( link1 );
			head.appendChild( link2 );

			const mockDocument = { head } as Document;
			jest.mocked( getCanvasIframeDocument ).mockReturnValue( mockDocument );

			const received: PregeneratedLinkItem[] = [];
			removeProviderPregeneratedLinks( 'pregenerated-link-attrs', ( item ) => {
				received.push( item );
				return false;
			} );

			expect( received ).toMatchObject( [
				{ ...link1Params, href: link1.href },
				{ ...link2Params, href: link2.href },
			] );
		} );
	} );

	describe( 'resetRemovedProviders', () => {
		it( 'should allow re-removal after reset', () => {
			// Arrange.
			const head = createHead();
			const mockDocument = { head } as Document;
			jest.mocked( getCanvasIframeDocument ).mockReturnValue( mockDocument );

			removeProviderPregeneratedLinks( 'global-classes', ( { id } ) =>
				/^global-(preview|frontend)-[a-zA-Z_-]+-css$/.test( id )
			);
			const countAfterFirstRemoval = head.querySelectorAll( 'link' ).length;

			head.appendChild( createLink( 'global-preview-widescreen-css', 'global-preview-widescreen.css' ) );

			const countAfterAddingNewLink = head.querySelectorAll( 'link' ).length;

			// Act.
			resetRemovedProviders();
			removeProviderPregeneratedLinks( 'global-classes', ( { id } ) =>
				/^global-(preview|frontend)-[a-zA-Z_-]+-css$/.test( id )
			);

			// Assert.
			const countAfterSecondRemoval = head.querySelectorAll( 'link' ).length;
			expect( countAfterAddingNewLink ).toBe( countAfterFirstRemoval + 1 );
			expect( countAfterSecondRemoval ).toBe( countAfterFirstRemoval );
		} );
	} );
} );
