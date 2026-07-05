import { getAtomicWidgetConfig } from './catalog';
import type { ElementNode } from './types';

const LEGACY_ELEMENT_TYPES = new Set( [ 'section', 'column' ] );

function isAtomicNode( node: ElementNode ): boolean {
	if ( LEGACY_ELEMENT_TYPES.has( node.elType ) ) {
		return false;
	}

	if ( node.elType === 'widget' ) {
		if ( ! node.widgetType ) {
			return false;
		}

		return Boolean( getAtomicWidgetConfig( node.widgetType ) );
	}

	return Boolean( getAtomicWidgetConfig( node.elType ) );
}

function walkElements( elements: ElementNode[] ): boolean {
	for ( const element of elements ) {
		if ( ! isAtomicNode( element ) ) {
			return true;
		}

		if ( element.elements?.length && walkElements( element.elements ) ) {
			return true;
		}
	}

	return false;
}

export function isLegacyDocument( elements: ElementNode[] ): boolean {
	if ( ! elements.length ) {
		return false;
	}

	return walkElements( elements );
}
