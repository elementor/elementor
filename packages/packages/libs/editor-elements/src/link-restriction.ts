import { type LinkPropValue } from '@elementor/editor-props';

import { getContainer } from './sync/get-container';
import { getElementSetting } from './sync/get-element-setting';
import { type ExtendedWindow } from './sync/types';

const ANCHOR_SELECTOR = 'a, [data-action-link]';

type LinkValue = LinkPropValue[ 'value' ];

export type LinkInLinkRestriction =
	| {
			shouldRestrict: true;
			reason: 'ancestor' | 'descendant';
			elementId: string | null;
	  }
	| {
			shouldRestrict: false;
			reason?: never;
			elementId?: never;
	  };

export function getLinkInLinkRestriction( elementId: string, resolvedValue?: LinkValue ): LinkInLinkRestriction {
	const anchoredDescendantId = getAnchoredDescendantId( elementId );

	if ( anchoredDescendantId ) {
		return {
			shouldRestrict: true as const,
			reason: 'descendant' as const,
			elementId: anchoredDescendantId,
		};
	}

	const hasInlineLink = checkForInlineLink( elementId, resolvedValue );

	if ( hasInlineLink ) {
		return {
			shouldRestrict: true as const,
			reason: 'descendant' as const,
			elementId,
		};
	}

	const ancestor = getAnchoredAncestorId( elementId );

	if ( ancestor ) {
		return {
			shouldRestrict: true as const,
			reason: 'ancestor' as const,
			elementId: ancestor,
		};
	}

	return {
		shouldRestrict: false,
	};
}

export function getAnchoredDescendantId( elementId: string ): string | null {
	const element = getElementDOM( elementId );

	if ( ! element ) {
		return null;
	}

	for ( const childAnchorElement of Array.from( element.querySelectorAll( ANCHOR_SELECTOR ) ) ) {
		// Ensure the child is not in the current element's scope
		const childElementId = findElementIdOf( childAnchorElement );

		if ( childElementId !== elementId ) {
			return childElementId;
		}
	}

	return null;
}

export function getAnchoredAncestorId( elementId: string ): string | null {
	const element = getElementDOM( elementId );

	if ( ! element || element.parentElement === null ) {
		return null;
	}

	const parentAnchor = element.parentElement.closest( ANCHOR_SELECTOR );

	return parentAnchor ? findElementIdOf( parentAnchor ) : null;
}

export function isElementAnchored( elementId: string ): boolean {
	const element = getElementDOM( elementId ) as HTMLElement;

	if ( ! element ) {
		return false;
	}

	if ( element.matches( ANCHOR_SELECTOR ) ) {
		return true;
	}

	return doesElementContainAnchor( element );
}

function doesElementContainAnchor( element: Element ): boolean {
	for ( const child of Array.from( element.children ) as HTMLElement[] ) {
		if ( isElementorElement( child ) ) {
			continue;
		}

		if ( child.matches( ANCHOR_SELECTOR ) ) {
			return true;
		}

		if ( doesElementContainAnchor( child ) ) {
			return true;
		}
	}

	return false;
}

function findElementIdOf( element: Element ): string | null {
	return element.closest< HTMLElement >( '[data-id]' )?.dataset.id || null;
}

function checkForInlineLink( elementId: string, resolvedValue?: LinkValue ): boolean {
	const element = getElementDOM( elementId );

	if ( ! element ) {
		return false;
	}

	if ( element.matches( ANCHOR_SELECTOR ) ) {
		return false;
	}

	const linkSetting = resolvedValue ?? getElementSetting< LinkPropValue >( elementId, 'link' )?.value;

	if ( linkSetting?.destination ) {
		return false;
	}

	return element.querySelector( ANCHOR_SELECTOR ) !== null;
}

function getElementDOM( id: string ) {
	try {
		const fromContainer = getContainer( id )?.view?.el;

		if ( fromContainer ) {
			return fromContainer;
		}

		// Inner elements of component instances are rendered from Twig and have
		// no V1 Backbone view, so getContainer(id) returns null. Fall back to
		// querying the preview iframe document directly so link-in-link
		// restriction still works for those elements.
		return queryPreviewDOMByElementId( id );
	} catch {
		return null;
	}
}

function queryPreviewDOMByElementId( id: string ): HTMLElement | null {
	const previewDocument = ( window as unknown as ExtendedWindow ).elementor?.getPreviewContainer?.()?.view?.el
		?.ownerDocument;

	if ( ! previewDocument ) {
		return null;
	}

	return previewDocument.querySelector< HTMLElement >( `[data-id="${ id }"]` );
}

function isElementorElement( element: Element ): boolean {
	return element.hasAttribute( 'data-id' );
}
