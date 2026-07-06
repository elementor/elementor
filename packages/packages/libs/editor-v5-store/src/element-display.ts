import { getAtomicWidgetConfig } from './catalog';
import type { ElementNode } from './types';

const CONTAINER_EL_TYPES = new Set( [ 'container', 'e-div-block', 'e-flexbox', 'e-grid', 'e-tabs', 'e-form' ] );

export function isContainerElement( element: ElementNode ): boolean {
	if ( element.elType === 'widget' ) {
		return false;
	}

	return CONTAINER_EL_TYPES.has( element.elType );
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
		default:
			return {};
	}
}
