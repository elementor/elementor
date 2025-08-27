import { getContainer } from './sync/get-container';

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

	for ( const childAnchorElement of Array.from( element.querySelectorAll( 'a' ) ) ) {
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

	const parentAnchor = element.parentElement.closest( 'a' );

	return parentAnchor ? findElementIdOf( parentAnchor ) : null;
}

export function isElementAnchored( elementId: string ): boolean {
	const element = getElementDOM( elementId );

	if ( ! element ) {
		return false;
	}

	if ( isAnchorTag( element.tagName ) ) {
		return true;
	}

	return doesElementContainAnchor( element );
}

function doesElementContainAnchor( element: Element ): boolean {
	for ( const child of element.children ) {
		if ( isElementorElement( child ) ) {
			continue;
		}

		if ( isAnchorTag( child.tagName ) ) {
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

function getElementDOM( id: string ) {
	try {
		return getContainer( id )?.view?.el || null;
	} catch {
		return null;
	}
}

function isAnchorTag( tagName: string ): boolean {
	return tagName.toLowerCase() === 'a';
}

function isElementorElement( element: Element ): boolean {
	return element.hasAttribute( 'data-id' );
}
