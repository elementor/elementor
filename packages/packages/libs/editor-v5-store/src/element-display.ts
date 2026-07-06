import { getAtomicWidgetConfig } from './catalog';
import type { ElementNode } from './types';

const CONTAINER_EL_TYPES = new Set( [
	'container',
	'e-div-block',
	'e-flexbox',
	'e-grid',
	'e-tabs',
	'e-form',
	'e-tabs-content',
	'e-collection-loop',
] );

export function isContainerElement( element: ElementNode ): boolean {
	if ( element.elType === 'widget' ) {
		return false;
	}

	if ( CONTAINER_EL_TYPES.has( element.elType ) ) {
		return true;
	}

	const config = getAtomicWidgetConfig( element.elType );

	return Boolean( config?.atomic_controls && config?.atomic_props_schema && ! element.widgetType );
}

export function canAcceptChild( elements: ElementNode[], parentId: string | null ): boolean {
	if ( parentId === null ) {
		return true;
	}

	const parent = findElementById( elements, parentId );

	return parent ? isContainerElement( parent ) : false;
}

export function findElementById( elements: ElementNode[], id: string ): ElementNode | null {
	for ( const element of elements ) {
		if ( element.id === id ) {
			return element;
		}

		const child = findElementById( element.elements ?? [], id );

		if ( child ) {
			return child;
		}
	}

	return null;
}

export function getParentId( elements: ElementNode[], targetId: string ): string | null {
	const walk = ( nodes: ElementNode[], parentId: string | null ): string | null | undefined => {
		for ( const node of nodes ) {
			if ( node.id === targetId ) {
				return parentId;
			}

			const nested = walk( node.elements ?? [], node.id );

			if ( nested !== undefined ) {
				return nested;
			}
		}

		return undefined;
	};

	return walk( elements, null ) ?? null;
}

export function getElementBreadcrumb( elements: ElementNode[], targetId: string ): ElementNode[] {
	const path: ElementNode[] = [];

	const walk = ( nodes: ElementNode[] ): boolean => {
		for ( const node of nodes ) {
			path.push( node );

			if ( node.id === targetId ) {
				return true;
			}

			if ( walk( node.elements ?? [] ) ) {
				return true;
			}

			path.pop();
		}

		return false;
	};

	walk( elements );

	return path;
}

export function getPreferredParentId( elements: ElementNode[], selectedIds: string[] ): string | null {
	const selectedId = selectedIds[ 0 ];

	if ( ! selectedId ) {
		return null;
	}

	const selected = findElementById( elements, selectedId );

	if ( selected && isContainerElement( selected ) ) {
		return selected.id;
	}

	return getParentId( elements, selectedId );
}

export function getElementLabel( element: ElementNode ): string {
	const widgetConfig = element.widgetType
		? getAtomicWidgetConfig( element.widgetType )
		: getAtomicWidgetConfig( element.elType );

	if ( widgetConfig?.title ) {
		return widgetConfig.title;
	}

	if ( element.widgetType ) {
		return element.widgetType;
	}

	return element.elType;
}

export function getAtomicStringSetting( settings: Record< string, unknown >, key: string ): string {
	const value = settings[ key ];

	if ( ! value || typeof value !== 'object' ) {
		return '';
	}

	if ( '$$type' in value && value.$$type === 'string' && 'value' in value ) {
		return String( value.value ?? '' );
	}

	return '';
}

export function getDefaultElementSettings( elType: string, widgetType?: string ): Record< string, unknown > {
	const key = widgetType ?? elType;

	switch ( key ) {
		case 'e-heading':
			return {
				title: {
					$$type: 'string',
					value: 'Add Your Heading Text Here',
				},
			};
		case 'e-paragraph':
			return {
				paragraph: {
					$$type: 'string',
					value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
				},
			};
		case 'e-button':
			return {
				text: {
					$$type: 'string',
					value: 'Click here',
				},
			};
		case 'e-flexbox':
		case 'e-div-block':
			return {
				min_height: {
					$$type: 'size',
					value: {
						unit: 'px',
						size: 120,
					},
				},
			};
		default:
			return {};
	}
}

export function getContainerLayoutSx( element: ElementNode ) {
	switch ( element.elType ) {
		case 'e-flexbox':
			return {
				display: 'flex',
				flexDirection: 'column',
				gap: 1.5,
			};
		case 'e-grid':
			return {
				display: 'grid',
				gap: 1.5,
				gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
			};
		default:
			return {
				display: 'flex',
				flexDirection: 'column',
				gap: 1.5,
			};
	}
}
