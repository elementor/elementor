import type { ElementNode } from '@elementor/editor-v5-store';

export function serializeElementForSave( element: ElementNode ): ElementNode {
	const serialized: ElementNode = {
		elType: element.elType,
		elements: ( element.elements ?? [] ).map( serializeElementForSave ),
		id: element.id,
		settings: element.settings ?? {},
	};

	if ( element.widgetType ) {
		serialized.widgetType = element.widgetType;
	}

	if ( element.isInner ) {
		serialized.isInner = element.isInner;
	}

	if ( element.styles ) {
		serialized.styles = element.styles;
	}

	if ( element.interactions ) {
		serialized.interactions = element.interactions;
	}

	if ( element.editor_settings ) {
		serialized.editor_settings = element.editor_settings;
	}

	return serialized;
}

export function serializeElementsForSave( elements: ElementNode[] ): ElementNode[] {
	return elements.map( serializeElementForSave );
}

export function normalizeLoadedElements( elements: unknown[] ): ElementNode[] {
	return elements.map( ( rawElement ) => normalizeLoadedElement( rawElement ) );
}

function normalizeLoadedElement( rawElement: unknown ): ElementNode {
	const element = rawElement as ElementNode;

	return {
		editor_settings: element.editor_settings,
		elType: element.elType,
		elements: normalizeLoadedElements( Array.isArray( element.elements ) ? element.elements : [] ),
		id: element.id,
		interactions: element.interactions,
		isInner: element.isInner,
		settings: element.settings ?? {},
		styles: element.styles,
		widgetType: element.widgetType,
	};
}
