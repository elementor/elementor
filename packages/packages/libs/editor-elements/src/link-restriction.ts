import { getContainer } from './sync/get-container';
import { getElementSetting } from './sync/get-element-setting';

const ANCHOR_SELECTOR = 'a, [data-action-link]';

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

export function getLinkInLinkRestriction( elementId: string ): LinkInLinkRestriction {
	const anchoredDescendantId = getAnchoredDescendantId( elementId );

	if ( anchoredDescendantId ) {
		return {
			shouldRestrict: true,
			reason: 'descendant',
			elementId: anchoredDescendantId,
		};
	}

	const hasInlineLink = checkForInlineLink( elementId );

	if ( hasInlineLink ) {
		return {
			shouldRestrict: true,
			reason: 'descendant',
			elementId,
		};
	}

	const ancestor = getAnchoredAncestorId( elementId );

	if ( ancestor ) {
		return {
			shouldRestrict: true,
			reason: 'ancestor',
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

function checkForInlineLink( elementId: string ): boolean {
	const element = getElementDOM( elementId );

	if ( ! element ) {
		return false;
	}

	if ( element.matches( ANCHOR_SELECTOR ) ) {
		return false;
	}

	const linkSetting = getElementSetting< { value?: { destination?: unknown } } >( elementId, 'link' );
	
	if ( linkSetting?.value?.destination ) {
		return false;
	}

	return element.querySelector( ANCHOR_SELECTOR ) !== null;
}

function getElementDOM( id: string ) {
	try {
		return getContainer( id )?.view?.el || null;
	} catch {
		return null;
	}
}

function isElementorElement( element: Element ): boolean {
	return element.hasAttribute( 'data-id' );
}
